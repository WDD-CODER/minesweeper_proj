'use strict'

// global consts
const FLAG_IMG = `<img src="img/flag.jpg" alt="mine_img"/>`
const MINE_IMG = `<img src="img/mine.jpg" alt="mine_img"/>`
const EMPTY = ''
const gBestScore = { last: Infinity, time: 0 }
// global variables 
var timerInterval
var gBoard
var gLevel = { DIFFICULTY: 'Beginner', SIZE: 4, MINES: 2 }
var gGame
var gCurTimeCount
var gActiveHint
var gLastCellCords
var gLastMovesArray
var gDarkModeIsOff = true


function onInit() {// יש לי בעיה עם הדגלים. משהו לא עובד כשאני עושה רמז וחושף דגלים הם חוזרים כמספר מסומן ולא דגלץ לא תקין.
    restartUi()
    gGame = createGGame()
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.board-container')
    updateGameScores()
    renderHints()
}

//Update scoreboard.
function updateGameScores() {
    document.querySelector('.mark-count h6').innerText = gGame.markedCount
    document.querySelector('.score-count h6').innerText = gGame.shownCount
    livesCount()
    showBestScore()
}

function restartUi() {
    stopTimer()
    gCurTimeCount = { last: 0, time: null }
    document.querySelector('.timer h5').innerText = '00:00'
    document.querySelector('.game-over').style.visibility = 'hidden'
    document.querySelector('.smiley').innerText = '😊'
    // gLastMovesArray = []
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
                isCheck: false,
            }
            board[i][j] = cell
        }
    }
    return board
}


function renderBoard(gBoard, selector) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            var elCellInnerText = checkCellContent(cell)
            const className = `cell cell-${i}-${j}`
            strHTML += `<td  oncontextmenu="placeFlag(event, this)" onclick="onCellClicked(this, ${i},${j})" class="${className}">${elCellInnerText}</td>`
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
function placeFlag(ev, el) {
    ev.preventDefault();  // Prevent right-click menu
    const CurCords = getCordsByClassName(el.className)
    const curCell = gBoard[CurCords.i][CurCords.j]
    if (!gGame.shownCount || !gGame.isOn || curCell.isShown) return
    curCell.isMarked = !curCell.isMarked // Toggle is marked
    if (curCell.isMarked) {
        renderCell(CurCords, FLAG_IMG)
        el.classList.remove('cell')
        el.classList.add('symbol')
        gGame.markedCount++
    } else if (!curCell.isMarked && curCell.isMine) {
        renderCell(CurCords, MINE_IMG)
        // elGameCell.classList.remove('symbol')
        el.classList.add('cell')
        gGame.markedCount--
    } else {
        renderCell(CurCords, curCell.minesAroundCount)
        el.classList.add('cell')
        el.classList.remove('symbol')
        gGame.markedCount--
    }
    updateGameScores()
    isGameOver()
}
// Find available cells to place mines in them.
function EmptyAvailableCellCordsArray(board) {
    var emptyCordsArray = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var CurCell = board[i][j]
            var CurCellCords = { i: i, j: j }
            if (!CurCell.isMine && !CurCell.isShown) {
                emptyCordsArray.push(CurCellCords)
            }
            else continue;
        }
    }
    return emptyCordsArray
}
// placing randomize mines on board
function placeRandomMines(gBoard, HowManyMines) {
    var emptyCordsArray = EmptyAvailableCellCordsArray(gBoard)
    var CopyCordsArray = [...emptyCordsArray]
    for (let i = 1; i <= HowManyMines; i++) {
        const curIdx = getRandomIntInclusive(0, CopyCordsArray.length - 1)
        const curElCellCords = CopyCordsArray[curIdx]
        const curCell = gBoard[curElCellCords.i][curElCellCords.j]
        curCell.isMine = true
        renderCell(curElCellCords, MINE_IMG)
        CopyCordsArray.splice(curIdx, 1)
    }
}
// Manage clicks on cells.
function onCellClicked(elCell, i, j) {
    gGame.safeMode = false
    var curCell = gBoard[i][j]
    gLastCellCords = { i: i, j: j }
    gLastMovesArray = []
    if (gGame.shownCount === 0 && !gGame.isOn) {
        curCell.isShown = true
        smileyChange(curCell)
        startTimer()
        placeRandomMines(gBoard, gLevel.MINES)
        setMinesNeighborCount(gBoard)
        gGame.isOn = true
    } else if (gGame.shownCount > 0 && !gGame.isOn) {
        return
    } else if (gGame.hintActive && gGame.isOn) {
        hintUncover(i, j)
        return
    } else if (curCell.isMine && gGame.isOn) {
        gGame.livesCount--
        elCell.classList.add('hide-before')
        updateGameScores()
        hitMine(elCell, curCell)
        return
    } else if (curCell.minesAroundCount < 1) {
        expandShown(gBoard, i, j)
    } else if (!gGame.isOn || curCell.isMarked || curCell.isShown) return
    gLastMovesArray.push(gLastCellCords)
    const newBoard = structuredClone(gLastMovesArray)
    gGame.history.push(newBoard)
    if (!curCell.isShown) curCell.isShown = true
    elCell.classList.add('hide-before')
    countShownCells()
    updateGameScores()
    isGameOver()
}

