'use strict'

// global consts
const FLAG_IMG = `<img src="img/flag.jpg" alt="mine_img"/>`
const MINE_IMG = `<img src="img/mine.jpg" alt="mine_img"/>`
const EMPTY = ''
const gBestScore = []
// global variables 
var timerInterval
var gBoard
var gLevel = { DIFFICULTY: 'Beginner', SIZE: 4, MINES: 2 }
var gGame
var gCurTimeCount
var gActiveHint
var gLastCell

// Global document query selectors.
var elnNoticeH5 = document.querySelector('.notice h5')
var elnNoticeH4 = document.querySelector('.notice h4')
var elnNoticeH2 = document.querySelector('.notice h2')
var elNoticeDiv = document.querySelector('.notice')
var elBackgroundDiv = document.querySelector('.blocking-div')
var elBestScoresDiv = document.querySelector('.best-scores')
var elScoreContainer = document.querySelector('.score-container')
var elScoreContainerH2 = document.querySelector('.score-container h5')
var elGameOver = document.querySelector('.game-over')
var elSmiley = document.querySelector('.smiley')
var elTimer = document.querySelector('.timer')
var elTimerH5 = document.querySelector('.timer h5')
var elMarkCountH6 = document.querySelector('.mark-count h6')
var elScoreCountH6 = document.querySelector('.score-count h6')

function onInit() {// יש לי בעיה עם הדגלים. משהו לא עובד כשאני עושה רמז וחושף דגלים הם חוזרים כמספר מסומן ולא דגלץ לא תקין.
    stopeTimer()
    gLastCell = {}
    gCurTimeCount = { last: 0, time: null }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        difficulty: gLevel.DIFFICULTY,
        livesCount: 3,
        hintsCount: 10,
        hintActive: false,
    }
    elGameOver.style.visibility = 'hidden'
    elSmiley.innerText = '😊'
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.board-container')
    placeFlag()
    updateGameInfo()
    renderHints()

}

