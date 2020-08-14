const confs = ['east','west'];
const rounds = ['fr','sf','cf','finals']



// Sidebar creators

const buildPlayinDiv = ()=>{
    const playinDiv = document.createElement('div');
    playinDiv.id = 'playin-form';
    playinDiv.classList.add('sidebar-form')
    playinDiv.innerHTML = `
    <p>Who Will Win The Play-in Tournument ?</p>
    <input type="radio" id="team1" name="playin" value="${playinTeams[1]}">
    <label for="team1">${teamInfo[playinTeams[1]].teamName}</label>
    <br>
    <input type="radio" id="team2" name="playin" value="${playinTeams[2]}">
    <label for="team2">${teamInfo[playinTeams[2]].teamName}</label>
    `;
    for(let input of playinDiv.querySelectorAll('input')){
        input.addEventListener('input',(e)=>{
            if(e.target.checked){ //relevent ??
                const prevWinning = document.querySelector('#west-fr-1 .away-team');
                if(prevWinning){
                    clearRoute(prevWinning.abbrv,'NA');
                }
                const newWinner = createTeamBox(e.target.value,'west-fr-1','away')
                document.querySelector('#west-fr-1').append(newWinner);
            }
        })
    }
    sidebar.prepend(playinDiv)
} 
// Initial bracket build
const buildBracketDivs = ()=>{
    for (let conf of confs){
        for(let round of rounds){
            if(round==='finals') continue;
            for(let matchup=1;matchup<=4;matchup++){
                if((round==='sf' && matchup>=3) || (round==='cf' && matchup>=2)){
                    break;
                }
                createBracketDiv(`${conf}-${round}-${matchup}`)
            }
        }
    }
    createBracketDiv('all-finals-1');
}

/*
Creator for a bracketDiv - containers 2 teamBoxes (home team and away team)
*/
const createBracketDiv = (matchup) => {
    const div = document.createElement('div');
    div.classList.add('bracket-box');
    div.id = matchup;
    const [homeTeamAbbrv,awayTeamAbbrv] = getTeamAbbrvs(matchup);
    if(homeTeamAbbrv!=='NA'){
        const homeTeam = createTeamBox(homeTeamAbbrv,matchup,'home');
        div.append(homeTeam);
    }
    if(awayTeamAbbrv!=='NA'){
        const awayTeam = createTeamBox(awayTeamAbbrv,matchup,'away');
        div.append(awayTeam);
    }
    container.appendChild(div);
}

/*
Input : team name abbriviation, matchup string id, and side (home/away)
Creator for TeamBox - including the image, text, and games-won input
*/
const createTeamBox = (teamAbbrv,matchup,side)=>{
    const [conf,round,series] = matchup.split('-');
    const seeds = conf==='east' ? eastSeeds : westSeeds;
    const team = document.createElement('div');
    team.abbrv = teamAbbrv;
    const teamImg = document.createElement('img');
    teamImg.classList.add('team-image');
    teamImg.src = teamInfo[teamAbbrv].teamImg;
    const teamName = document.createElement('div');
    teamName.innerHTML = `(${seeds.indexOf(teamAbbrv) >= 0 ? seeds.indexOf(teamAbbrv)  : 8})<span class="team-name-text"> ${teamInfo[teamAbbrv].teamName}</span>
     <span class="team-record">(${teamInfo[teamAbbrv].teamRecord})</span>`;
    teamName.classList.add('team-name');
    const teamInput = createTeamInput(matchup,side);
    team.append(teamImg,teamName,teamInput);
    team.classList.add('team',`${side}-team`);
    return team;
}

/*
Creator for the team input (in teamBox) , including all HTML attrs and eventListener for changes.
This is the main logic for filling up the bracket with scores
*/
const createTeamInput = (matchup,side)=>{
    const [,round,series] = matchup.split("-");
    const teamInput = document.createElement('input');
    teamInput.type = 'number';
    teamInput.min = "0";
    teamInput.max = "4";
    teamInput.name = `${matchup}|${side}`;
    teamInput.classList.add('team-input');
    teamInput.addEventListener('input',inputEventListener);
    return teamInput;
}

