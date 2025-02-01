'use strict'

// global consts
const FLAG_IMG = `<img src="img/flag.jpg" alt="mine_img">`
const MINE_IMG = `<img src="img/mine.jpg" alt="mine_img">`
const EMPTY = ''
// global variables 
var timerInterval
var gBoard
var gLevel = { SIZE: 8, MINES: 4 }
var gGame


function onInit() {
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, livesCount: 3 }
    clearInterval(timerInterval)
    startTimer()
    document.querySelector('.game-over').style.visibility = 'hidden'
    gGame.isOn = true
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.board-container')
    setMinesNegsCount(gBoard)
    placeFlag()
    updateScores()
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
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    // Hand placed minds for development - Should change to random at some point.
    // board[1][1].isMine = true
    // board[1][2].isMine = true
    return board
}


function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cellContent
            var cell = mat[i][j]
            switch (true) {
                case cell.isMine:
                    cellContent = MINE_IMG
                    break;

                case cell.minesAroundCount:
                    cellContent = cell.minesAroundCount
                    break;

                default:
                    cellContent = EMPTY
                    break;
            }
            const className = `cell cell-${i}-${j}`


            strHTML += `<td onclick="onCellClicked(this, ${i},${j})" class="${className}">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) { // אני מרגיש שהפטרון שלי לא מוצלח ולא וורסטילי בגלל הצורך בסטרינג שכתבתי ידני
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value

}

//  Count mines around each cell and set the cell's minesAroundCount.


function placeFlag() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault(); // Stop the default right-click menu
            var CurCords = getCordsByClassName(cell.className)
            var curCell = gBoard[CurCords.i][CurCords.j]
            curCell.isMarked = !curCell.isMarked
            if (!gGame.shownCount) { return }
            if (curCell.isShown || !gGame.isOn) { return }
            if (curCell.isMarked) {
                renderCell(CurCords, FLAG_IMG)
                cell.classList.remove('cell')
                cell.classList.add('flag')
                gGame.markedCount++

            } else {
                if (curCell.isMine) renderCell(CurCords, MINE_IMG)
                else
                    renderCell(CurCords, curCell.minesAroundCount)
                gGame.markedCount--
                cell.classList.remove('flag')
                cell.classList.add('cell')
            }
            updateScores()
            isGameOver()
        });
    });
}

function countNeighborMines(cellI, cellJ, mat) {
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

function placeRandomMines(gBoard, HowManyMines) {
    var emptyCordsArray = EmptyAvailableCellCordsArray(gBoard)
    var CopyCordsArray = [...emptyCordsArray]
    for (let i = 1; i <= HowManyMines; i++) {
        var curIdx = getRandomIntInclusive(0, CopyCordsArray.length - 1)
        var curElCellCords = CopyCordsArray[curIdx]
        gBoard[curElCellCords.i][curElCellCords.j].isMine = true
        renderCell(curElCellCords, MINE_IMG)
        CopyCordsArray.splice(curIdx, 1)
    }
}

function updateScores() {
    gGame.secsPassed = document.querySelector('.timer').innerText
    document.querySelector('.mark-count h6').innerText = gGame.markedCount
    document.querySelector('.score-count h6').innerText = gGame.shownCount
    livesCount()

}

function livesCount() {
    var strHTML = ''
    for (let i = 0; i < gGame.livesCount; i++) {
        strHTML += '❤️'
    }
 var res =  document.querySelector('.lives')
res.innerHTML = strHTML

}


function onCellClicked(elCell, i, j) {
    var curCell = gBoard[i][j]
    if (curCell.isMarked || curCell.isShown || !gGame.isOn) { return }
    elCell.classList.add('hide-before')
    curCell.isShown = true
    if (curCell.isMine) {
        gGame.livesCount--
        updateScores()
      
    }
    else if (gGame.shownCount === 0) {
        gGame.shownCount++
        placeRandomMines(gBoard, gLevel.MINES)
        setMinesNegsCount(gBoard)
    } else {
        gGame.shownCount++
        expandShown(gBoard, elCell, i, j)
    }
    updateScores()
    isGameOver()

}


function setMinesNegsCount(gBoard) {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var cellLocation = { i: i, j: j }
            if (cell.isMine) continue;
            else {
                cell.minesAroundCount = countNeighborMines(i, j, gBoard)
                renderCell(cellLocation, cell.minesAroundCount)
            }
        }
    }

}

function expandShown(board, elCell, i, j) {
    var curEmptyNeighbors = NeighborEmptyCords(i, j, board)
    for (let i = 0; i < curEmptyNeighbors.length; i++) {
        var row = curEmptyNeighbors[i].row
        var coll = curEmptyNeighbors[i].coll
        if (board[row][coll].isMarked) continue;
        else document.querySelector(`.cell-${row}-${coll}`).classList.add('hide-before')
        board[row][coll].isShown = true
        gGame.shownCount++
    }
}



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

function youLose() {
    document.querySelector('.game-over').style.visibility = 'visible'
    document.querySelector('.game-over').innerText = 'GAME OVER \n you lose'
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                clearInterval(timerInterval)
                document.querySelector(`.cell-${i}-${j}`).classList.add('hide-before')
                gGame.isOn = false
            }
        }
    }
}

function victory() {
    document.querySelector('.game-over').style.visibility = 'visible'
    document.querySelector('.game-over').innerText = 'GAME OVER \n you win!'
    clearInterval(timerInterval)
    gGame.isOn = false
}

function isGameOver() {
    var TotalCellCount = gLevel.SIZE * gLevel.SIZE
    console.log("🚀 ~ TotalCellCount:", TotalCellCount)
    var NumOFmines = gLevel.MINES
    var emptyCellsCount = TotalCellCount - NumOFmines
    for (let i = 0; i < gBoard.length; i++) {
        var diff = 3- gGame.livesCount
        for (let j = 0; j < gBoard[i].length; j++) {
            console.log("🚀 ~ isGameOver ~ gGame.shownCount + diff + gGame.markedCount :", gGame.shownCount + diff + gGame.markedCount )
            if (gGame.livesCount < 1) youLose()
            if ( gGame.shownCount  === emptyCellsCount & gGame.markedCount + diff === NumOFmines ) { victory() }
            if ( gGame.shownCount === emptyCellsCount && gGame.markedCount === NumOFmines ) { victory() }
            
            }
        }
    }
