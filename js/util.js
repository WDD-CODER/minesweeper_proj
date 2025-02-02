'use strict'
// algorithm(see description at the Bonuses section below)





// Create a timer 
function startTimer() {
    var elTimer = document.querySelector('.timer')
    var startTime = Date.now(); // Capture the start time
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime; // Calculate elapsed time in ms
        const milliseconds = Math.floor(elapsed % 1000 / 10); // Get milliseconds (0-99 for cleaner display)
        const seconds = Math.floor((elapsed / 1000) % 60); // Get seconds (0-59)
        const minutes = Math.floor((elapsed / 60000) % 60); // Get minutes (0-59)
        // Format and display the counter
        elTimer.innerText = `${pad(minutes)}:${pad(seconds)}`;
        const lastTime = `${pad(minutes)}:${pad(seconds)}`;
        return lastTime
    }, 10); 
     // Update every 10 milliseconds 
}
//Allows receiving a number with two digits to set the timer Outcome view
function pad(num) {
    return num.toString().padStart(2, '0'); // Ensure 2 digits
}
//Extract cells coordinations by element class name.
function getCordsByClassName(elCell) {
    if (!elCell) {return null}
    var curElCell = elCell.split(/(\d+)/);
    var CurCords = { i: curElCell[1], j: curElCell[3] }
    return CurCords
}

// Change smile Depending on game situationDepending on game situation.
function smileyChange() {
    document.querySelector('.board-container').addEventListener('mousedown', function (event) {
        document.querySelector('.smiley').innerText = '😮'
    });
    document.querySelector('.board-container').addEventListener('mouseup', function (event) {
        document.querySelector('.smiley').innerText = '😊'
    });
}
// Makes  Hart Emoji by live count.
function livesCount() {
    var strHTML = ''
    for (let i = 0; i < gGame.livesCount; i++) {
        strHTML += '❤️'
    }
    var res = document.querySelector('.lives')
    res.innerHTML = strHTML

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
// Functions to choose a difficulty by player.
function level1(){
    console.log("🚀 ~ level1 ~ gLevel:", gLevel)
    gLevel = { SIZE: 4, MINES: 2 }
    onInit()
}
function level2(){
    gLevel = { SIZE: 8, MINES: 14 }
    onInit()

}
function level3(){
    gLevel = { SIZE: 12, MINES: 32 }
    onInit()

}
