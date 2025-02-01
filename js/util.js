'use strict'
// algorithm(see description at the Bonuses section below)



function EmptyAvailableCellCordsArray(board) {
    var emptyCordsArray = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var CurCell = board[i][j]
        var CurCellCords ={ i:i, j:j}
        if (!CurCell.isMine && !CurCell.isShown  ) { emptyCordsArray.push(CurCellCords) }
    }
}
return emptyCordsArray
}

function getRandomCord(){
 var  emptyCordsArray =  getEmptyObjects(gBoard)
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

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

function pad(num) {
    return num.toString().padStart(2, '0'); // Ensure 2 digits
}

function getCordsByClassName(elCell) {
    if (!elCell) {return null}
    var curElCell = elCell.split(/(\d+)/);
    var CurCords = { i: curElCell[1], j: curElCell[3] }
    return CurCords
}