function undo() {
    if (!gGame.history.length || !gGame.isOn) { return }
    const lastMove = gGame.history.pop()
    for (let i = 0; i < lastMove.length; i++) {
        const cellCords = lastMove[i]
        const I = cellCords.i
        const J = cellCords.j
        const cell = gBoard[I][J]
        const elCell = document.querySelector(`.cell-${I}-${J}`)
        cell.isShown = false
        cell.isCheck = false
        elCell.classList.remove('hide-before')
        gGame.shownCount--
    }
    countShownCells()
    updateGameScores()
    isGameOver()
}

// finds neighboring cells that are Not mine's, marked or shown
function NeighborEmptyCords(cellI, cellJ, gBoard) {
    const curCell = gBoard[cellI][cellJ]
    var NeighborEmptyCordsArray = []
    if (curCell.isCheck) return []
    else curCell.isCheck = true
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            const nextCell = gBoard[i][j]
            if (nextCell.isMine || nextCell.isShown || nextCell.isMarked) continue;

            var emptyCellCords = { row: i, coll: j }
            NeighborEmptyCordsArray.push(emptyCellCords)

            if (nextCell.minesAroundCount < 1) {
                var res = NeighborEmptyCords(i, j, gBoard) || []
                NeighborEmptyCordsArray.push(...res)
            }
        }
    }
    return NeighborEmptyCordsArray
}
// Expand neighboring cells that are Not mine's, marked or shown 
function expandShown(gBoard, i, j) {
    var curEmptyNeighbors = NeighborEmptyCords(i, j, gBoard)
    // Takes the relevant cells and shows them.
    for (let i = 0; i < curEmptyNeighbors.length; i++) {
        const row = curEmptyNeighbors[i].row
        const coll = curEmptyNeighbors[i].coll
        const cell = gBoard[row][coll]
        const elCell = document.querySelector(`.cell-${row}-${coll}`)
        cell.isShown = true
        elCell.classList.add('hide-before')
        gLastCellCords = { i: row, j: coll }
        gLastMovesArray.push(gLastCellCords)
    }
}
//implements losing situation
function youLose() {
    var elGameOver = document.querySelector('.game-over')
    elGameOver.style.visibility = 'visible'
    elGameOver.innerText = ' GAME OVER \n you lose'
    gGame.isOn = false
    document.querySelector('.smiley').innerText = '☠️'
    elGameOver.style.background = 'linear-gradient(to top, #ff6347, #ffea00)';
    stopTimer()
    //Exposes all the rest of the minds on the game before game ends.
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                document.querySelector(`.cell-${i}-${j}`).classList.add('hide-before')
            }
        }
    }
}
//implements wining situation
function victory() {
    stopTimer()
    var elGameOver = document.querySelector('.game-over')
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😎'
    elGameOver.style.visibility = 'visible'
    elGameOver.innerText = 'Congratulations!!! \n you win!'
    elGameOver.style.background = 'linear-gradient(to top, #adff2f, #ffea00)';
    //Updates best score
    gGame.isOn = false
    setTimeout(() => {
        checkBestScore()
    }, 500);
}
//Showcases best score on scoreboard.
function showBestScore() {
    var localStorageKeys = ['Beginner', 'Expert', 'Killer',]
    var scoresP = document.querySelectorAll('.score-container p')
    for (let i = 0; i < scoresP.length; i++) {
        if (localStorage.getItem(localStorageKeys[i]) !== null) {
            scoresP[i].innerText = localStorage.getItem(localStorageKeys[i])
        } else continue;
    }
}
// Check for best score and updates it 
function checkBestScore() {
    const curScoreInMilSecond = gCurTimeCount.last
    const curScoreInTime = gCurTimeCount.time
    if (localStorage.getItem(gLevel.DIFFICULTY) === null) {
        gBestScore.last = curScoreInMilSecond
        gBestScore.time = curScoreInTime
        localStorage.setItem(gLevel.DIFFICULTY, curScoreInTime)
        showBestScore()
    } else if (curScoreInMilSecond < gBestScore.last) {
        gBestScore.last = curScoreInMilSecond
        gBestScore.time = curScoreInTime
        localStorage.setItem(gLevel.DIFFICULTY, curScoreInTime)
        showBestScore()
    } else {
        showBestScore()
    }
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
function hideNoticeDivs(el) {
    el.style.display = "none";
    if (!gGame.isOn) return
    else {
        const cell = gBoard[gLastCellCords.i][gLastCellCords.j]
        const elCell = document.querySelector(`.cell-${gLastCellCords.i}-${gLastCellCords.j}`)
        startTimer()
        if (gGame.safeMode) return
        else elCell.classList.remove('hide-before')
        cell.isShown = false
    }
}
// Deals with all the situation after hitting a mine
function hitMine(elCell, curCell) {
    stopTimer()
    document.querySelector('.notice').style.display = "block"
    document.querySelector('.blocking-div').style.display = "block"
    // Change hit Mine  notice 
    if (gGame.livesCount < 1) {
        document.querySelector('.notice h5').innerText = 'Too bad that was your last life ! \n Press me to continue \n 👇'
        document.querySelector('.notice h4').innerText = '😭'
        document.querySelector('.notice h6').innerText = 'Hit the Skull emoji to restart the game!'
        youLose()
    } else {
        document.querySelector('.notice h5').innerText = 'Holy moly, you\'v hit a mine! \n good thing you Still have some lives.'
        document.querySelector('.notice h4').innerText = '🤯'
        document.querySelector('.notice h6').innerText = 'Hit me to continue  \n 👇'
    }
}
// Implify use hint when player presses button
function useHint(elHint) {
    // Make sure no option to press another hint while one is active
    if (gGame.hintActive && elHint !== gActiveHint) return
    //If player didn't show one cell, don't Implement hint. 
    else if (gGame.shownCount === 0) {
        document.querySelector('.notice').style.display = 'block'
        document.querySelector('.blocking-div').style.display = 'block'
        document.querySelector('.notice h5').innerText = 'You forgot to unveil a cell \n You have to unveil one cell before using a hint!'
        document.querySelector('.notice h4').innerText = '🤣'
        document.querySelector('.notice h6').innerText = 'Click anywhere to continue!'
        return
    }
    else if (!gGame.isOn) { return }


    if (gGame.hintActive) {
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
    stopTimer()
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
        gGame.isOn = true
        gGame.hintActive = false
        gGame.hintsCount--
        startTimer()
        renderHints()
    }, 1500)

}
function safeClick() {
if (!gGame.isOn) return
    if (gGame.safeClicks < 1) {
        document.querySelector('.notice').style.display = 'block'
        document.querySelector('.blocking-div').style.display = 'block'
        document.querySelector('.notice h5').innerText = 'too bad you don\'t have another safeCell left \n try doing you\'r best to win on you\'r own!'
        document.querySelector('.notice h4').innerText = '😅'
        document.querySelector('.notice h6').innerText = 'Click anywhere to continue!'
        return
    }

    var safeCellsArray = []
    stopTimer()
    gGame.safeMode = true
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            const CellCords = { i: i, j: j }
            if (cell.isShown || cell.isMine) continue
            else safeCellsArray.push(CellCords)
        }
    }
    gGame.safeClicks--
    var curCellCords = safeCellsArray.splice((getRandomIntInclusive(0, safeCellsArray.length - 1)), 1)
    markSafeCell(curCellCords)
}
function markSafeCell(CellCords) {
    const root = document.documentElement;
    const cellI = CellCords[0].i
    const cellJ = CellCords[0].j
    const elCell = document.querySelector(`.cell-${cellI}-${cellJ}`)

    if (!root.dataset.bgBefore) {
        root.dataset.bgBefore = getComputedStyle(root).getPropertyValue('--bg-before').trim();
    }
    elCell.style.setProperty('--bg-before', 'rgb(56, 240, 87)')
    setTimeout(() => {
        startTimer()
        elCell.style.setProperty('--bg-before', root.dataset.bgBefore);
    }, 1500);
}
// function showCell(cell, elCell) {

//     cell.isShown = true
//     elCell.classList.add('hide-before')
//     var curCellCords = getCordsByClassName(elCell)

//     gGame.history.push(newBoard)

//     // const curCell = gBoard[i][j]
//     // const curElCell = document.querySelector(`.cell.cell${i}${j}`)
// }
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

function manualMineSet() {

}
