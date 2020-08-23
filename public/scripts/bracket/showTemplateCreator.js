/*
SHOW METHODS:
Basically, build the edit form (parse DB predictions onto the form) and then replace all inputs with a 'solid' text.
*/

const replaceScoreInputs = ()=>{
    const inputs = container.querySelectorAll('input');
    for(let input of inputs){
        let score = input.value;
        let parentNode = input.parentNode;
        input.remove();
        let showScoreDiv = document.createElement('div');
        showScoreDiv.classList.add('show-score');
        showScoreDiv.innerText = score;
        parentNode.append(showScoreDiv);
    }
}

const removeBracketName = ()=>{
    const nameInput = sidebar.querySelector("input[name='bracketName']")
    const submitButton = sidebar.querySelector('button')
    nameInput.remove();
    submitButton.remove();
}

const removePlayinForm = ()=>{
    const playinForm = sidebar.querySelector('#playin-form');
    console.log(playinForm);
    playinForm.remove();
}

replaceScoreInputs();
removeBracketName();
removePlayinForm();