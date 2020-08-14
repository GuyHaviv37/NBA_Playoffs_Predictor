const Bracket = require("../../models/bracket");
const {teamInfo} = require('./teamInfo')
const moment = require('moment');

const SUBMIT_DEADLINE =  '2020-08-17';
const PLAYIN_DEADLINE =  '2020-08-15';

westSeeds = ['west','LAL','LAC','DEN','OKC','HOU','UTA','DAL','NA'];
eastSeeds = ['east','MIL','TOR','BOS','MIA','IND','PHI','BKN','ORL']
playinTeams = ['playin','POR','MEM']

const calculateMatchupScore = (adminBracket,userBracket,pred)=>{
        let [,round,] = pred.split("-");
        let adder = 0;
        if(userBracket.predictions[pred].winningTeam === adminBracket.predictions[pred].winningTeam){
            switch(round){
                case 'fr': adder += 10; break;
                case 'sf': adder += 20; break;
                case 'cf': adder += 30; break;
                case 'finals' : adder += 50; break;
            }
        }
        if((userBracket.predictions[pred].losingTeam === adminBracket.predictions[pred].losingTeam) && 
        (userBracket.predictions[pred].losingScore === adminBracket.predictions[pred].losingScore)){
            switch(round){
                case 'fr': adder += 10; break;
                case 'sf': adder += 20; break;
                case 'cf': adder += 30; break;
                case 'finals' : adder += 50; break;
            }
        }
        return adder;
}

const calculateMatchupPotScore = (adminBracket,userBracket,eliminated,pred,basicScore)=>{
    let subber = 0;
    const adminPreds = adminBracket.predictions;
    const userPreds = userBracket.predictions;
    if(adminPreds[pred].winningScore === 0 && adminPreds[pred].losingScore === 0){ //matchup not decided
        if(eliminated.includes(userPreds[pred].winningTeam)){
            subber -= (basicScore*2);
        } else {
            if(eliminated.includes(userPreds[pred].winningTeam)){
                subber -= basicScore;
            }
        }
    }
    else{ //matchup decided
        subber -= ((basicScore*2)-calculateMatchupScore(adminBracket,userBracket,pred));
        if(subber === -(basicScore*2)){ // failed winner
            eliminated.push(userPreds[pred].winningTeam);
            eliminated.push(userPreds[pred].losingTeam);
        }
    }
    return subber;
}

const calculateScore = (adminBracket,userBracket)=>{
    let newScore = 0;
    if(adminBracket.predictions.playin && (adminBracket.predictions.playin === userBracket.predictions.playin)
        && (moment(PLAYIN_DEADLINE).isAfter(moment(userBracket.lastUpdated)))){
        newScore+=10;
    }
    for(pred in adminBracket.predictions){
        if((adminBracket.predictions[pred].winningScore === 0 && adminBracket.predictions[pred].losingScore === 0) || (pred === 'playin')){
            continue;
        }
        //else
        let adder = calculateMatchupScore(adminBracket,userBracket,pred);
        newScore+=adder;
    }
    return newScore;
}

const calculatePotScore = (adminBracket,userBracket)=>{
    const confs = ['east','west'];
    let newPotScore = 550;
    const eliminated = [];
    const adminPreds = adminBracket.predictions;
    const userPreds = userBracket.predictions;
    // Playins
    if(moment(userBracket.lastUpdated).isAfter(moment(PLAYIN_DEADLINE))){
        newPotScore -= 10 ; // NO ELIMINATED
    }    
    else if(adminPreds.playin && (adminPreds.playin !== userPreds.playin)){
        eliminated.push(teamInfo[userPreds.playin].teamName);
        newPotScore -= 10;
    }
    // First Round
    for(let conf of confs){
        for(let matchup=1;matchup<=4;matchup++){
            let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`${conf}-fr-${matchup}`,10);;
            newPotScore += subber;
        }
    }
    // Semi-Finals and Conf-Finals
    for(let conf of confs){
        for(let matchup=1;matchup<=2;matchup++){
            let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`${conf}-sf-${matchup}`,20);;
            newPotScore += subber;
        }
    }

    for(let conf of confs){
        let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`${conf}-cf-1`,30);;
        newPotScore += subber;
    }

    // Finals
    let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`all-finals-1`,50);;
    newPotScore += subber;

    return newPotScore;
}


