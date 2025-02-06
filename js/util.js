'use strict'
// algorithm(see description at the Bonuses section below)





// Create a timer 
function startTimer() {
    var elTimer = document.querySelector('.timer h5')
    var startTime = Date.now() - gCurTimeCount.last; // Capture the start time And save it globally so I can restart the timer from the same point every time.
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime; // Calculate elapsed time in ms
        const milliseconds = Math.floor(elapsed % 1000 / 10); // Get milliseconds (0-99 for cleaner display)
        const seconds = Math.floor((elapsed / 1000) % 60); // Get seconds (0-59)
        const minutes = Math.floor((elapsed / 60000) % 60); // Get minutes (0-59)
        // Format and display the counter
        elTimer.innerText = `${pad(minutes)}:${pad(seconds)}`;
        const lastTime = `${pad(minutes)}:${pad(seconds)}`;
        gCurTimeCount.last = elapsed
        gCurTimeCount.time = lastTime
        return lastTime
    }, 10);
    // Update every 10 milliseconds 
}

//Allows receiving a number with two digits to set the timer Outcome view
function pad(num) {
    return num.toString().padStart(2, '0'); // Ensure 2 digits
}
// Stops and cleared the timer interval
function stopeTimer() {
    clearInterval(timerInterval)
    timerInterval = null
}

//Extract cells coordinations by element class name.
function getCordsByClassName(elCell) {
    if (!elCell) { return null }
    var curElCell = elCell.split(/(\d+)/);
    var CurCords = { i: curElCell[1], j: curElCell[3] }
    return CurCords
}



// Change smile Depending on game situationDepending on game situation.
function smileyChange() {
    var elBoardContainer = document.querySelector('.board-container')
    var elSmiley = document.querySelector('.smiley')
    elBoardContainer.addEventListener('mousedown', function (event) {
        if (event.button === 0) elSmiley.innerText = '😮'
        if (event.button === 2) elSmiley.innerText = '🧐'
    });
    elBoardContainer.addEventListener('mouseup', function (event) { elSmiley.innerText = '😊' });
}


// Makes Hart Emoji to represent live count.
function livesCount() {
    var strHTML = ''
    for (let i = 0; i < gGame.livesCount; i++) {
        strHTML += '❤️'
    }
    document.querySelector('.lives').innerHTML = strHTML

}
function renderHints() {
    var strHTML = ''
    for (let i = 0; i < gGame.hintsCount; i++) {
        strHTML += `<button class="button${i}" onclick="useHint(this)">💡</button>`
    }
    document.querySelector('.hint').innerHTML = strHTML
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
// Functions to choose a difficulty by player.
function level1() {
    gLevel = { DIFFICULTY: 'Beginner', SIZE: 4, MINES: 2 }
    onInit()
}
function level2() {
    gLevel = { DIFFICULTY: 'Expert', SIZE: 8, MINES: 14 }
    onInit()

}
function level3() {
    gLevel = { DIFFICULTY: 'Killer', SIZE: 12, MINES: 32 }
    onInit()

}

//  Count mines around each cell and set the cell's minesAroundCount.
function minesAroundCount(cellI, cellJ, mat) {
    var NeighborMinesCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) NeighborMinesCount++
        }
    }
    return NeighborMinesCount
}

// Get available Neighboring cells coordinations for later usage
function NeighborEmptyCords(cellI, cellJ, mat) {
    var NeighborEmptyCordsArray = []
    var count = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++, count++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) continue
            if (mat[i][j].isShown) continue
            if (mat[i][j].isMarked) continue
            else var cell = { row: i, coll: j }
            NeighborEmptyCordsArray.push(cell)
        }
    }
    return NeighborEmptyCordsArray
}
// Find available sales to place mines in them.
function EmptyAvailableCellCordsArray(board) {
    var emptyCordsArray = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var CurCell = board[i][j]
            var CurCellCords = { i: i, j: j }
            if (!CurCell.isMine && !CurCell.isShown) { emptyCordsArray.push(CurCellCords) }
        }
    }
    return emptyCordsArray
}