// DEAL WITH NEXT MATCHUP FOR FINALS INPUT
const inputEventListener = (e)=>{
        const [matchup,side] = e.target.name.split("|");
        const [,round,] = matchup.split("-");
        // Input's Team information
        const newValue = e.target.value;
        const bracketBox = e.target.parentNode.parentNode;
        const teamAbbrv = e.target.parentNode.abbrv;
        // Other Team information
        const otherTeamSide = side === 'home' ? 'away' : 'home';
        const otherTeamInput = bracketBox.querySelector(`.${otherTeamSide}-team input`);
        if(!otherTeamInput){ //if there's no other team, ignore input changes for now
            return;
        }
        const otherTeamValue = otherTeamInput.value;
        const otherTeamAbbrv = otherTeamInput.parentNode.abbrv;
        if(round==='finals'){
            const winnerBox = document.querySelector('#winner-box-text');
            if(newValue === '4'){
                winnerBox.innerHTML = `<strong>${teamInfo[teamAbbrv].teamName}<strong>`;
            } else if (otherTeamValue === '4'){
                winnerBox.innerHTML = `<strong>${teamInfo[otherTeamAbbrv].teamName}<strong>`;
            } else {
                winnerBox.innerHTML = ``;
            }
            return;
        }
        // Look for the next placement of a winning team
        const [nextMatchupId, newSide] = getNextMatchupId(matchup);
        const nextMatchup = document.querySelector(`#${nextMatchupId}`);
        // Main Logic
        if(newValue === '4'){ // This input's team should win
            // Check if there's a previous selected winner, if so remove it and all it's further bracket implications.
            const prevWinning = nextMatchup.querySelector(`.${newSide}-team`)
            if(prevWinning){
                clearRoute(prevWinning.abbrv,round);
            }
            // Create a NEW teamBox for the new selected series winner
            const newTeam = createTeamBox(teamAbbrv,nextMatchupId,newSide);
            nextMatchup.append(newTeam);
        }
        else { //newValue !== 4
            if(otherTeamValue === '4'){ // other team should be selected as winners
                const prevWinning = nextMatchup.querySelector(`.${newSide}-team`) 
                if(prevWinning && prevWinning.abbrv !== otherTeamAbbrv){ 
                    // check for previous selected winner, if it exists and it is NOT the 'other team' we must clear it
                    clearRoute(prevWinning.abbrv,round);
                    // create a NEW teamBox for OTHER TEAM as selected series winner
                    const newTeam = createTeamBox(otherTeamAbbrv,nextMatchupId,newSide);
                    nextMatchup.append(newTeam);
                } else if(!prevWinning){ // if no previous team was selected winner, assign 'other team' as the winner
                    const newTeam = createTeamBox(otherTeamAbbrv,nextMatchupId,newSide);
                    nextMatchup.append(newTeam);
                }
            }else{ // if no team is now with 4 games won, be sure to clear route of any previous selected winner (if exists)
                const prevWinning = nextMatchup.querySelector(`.${newSide}-team`)
                if(prevWinning){
                    clearRoute(prevWinning.abbrv,round);
                }
            }
    }
}
/*
The function clears all instances of teamBox for teamAbbrv in a round further than roundBound
*/
const clearRoute = (teamAbbrv,roundBound)=>{
    const teamBoxes = [...document.querySelectorAll('div .team')];
    const toRemove = teamBoxes.filter(teamBox => {
        const teamBoxRound = teamBox.querySelector('input').name.split("|")[0].split("-")[1];
        return (teamBox.abbrv === teamAbbrv) && (rounds.indexOf(teamBoxRound) > rounds.indexOf(roundBound));
    })
    for(let box of toRemove){
        box.remove();
    }
};

/*
Given a current matchup string id, calculates the next matchup and side for winner of this matchup.
*/
const getNextMatchupId = (matchupStr)=>{
    const [conf,round,matchup] = matchupStr.split("-");
    let newSide = Number(matchup)%2 === 0 ? 'away' : 'home';
    if(round === 'cf'){
        newSide = conf==='east' ? 'home' : 'away'
        return ['all-finals-1',newSide];
    } else if (round === 'sf'){
        return [`${conf}-cf-1`,newSide]
    }
    else{ // round === 'fr'
    const newMatchup = Number(matchup) <= 2 ? 1 : 2;
    return [`${conf}-sf-${newMatchup}`,newSide]
    }
}

/*
Helper function for the init bracket building
Builds fr matchups based on seeding
*/
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