module.exports = {
    parsePredictions(body){
        const confs = ['east','west']
        const result = {};
        result.playin = body.playin;
        westSeeds[8] = body.playin;
        // First Round Parse:
        for(let matchup=1;matchup<=4;matchup++){
            for(let conf of confs){
                let seeds = conf === 'east' ? eastSeeds : westSeeds;
                homeTeam = teamInfo[seeds[matchup]].teamName;
                awayTeam = teamInfo[seeds[9-matchup]].teamName;
                homeTeamScore = body[`${conf}-fr-${matchup}|home`] ? body[`${conf}-fr-${matchup}|home`] : 0;
                awayTeamScore = body[`${conf}-fr-${matchup}|away`] ? body[`${conf}-fr-${matchup}|away`] : 0;
                if(homeTeamScore === '4'){
                    result[`${conf}-fr-${matchup}`] = {
                        winningTeam : homeTeam,
                        winningScore : homeTeamScore,
                        losingTeam : awayTeam,
                        losingScore : awayTeamScore
                    }
                } else {
                    result[`${conf}-fr-${matchup}`] = {
                        winningTeam : awayTeam,
                        winningScore : awayTeamScore,
                        losingTeam : homeTeam,
                        losingScore : homeTeamScore
                    }
                }
            }
        }
        // Semi-Finals parse:
        for(let matchup=1;matchup<=2;matchup++){
            for(let conf of confs){
                homeTeam = result[`${conf}-fr-${matchup === 1 ? 1:3}`].winningTeam;
                awayTeam = result[`${conf}-fr-${matchup === 1 ? 2:4}`].winningTeam;
                homeTeamScore = body[`${conf}-sf-${matchup}|home`] ? body[`${conf}-sf-${matchup}|home`] : 0;
                awayTeamScore = body[`${conf}-sf-${matchup}|away`] ? body[`${conf}-sf-${matchup}|away`] : 0;
                if(homeTeamScore === '4'){
                    result[`${conf}-sf-${matchup}`] = {
                        winningTeam : homeTeam,
                        winningScore : homeTeamScore,
                        losingTeam : awayTeam,
                        losingScore : awayTeamScore
                    }
                } else {
                    result[`${conf}-sf-${matchup}`] = {
                        winningTeam : awayTeam,
                        winningScore : awayTeamScore,
                        losingTeam : homeTeam,
                        losingScore : homeTeamScore
                    }
                }
            }
        }
        // Conf-Finals parse
        for(let conf of confs){
            homeTeam = result[`${conf}-sf-1`].winningTeam;
            awayTeam = result[`${conf}-sf-2`].winningTeam;
            homeTeamScore = body[`${conf}-cf-1|home`] ? body[`${conf}-cf-1|home`] : 0;
            awayTeamScore = body[`${conf}-cf-1|away`] ? body[`${conf}-cf-1|away`] : 0;
            if(homeTeamScore === '4'){
                result[`${conf}-cf-1`] = {
                    winningTeam : homeTeam,
                    winningScore : homeTeamScore,
                    losingTeam : awayTeam,
                    losingScore : awayTeamScore
                }
            } else {
                result[`${conf}-cf-1`] = {
                    winningTeam : awayTeam,
                    winningScore : awayTeamScore,
                    losingTeam : homeTeam,
                    losingScore : homeTeamScore
                }
            }
        }
        // Finals parse:
        let winner;
        homeTeam = result[`east-cf-1`].winningTeam;
        awayTeam = result[`west-cf-1`].winningTeam;
        homeTeamScore = body[`all-finals-1|home`] ? body[`all-finals-1|home`] : 0;
        awayTeamScore = body[`all-finals-1|away`] ? body[`all-finals-1|away`] : 0;
        if(homeTeamScore === '4'){
            result[`all-finals-1`] = {
                winningTeam : homeTeam,
                winningScore : homeTeamScore,
                losingTeam : awayTeam,
                losingScore : awayTeamScore
            }
            winner = homeTeam;
        } else {
            result[`all-finals-1`] = {
                winningTeam : awayTeam,
                winningScore : awayTeamScore,
                losingTeam : homeTeam,
                losingScore : homeTeamScore
            }
            winner = awayTeam;
        }
        return [result,winner];
    },
    updateScores(adminBracket){
        return new Promise(async (res,rej)=>{
            const brackets = await Bracket.find({});
            for(let bracket of brackets){ // update score
                bracket.score = calculateScore(adminBracket,bracket);
                bracket.potentialScore = calculatePotScore(adminBracket,bracket);
                await bracket.save();
            }
            brackets.sort((a,b)=> b.score - a.score); //sort by score to update rank
            const noAdminBrackets = brackets.filter(bracket => !(bracket.isAdminBracket))
            for(let i=1;i<=noAdminBrackets.length;i++){ //update rank
                noAdminBrackets[i-1].rank = i.toString();
                await noAdminBrackets[i-1].save();
            }
            res();
        })
    },
    SUBMIT_DEADLINE,
    PLAYIN_DEADLINE
}