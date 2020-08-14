const container = document.querySelector('.bracket-container');
const sidebar = document.querySelector('.sidebar')
const bracket = getBracketObject();
const predictions = bracket.predictions;
// Init calls:
buildBracketDivs();
buildPlayinDiv();


const assignBracketName = ()=>{
    const bracketNameInput = sidebar.querySelector("input[type='text']")
    bracketNameInput.value = bracket.bracketName;
}


// assign playin result
const assignPlayin = ()=>{
    return new Promise((res,rej)=>{
        const playinInputs = sidebar.querySelectorAll("input[type='radio']");
        const playinWinner = [...playinInputs].find(input=> input.value === predictions.playin);
        playinWinner.checked = true;
        playinWinner.dispatchEvent(new Event('input'));
        res();
    })
}
const assignFirstRound = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            for(matchup=1;matchup<=4;matchup++){
                let homeInput = container.querySelector(`input[name='${conf}-fr-${matchup}|home']`);
                let awayInput = container.querySelector(`input[name='${conf}-fr-${matchup}|away']`);
                let homeTeamName = container.querySelector(`#${conf}-fr-${matchup} .home-team .team-name-text`).innerText;
                let awayTeamName = container.querySelector(`#${conf}-fr-${matchup} .away-team .team-name-text`).innerText;
                let matchupResults = predictions[`${conf}-fr-${matchup}`];
                let winningTeam = ' '+matchupResults.winningTeam;
                homeInput.value = homeTeamName === winningTeam ? matchupResults.winningScore : matchupResults.losingScore;
                awayInput.value = homeTeamName === winningTeam ? matchupResults.losingScore : matchupResults.winningScore;
                homeInput.dispatchEvent(new Event('input'));
                awayInput.dispatchEvent(new Event('input'));
            }
        }
        res();
    })
}

const assignSemiFinals = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            for(matchup=1;matchup<=2;matchup++){
                let homeInput = container.querySelector(`input[name='${conf}-sf-${matchup}|home']`);
                let awayInput = container.querySelector(`input[name='${conf}-sf-${matchup}|away']`);
                let homeTeamName = container.querySelector(`#${conf}-sf-${matchup} .home-team .team-name-text`).innerText;
                let awayTeamName = container.querySelector(`#${conf}-sf-${matchup} .away-team .team-name-text`).innerText;
                let matchupResults = predictions[`${conf}-sf-${matchup}`];
                let winningTeam = ' '+matchupResults.winningTeam;
                homeInput.value = homeTeamName === winningTeam ? matchupResults.winningScore : matchupResults.losingScore;
                awayInput.value = homeTeamName === winningTeam ? matchupResults.losingScore : matchupResults.winningScore;
                homeInput.dispatchEvent(new Event('input'));
                awayInput.dispatchEvent(new Event('input'));
            }
        }
        res();
    })
}

const assignConfFinals = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            let homeInput = container.querySelector(`input[name='${conf}-cf-1|home']`);
            let awayInput = container.querySelector(`input[name='${conf}-cf-1|away']`);
            let homeTeamName = container.querySelector(`#${conf}-cf-1 .home-team .team-name-text`).innerText;
            let awayTeamName = container.querySelector(`#${conf}-cf-1 .away-team .team-name-text`).innerText;
            let matchupResults = predictions[`${conf}-cf-1`];
            let winningTeam = ' '+matchupResults.winningTeam;
            homeInput.value = homeTeamName === winningTeam ? matchupResults.winningScore : matchupResults.losingScore;
            awayInput.value = homeTeamName === winningTeam ? matchupResults.losingScore : matchupResults.winningScore;
            homeInput.dispatchEvent(new Event('input'));
            awayInput.dispatchEvent(new Event('input'));
        }
        res();
    })
}
const assignFinals = ()=>{
    return new Promise((res,rej)=>{
        let homeInput = container.querySelector(`input[name='all-finals-1|home']`);
        let awayInput = container.querySelector(`input[name='all-finals-1|away']`);
        let homeTeamName = container.querySelector(`#all-finals-1 .home-team .team-name-text`).innerText;
        let awayTeamName = container.querySelector(`#all-finals-1 .away-team .team-name-text`).innerText;
        let matchupResults = predictions[`all-finals-1`];
        let winningTeam = ' '+matchupResults.winningTeam;
        homeInput.value = homeTeamName === winningTeam ? matchupResults.winningScore : matchupResults.losingScore;
        awayInput.value = homeTeamName === winningTeam ? matchupResults.losingScore : matchupResults.winningScore;
        homeInput.dispatchEvent(new Event('input'));
        awayInput.dispatchEvent(new Event('input'));
        res();
    })
}



const buildEditForm = async ()=>{
    try{
        assignBracketName();
        await assignPlayin();
        await assignFirstRound();
        await assignSemiFinals();
        await assignConfFinals();
        await assignFinals();
    } catch (err) {
        //Really nothing of signifigance here
    }
}

//Actual calls:
buildEditForm();