//  Builds the board Set the mines Call setMinesNegsCount() Return the created board
function buildBoard(boardSize) {
    const board = []
    for (var i = 0; i < boardSize; i++) {
        board.push([])

        for (var j = 0; j < boardSize; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell
        }
    }
    return board
}
function renderBoard(mat, selector) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            var elCellInnerText
            switch (true) {
                case cell.isMine:
                    elCellInnerText = MINE_IMG
                    break;
                case cell.minesAroundCount:
                    elCellInnerText = cell.minesAroundCount
                    break;
                default:
                    elCellInnerText = EMPTY
                    break;
            }
            const className = `cell cell-${i}-${j}`
            strHTML += `<td onclick="onCellClicked(this, ${i},${j})" class="${className}">${elCellInnerText}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value

}
// Deals with mouse right click and marking cells.
function placeFlag() {
    var elGameCell = document.querySelectorAll('.cell')
    elGameCell.forEach(elGameCell => {
        elGameCell.addEventListener('contextmenu', function (event) {
            event.preventDefault(); // Stop the default right-click menu
            if (!gGame.shownCount || !gGame.isOn) return
            const CurCords = getCordsByClassName(elGameCell.className)
            const curCell = gBoard[CurCords.i][CurCords.j]
            if (curCell.isShown) return
            curCell.isMarked = !curCell.isMarked // Toggle is marked.
            switch (true) {
                case curCell.isMarked:
                    renderCell(CurCords, FLAG_IMG)
                    elGameCell.classList.remove('cell')
                    elGameCell.classList.add('symbol')
                    gGame.markedCount++
                    break;
                case !curCell.isMarked && curCell.isMine:
                    renderCell(CurCords, MINE_IMG)
                    // elGameCell.classList.remove('symbol')
                    elGameCell.classList.add('cell')
                    gGame.markedCount--
                    break;
                case !curCell.isMarked && !curCell.isMine:
                    renderCell(CurCords, curCell.minesAroundCount)
                    elGameCell.classList.add('cell')
                    elGameCell.classList.remove('symbol')
                    gGame.markedCount--
                    break;
                default:
                    break;
            }
            updateGameInfo()
            isGameOver()
        })
    });
}
// placing randomize mines on board
function placeRandomMines(gBoard, HowManyMines) {
    var emptyCordsArray = EmptyAvailableCellCordsArray(gBoard)
    var CopyCordsArray = [...emptyCordsArray]
    for (let i = 1; i <= HowManyMines; i++) {
        var curIdx = getRandomIntInclusive(0, CopyCordsArray.length - 1)
        var curElCellCords = CopyCordsArray[curIdx]
        gBoard[curElCellCords.i][curElCellCords.j].isMine = true
        gBoard[curElCellCords.i][curElCellCords.j].isMine = true
        renderCell(curElCellCords, MINE_IMG)
        CopyCordsArray.splice(curIdx, 1)
    }
}
//Update scoreboard.
function updateGameInfo() {
    elMarkCountH6.innerText = gGame.markedCount
    elScoreCountH6.innerText = gGame.shownCount
    livesCount()
    showBestScore()
}

// Manage clicks on cells.
function onCellClicked(elCell, i, j) {
    var curCell = gBoard[i][j]
    gLastCell = { Cell: curCell, elCell: elCell }
    if (gGame.hintActive && !gGame.isOn) return
    if (gGame.shownCount === 0 && gGame.isOn) {
        smileyChange(curCell)
        startTimer()
    }
    else if (gGame.hintActive && gGame.isOn) {
        hintUncover(i, j)
        return
    }
    if (curCell.isMarked || curCell.isShown) { return }
    else {
        elCell.classList.add('hide-before')
        curCell.isShown = true
    }
    if (curCell.isMine && gGame.isOn){ 
        gGame.livesCount--
        updateGameInfo()
        hitMine(elCell, curCell)
    }
    else if (gGame.shownCount === 0) {
        gGame.shownCount++
        placeRandomMines(gBoard, gLevel.MINES)
        setMinesNeighborCount(gBoard)
    } else {
        gGame.shownCount++
        expandShown(gBoard, elCell, i, j)
    }
    updateGameInfo()
    isGameOver()
}

//Counts neighboring Mines To place number inside cells to show player
function setMinesNeighborCount(gBoard) {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var cellLocation = { i: i, j: j }
            if (cell.isMine) continue;
            else {
                cell.minesAroundCount = minesAroundCount(i, j, gBoard)
                renderCell(cellLocation, cell.minesAroundCount)
            }
        }
    }
}
// Expand neighboring cells that are Not mine's, marked or shown 
function expandShown(gBoard, elCell, i, j) {
    // In the pdf, it stated  expandShown(Board, elCell,i, j). 
    // I didn't use the elCell As the parameter. didn't found usage for it.
    var curEmptyNeighbors = NeighborEmptyCords(i, j, gBoard)
    for (let i = 0; i < curEmptyNeighbors.length; i++) {
        var row = curEmptyNeighbors[i].row
        var coll = curEmptyNeighbors[i].coll
        if (gBoard[row][coll].isMarked) continue;
        else {
            document.querySelector(`.cell-${row}-${coll}`).classList.add('hide-before')
            gBoard[row][coll].isShown = true
            gGame.shownCount++
        }
    }
}
//implements losing situation
function youLose() {
    elGameOver.style.visibility = 'visible'
    elGameOver.innerText = 'GAME OVER \n you lose'
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                stopeTimer()
                elSmiley.innerText = '☠️'
                elGameOver.style.background = 'linear-gradient(to top, #ff6347, #ffea00)';
                document.querySelector(`.cell-${i}-${j}`).classList.add('hide-before')
                gGame.isOn = false
            }
        }
    }
}
//implements wining situation
function victory() {
    stopeTimer()
    var elGameOver = document.querySelector('.game-over')
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😎'
    elGameOver.style.visibility = 'visible'
    elGameOver.innerText = 'GAME OVER \n you win!'
    elGameOver.style.background = 'linear-gradient(to top, #adff2f, #ffea00)';
    //Updates best score
    checkBestScore()
    gGame.isOn = false
}
//Showcases best score on scoreboard.
function showBestScore() {
    elTimerH5.innerText = '00:00'
    var localStorageKeys = ['Beginner', 'Expert', 'Killer',]
    var scoresP = document.querySelectorAll('.score-container p')
    for (let i = 0; i < scoresP.length; i++) {
        if (localStorage.getItem(localStorageKeys[i]) !== null) {
            console.log(scoresP[i].innerText);
            scoresP[i].innerText = localStorage.getItem(localStorageKeys[i])
        } else continue;
    }
}
// Check for best court and updates it 
function checkBestScore() {
    const bestScoreInMilSecond = gBestScore.last
    const bestScoreInTime = gBestScore.time
    const curScoreInMilSecond = gCurTimeCount.last
    const curScoreInTime = gCurTimeCount.time
    if (localStorage.getItem(gLevel.DIFFICULTY) === null)
        console.log('no score');
    if (curScoreInMilSecond > bestScoreInMilSecond) {
        console.log('new score');
        localStorage.setItem(gLevel.DIFFICULTY, bestScoreInTime)
        showBestScore()
    } else
        console.log('old score');
    localStorage.setItem(gLevel.DIFFICULTY, curScoreInTime)
    showBestScore()
}
//Checks if game over and sets victory or loss.
function isGameOver() {
    var TotalCellCount = gLevel.SIZE * gLevel.SIZE
    var NumOFmines = gLevel.MINES
    var emptyCellsCount = TotalCellCount - NumOFmines
    if (gGame.livesCount < 1) youLose()
    else if (gGame.shownCount === emptyCellsCount && gGame.markedCount === NumOFmines) { victory() }

}
//Hide notice divs when hit mine 
function hideNoticeDivs(ev) {
    ev.style.display = "none";
    if (!gGame.isOn) return
    else {
        gLastCell.elCell.classList.remove('hide-before')
        gLastCell.Cell.isShown = false
        startTimer()
    }
}
// Deals with all the situation after hitting a mine
function hitMine(elCell, curCell) {
    stopeTimer()
    elNoticeDiv.style.display = "block"
    elBackgroundDiv.style.display = "block"
    // Change hit Mine  notice 
    if (gGame.livesCount < 1) {
        elnNoticeH5.innerText = 'Too bad that was your last life ! \n Press me to continue \n 👇'
        elnNoticeH2.innerText = '😭'
        elnNoticeH2.innerText = 'Hit the Skull emoji to restart the game!'
    } else {
        elnNoticeH5.innerText = 'Holy moly, you\'v hit a mine! \n good thing you Still have some lives.'
        elnNoticeH2.innerText = '🤯'
        elnNoticeH4.innerText = 'Hit me to continue  \n 👇'
    }
}
// Implify use hint when player presses button
function useHint(elHint) {
    // Make sure no option to press another hint while one is active
    if (gGame.hintActive && elHint !== gActiveHint) return
    //If player didn't show one cell, don't Implement hint. 
    if (gGame.shownCount === 0) {
        elNoticeDiv.style.display = 'block'
        elBackgroundDiv.style.display = 'block'
        document.querySelector('.notice h2').innerText = '🤣'
        document.querySelector('.notice h5').innerText = 'You forgot to unveil a cell \n You have to unveil one cell before using a hint!'
        document.querySelector('.notice h4').innerText = 'Click anywhere to continue!'
        return
    }
    if (gGame.hintActive && !gGame.isOn) return
    else if (gGame.hintActive) {
        elHint.style.backgroundColor = 'transparent'
        gGame.hintActive = false
    } else {
        elHint.style.backgroundColor = 'rgb(212, 212, 54)'
        gGame.hintActive = true
        gActiveHint = elHint
    }
}
// Uncover relevant neighbor cells.
function hintUncover(cellI, cellJ) {
    stopeTimer()
    gGame.isOn = false
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            const curCords = { i: i, j: j }
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            const curCell = gBoard[i][j]
            elCell.classList.add('hide-before')
            switch (true) {
                case curCell.isShown:
                    break;
                case curCell.isMarked && curCell.isMine:
                    renderCell(curCords, MINE_IMG)
                    setTimeout(((row, coll) => {
                        return () => {
                            const curElCell = document.querySelector(`.cell-${row}-${coll}`)
                            curElCell.classList.remove('hide-before')
                            renderCell(curCords, FLAG_IMG)
                        }
                    })(i, j), 1500);
                    break;

                case !curCell.isMarked && curCell.isMine:
                    renderCell(curCords, MINE_IMG)
                    setTimeout(((row, coll) => {
                        return () => {
                            const curElCell = document.querySelector(`.cell-${row}-${coll}`)
                            curElCell.classList.remove('hide-before')
                            // renderCell(curCords, FLAG_IMG)
                        }
                    })(i, j), 1500);
                    break;

                case curCell.isMarked && !curCell.isMine:
                    renderCell(curCords, curCell.minesAroundCount)
                    setTimeout(((row, coll) => {
                        return () => {
                            const curElCell = document.querySelector(`.cell-${row}-${coll}`)
                            curElCell.classList.remove('hide-before')
                            renderCell(curCords, FLAG_IMG)
                        }
                    })(i, j), 1500);
                    break;

                default:
                    setTimeout(((row, coll) => {
                        return () => {
                            const curElCell = document.querySelector(`.cell-${row}-${coll}`)
                            renderCell(curCords, curCell.minesAroundCount)
                            curElCell.classList.remove('hide-before')
                        }
                    })(i, j), 1500);
                    break;
            }
        }
    }

    setTimeout(function () {
        startTimer()
        renderHints()
        gGame.isOn = true
        gGame.hintActive = false
        gGame.hintsCount--
    }, 1500)

}
