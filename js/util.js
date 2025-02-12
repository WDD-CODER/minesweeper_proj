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
function stopTimer() {
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
        if (!gGame.isOn) return
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

// Makes hints Emoji to represent hint count.
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
function changeDifficulty(el) {
    if (el.innerText === '👶') {
        gLevel = { DIFFICULTY: 'Beginner', SIZE: 4, MINES: 2 }
    } else if (el.innerText === '😎') {
        gLevel = { DIFFICULTY: 'Expert', SIZE: 8, MINES: 14 }
    } else if (el.innerText === '💀') {
        gLevel = { DIFFICULTY: 'Killer', SIZE: 12, MINES: 32 }
    }
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


function changeDarkMode() {
    const root = document.documentElement;
    if (gDarkModeIsOff) {

        if (!root.dataset.bgMain) {
            root.dataset.bgMain = getComputedStyle(root).getPropertyValue('--bg-main').trim();
            root.dataset.bgBox = getComputedStyle(root).getPropertyValue('--bg-box').trim();
            root.dataset.bgDark = getComputedStyle(root).getPropertyValue('--bg-dark').trim();
            root.dataset.bgScore = getComputedStyle(root).getPropertyValue('--bg-score').trim();
            root.dataset.borderColor = getComputedStyle(root).getPropertyValue('--border-color').trim();
            root.dataset.bgSc = getComputedStyle(root).getPropertyValue('--bg-safe').trim();
        }

        root.style.setProperty('--bg-main', 'rgb(29, 29, 29)');
        root.style.setProperty('--bg-box', 'rgb(105, 105, 105)');
        root.style.setProperty('--bg-score', 'rgb(71, 71, 71)');
        root.style.setProperty('--bg-dark', 'rgb(71, 71, 71)');
        root.style.setProperty('--border-color', 'rgb(148, 148, 148)');
        root.style.setProperty('--bg-safe', ' #05afe2');
    } else {
        root.style.setProperty('--bg-main', root.dataset.bgMain);
        root.style.setProperty('--bg-box', root.dataset.bgBox);
        root.style.setProperty('--bg-dark', root.dataset.bgDark);
        root.style.setProperty('--bg-score', root.dataset.bgScore);
        root.style.setProperty('--border-color', root.dataset.borderColor);
        root.style.setProperty('--bg-safe', root.dataset.bgSc);

    }

    // elDarkMode.style.backgroundColor = 'gray'
    gDarkModeIsOff = !gDarkModeIsOff
}

function getCordsByClassName(elCell) {
    if (!elCell) { return null }
    var curElCell = elCell.split(/(\d+)/);
    var CurCords = { i: curElCell[1], j: curElCell[3] }
    return CurCords
}
function countShownCells() {
    var count = 0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isShown) count++
        }
    }
    gGame.shownCount = count
}

function createGGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        difficulty: gLevel.DIFFICULTY,
        livesCount: 3,
        hintsCount: 3,
        hintActive: false,
        safeClicks: 3,
        safeMode: false,
        history: [],

    }
    return gGame
}

function checkCellContent(cell) {
    var elCellInnerText
    switch (true) {
        case cell.isMine:
            elCellInnerText = MINE_IMG
            console.log('mine created now!');

            break;
        case cell.minesAroundCount:
            elCellInnerText = cell.minesAroundCount
            break;
        default:
            elCellInnerText = EMPTY
            break;
    }
    return elCellInnerText
}

