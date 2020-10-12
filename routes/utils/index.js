const Bracket = require("../../models/bracket");
const {teamInfo} = require('./teamInfo')
const moment = require('moment');

const SUBMIT_DEADLINE =  '2020-08-17';
const PLAYIN_DEADLINE =  '2020-08-15T16:00:00';
const IS_GAME_OVER = true; // changed 13/10/20

westSeeds = ['west','LAL','LAC','DEN','OKC','HOU','UTA','DAL','NA'];
eastSeeds = ['east','MIL','TOR','BOS','MIA','IND','PHI','BKN','ORL']
playinTeams = ['playin','POR','MEM']

/*NEEDS REVIEWING*/

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

const calculateMatchupPotScore = (adminBracket,userBracket,eliminated,pred,basicScore)=>{
    let subber = 0;
    const adminPreds = adminBracket.predictions;
    const userPreds = userBracket.predictions;
    if(adminPreds[pred].winningScore === 0 && adminPreds[pred].losingScore === 0){ //matchup not decided
        if(eliminated.includes(userPreds[pred].winningTeam)){
            // user's winning team has been already eliminated from the playoffs - no chance at points
            subber -= (basicScore*2);
        } else {
            if(eliminated.includes(userPreds[pred].losingTeam)){
                subber -= basicScore;
            }
        }
    }
    else{ //matchup decided
        subber -= ((basicScore*2)-calculateMatchupScore(adminBracket,userBracket,pred));
        if(subber === -(basicScore*2)){ // failed winner === zero points
            eliminated.push(userPreds[pred].winningTeam);
            eliminated.push(userPreds[pred].losingTeam);
        }
    }
    return subber;
}


const calculatePotScore = (adminBracket,userBracket)=>{
    const confs = ['east','west'];
    let newPotScore = 550;
    const eliminated = [];
    const adminPreds = adminBracket.predictions;
    const userPreds = userBracket.predictions;
    // Playins
    if(moment(userBracket.lastUpdated).isAfter(moment(PLAYIN_DEADLINE))){
        newPotScore -= 10 ; // NO ELIMINATED , playin bonus deduction
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
    // Semi-Finals 
    for(let conf of confs){
        for(let matchup=1;matchup<=2;matchup++){
            let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`${conf}-sf-${matchup}`,20);;
            newPotScore += subber;
        }
    }
    // Conf-Finals
    for(let conf of confs){
        let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`${conf}-cf-1`,30);;
        newPotScore += subber;
    }

    // Finals
    let subber = calculateMatchupPotScore(adminBracket,userBracket,eliminated,`all-finals-1`,50);;
    newPotScore += subber;

    return newPotScore;
}

const getTeamAbbrvs = (matchupStr)=>{
    const [conf,round,matchup] = matchupStr.split('-');
    if(round !== 'fr'){
        return ['NA','NA']
    }
    if(conf === 'east'){
        switch(matchup){
            case '1': return [eastSeeds[1],eastSeeds[8]]
            case '2': return [eastSeeds[4],eastSeeds[5]]
            case '3': return [eastSeeds[2],eastSeeds[7]]
            case '4': return [eastSeeds[3],eastSeeds[6]]
        }
    } else{
        switch(matchup){
            case '1': return [westSeeds[1],westSeeds[8]]
            case '2': return [westSeeds[4],westSeeds[5]]
            case '3': return [westSeeds[2],westSeeds[7]]
            case '4': return [westSeeds[3],westSeeds[6]]
        }
    }
}

const parseRound = (body,result,conf,round,matchup,prevRound)=>{
    let homeSeed,awaySeed,homeTeam,awayTeam;
    switch(prevRound){
        case 'NA':
            homeSeed = getTeamAbbrvs(`${conf}-${round}-${matchup}`)[0]
            awaySeed = getTeamAbbrvs(`${conf}-${round}-${matchup}`)[1]
            homeTeam = teamInfo[homeSeed].teamName;
            awayTeam = teamInfo[awaySeed].teamName;
            break;
        case 'fr':
            homeTeam = result[`${conf}-${prevRound}-${matchup === 1 ? 1:3}`].winningTeam;
            awayTeam = result[`${conf}-${prevRound}-${matchup === 1 ? 2:4}`].winningTeam;
            break;
        case 'sf':
            homeTeam = result[`${conf}-${prevRound}-1`].winningTeam;
            awayTeam = result[`${conf}-${prevRound}-2`].winningTeam;
            break;
        case 'cf':
            homeTeam = result[`east-${prevRound}-1`].winningTeam;
            awayTeam = result[`west-${prevRound}-1`].winningTeam;
            break;
    }
    let winner;
    let homeTeamScore = body[`${conf}-${round}-${matchup}|home`] ? body[`${conf}-${round}-${matchup}|home`] : 0;
    let awayTeamScore = body[`${conf}-${round}-${matchup}|away`] ? body[`${conf}-${round}-${matchup}|away`] : 0;
    if(homeTeamScore === '4'){
        result[`${conf}-${round}-${matchup}`] = {
            winningTeam : homeTeam,
            winningScore : homeTeamScore,
            losingTeam : awayTeam,
            losingScore : awayTeamScore
        }
        winner = homeTeam;
    } else {
        result[`${conf}-${round}-${matchup}`] = {
            winningTeam : awayTeam,
            winningScore : awayTeamScore,
            losingTeam : homeTeam,
            losingScore : homeTeamScore
        }
        winner = awayTeam;
    }
    return winner;
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
                parseRound(body,result,conf,'fr',matchup,'NA');
            }
        }
        // Semi-Finals parse:
        for(let matchup=1;matchup<=2;matchup++){
            for(let conf of confs){
                parseRound(body,result,conf,'sf',matchup,'fr');
            }
        }
        // Conf-Finals parse
        for(let conf of confs){
            parseRound(body,result,conf,'cf','1','sf');
        }
        // Finals parse:
        const winner = parseRound(body,result,'all','finals','1','cf');
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
    PLAYIN_DEADLINE,
    IS_GAME_OVER
}