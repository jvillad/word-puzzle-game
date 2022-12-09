"use strict"
const MAX_ANSWER_LENGTH = 5; 
const NUMBER_OF_ROUNDS = 6;
const allLetters = document.querySelectorAll('.letter') // getting all the letters
const loadingDiv = document.querySelector('.info-bar') //loading indicator
const messageBar = document.querySelector('.status')
let currentGuess = '';
let currentRow = 0;
let done = false;

let isLoading = true;

async function init() {
    
    // api call to get the word
    const response = await fetch("https://words.dev-apis.com/word-of-the-day");
    // parsing if 200
    const responseObj = await response.json();
 
    const wordOfTheDay = responseObj.word.toUpperCase();
    
    const wordOfTheDayParts = wordOfTheDay.split('');
    

    // hide loading icon if word exist
    setLoading(false);
    isLoading = false;

    //added function name for debugging purposes and tracking of error instead of anonymous function
    document.addEventListener('keydown', function handleKeyPress(event) {

        if (done || isLoading ) {
            // do nothing;
            return;
        }
       
        //records user keypress
        const userAction = event.key;
        if (userAction === 'Enter') {
            commitGuess();
        } else if (userAction === 'Backspace') {
            backspaceKey();   
        } else if (isLetter(userAction)) {
            addLetter(userAction.toUpperCase())
        } else {
            //ignore all except the above keypresses 
            //do nothing
        } 

    });


    /***
     * Function responsible for placing letter in the square box
     */
    function addLetter(letter) {

        
        if (currentGuess.length < MAX_ANSWER_LENGTH) {
            
            currentGuess += letter;
        } else {
            currentGuess  = currentGuess.substring(0, currentGuess.length - 1) + letter; // replace the last etter
        }
        
        // determine which row to place letter
        allLetters[MAX_ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    function backspaceKey() {
        
        currentGuess = currentGuess.substring(0, currentGuess.length - 1); // get the last char 
        allLetters[MAX_ANSWER_LENGTH * currentRow + currentGuess.length].innerText = ''; // replace the last char with empty string
    }

    /***
     * Function responsible for handling if validaiton of the word, win or lose, correct/close/wrong word
     */
    async function commitGuess() {

        // check if maximum letter length of guess is 5 letters
        if (currentGuess.length !== MAX_ANSWER_LENGTH) {
            //do nothing, exit funtion
            return;
        }

        isLoading = true;
        setLoading(true);
        //Api call to check if user entered is a valid word
        const response = await fetch('https://words.dev-apis.com/validate-word', {
            method: "POST",
            body: JSON.stringify({ word:currentGuess })
        });
    
        const responsObject = await response.json();
        const validWord = responsObject.validWord;
    
        isLoading = false;
        setLoading(false);
    
        if (!validWord) {
            invalidWord();
            return;
        }
        
        // marking if "correct" "close" or "wrong"
        answerCheck(currentGuess, wordOfTheDayParts)

        currentRow++;

        if (currentGuess === wordOfTheDay) {
            // if the current guess is the correct word
            // no need to validate
            // alert('correct word!, you win!'); // TODO: remove alert
            messageBar.innerText = `Correct word! You win the game!`;
            done = true;
            return;

        } else if (currentRow === NUMBER_OF_ROUNDS) {
            // alert(`you lost! the word was ${wordOfTheDay}`) // TODO: remove alert

            messageBar.innerText = `You lost! The word was ${wordOfTheDay}`;

            done = true;
        }
        currentGuess = ''; 
    }
  
}

function answerCheck(userAnswer, theAnswer) {

    const userAnswerChars = userAnswer.split('');
    const map = makeMap(theAnswer);

    // iterate to check for every correct index of char
    for (let i = 0; i < MAX_ANSWER_LENGTH; i++) {
        // mark as correct if correct position
        if (userAnswerChars[i] === theAnswer[i])  {
            allLetters[currentRow * MAX_ANSWER_LENGTH + i].classList.add('correct');
            map[userAnswerChars[i]]--;
        }
    }

    for (let i = 0; i < MAX_ANSWER_LENGTH; i++) {

        if (userAnswerChars[i] === theAnswer[i]) {
            //do nothing, this handles from the first loop
        } else if (theAnswer.includes(userAnswerChars[i]) && map[userAnswerChars[i]] > 0) { // mark 'close' if a char exist in the answer(word of the day)
            allLetters[currentRow * MAX_ANSWER_LENGTH + i].classList.add('close');
            map[userAnswerChars]--;

        } else {
            allLetters[currentRow * MAX_ANSWER_LENGTH + i].classList.add('wrong');
        }   
    }
}


function invalidWord () {
    for (let i = 0; i < MAX_ANSWER_LENGTH; i++) {
        allLetters[currentRow * MAX_ANSWER_LENGTH +i].classList.remove('invalid');

        setTimeout(function() {
            allLetters[currentRow * MAX_ANSWER_LENGTH +i].classList.add('invalid');
        }, 10)
    }
}

/***
 * function to keep track how many letters that are mark as 'close' or 'correct'
 */
function makeMap(array) {

    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('hidden' , !isLoading);
}

/***
 * Function responsible if user key press is an alphabet or not
 */
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}


init();