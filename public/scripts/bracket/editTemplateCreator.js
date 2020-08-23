const container = document.querySelector('.bracket-container');
const sidebar = document.querySelector('.sidebar')
const bracket = getBracketObject();
const predictions = bracket.predictions;
// Init calls:
buildBracketDivs();
buildPlayinDiv();

/*
EDIT METHODS:
Parsing previously submitted predictions onto the HTML structure of the bracket form,
using the data from the DB and re-filling the bracket with input events.
Notice that the work is async since we want to fill the predictions by round (as each round based on the previous one).
*/

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

const assignRound = (conf,round,matchup)=>{
    let homeInput = container.querySelector(`input[name='${conf}-${round}-${matchup}|home']`);
    let awayInput = container.querySelector(`input[name='${conf}-${round}-${matchup}|away']`);
    let homeTeamName = container.querySelector(`#${conf}-${round}-${matchup} .home-team .team-name-text`).innerText;
    let awayTeamName = container.querySelector(`#${conf}-${round}-${matchup} .away-team .team-name-text`).innerText;
    let matchupResults = predictions[`${conf}-${round}-${matchup}`];
    let winningTeam = ' '+matchupResults.winningTeam;
    homeInput.value = homeTeamName === winningTeam ? matchupResults.winningScore : matchupResults.losingScore;
    awayInput.value = homeTeamName === winningTeam ? matchupResults.losingScore : matchupResults.winningScore;
    homeInput.dispatchEvent(new Event('input'));
    awayInput.dispatchEvent(new Event('input'));
}

/* Pull out main logic to seperate function*/
const assignFirstRound = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            for(matchup=1;matchup<=4;matchup++){
                assignRound(conf,'fr',matchup);
            }
        }
        res();
    })
}

const assignSemiFinals = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            for(matchup=1;matchup<=2;matchup++){
                assignRound(conf,'sf',matchup);
            }
        }
        res();
    })
}

const assignConfFinals = ()=>{
    return new Promise((res,rej)=>{
        for(conf of confs){
            assignRound(conf,'cf','1');
        }
        res();
    })
}
const assignFinals = ()=>{
    return new Promise((res,rej)=>{
        assignRound('all','finals','1');
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
        console.log(err);
    }
}

//Actual calls:
buildEditForm();