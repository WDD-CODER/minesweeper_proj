'use strict'

// global consts

const FLAG_IMG = `<img src="img/flag.jpg" alt="mine_img">`
const MINE_IMG = `<img src="img/mine.jpg" alt="mine_img">`
const EMPTY = ''
// global variables 
var timerInterval
var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame
var gCurElapsedTime
// var gBestScores = Infinity


function onInit() {
    clearInterval(timerInterval)

    gCurElapsedTime = 0
    gGame = { isOn: false, shownCount: 0, markedCount: 0, timePassed: 0, livesCount: 3, hintsCount: 3, hintActive: false }
    document.querySelector('.smiley').innerText = '😊'
    document.querySelector('.game-over').style.visibility = 'hidden'
    //starter
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.board-container')
    placeFlag()
    updateScores()
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
                isMarked: false
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

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value

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

// Deals with mouse right click and marking cells.
function placeFlag() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault(); // Stop the default right-click menu
            var CurCords = getCordsByClassName(cell.className)
            var curCell = gBoard[CurCords.i][CurCords.j]
            if (!gGame.shownCount || curCell.isShown || !gGame.isOn) return
            curCell.isMarked = !curCell.isMarked // Toggle is marked.
            if (curCell.isMarked) {
                renderCell(CurCords, FLAG_IMG)
                cell.classList.remove('cell')
                cell.classList.add('flag')
                gGame.markedCount++
            } else {
                cell.classList.remove('flag')
                cell.classList.add('cell')
                gGame.markedCount--


                if (curCell.isMine) {
                    renderCell(CurCords, MINE_IMG)
                    gGame.markedCount--
                    cell.classList.add('mine')

                } else {
                    renderCell(CurCords, curCell.minesAroundCount)
                }
            }
            updateScores()
            isGameOver()
        })
    });

}


// Clacing randomize on board
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

//Update scoreboard.
function updateScores() {
    gGame.secsPassed = document.querySelector('.timer').innerText
    document.querySelector('.mark-count h6').innerText = gGame.markedCount
    document.querySelector('.score-count h6').innerText = gGame.shownCount
    livesCount()
}

// Manage clicks on cells.
function onCellClicked(elCell, i, j) {
    var curCell = gBoard[i][j]
    if (gGame.hintActive) {
        hintUncover(i, j)
        return
    }
    if (gGame.shownCount === 0) {
        smileyChange(curCell)
        startTimer()
        gGame.isOn = true
    }
    if (curCell.isMarked || curCell.isShown) { return }
    elCell.classList.add('hide-before')
    curCell.isShown = true
    if (curCell.isMine) {
        gGame.livesCount--
        updateScores()
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
    updateScores()
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

//implements losing situation
function youLose() {
    document.querySelector('.game-over').style.visibility = 'visible'
    document.querySelector('.game-over').innerText = 'GAME OVER \n you lose'
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                clearInterval(timerInterval)
                document.querySelector('.smiley').innerText = '☠️'
                document.querySelector(`.cell-${i}-${j}`).classList.add('hide-before')
                document.querySelector('.game-over').style.background = 'linear-gradient(to top, #ff6347, #ffea00)';

                gGame.isOn = false
            }
        }
    }
}
//implements wining situation
function victory() {
    document.querySelector('.game-over').style.visibility = 'visible'
    document.querySelector('.game-over').innerText = 'GAME OVER \n you win!'
    document.querySelector('.game-over').style.background = 'linear-gradient(to top, #adff2f, #ffea00)';
    clearInterval(timerInterval)
    gGame.isOn = false
    document.querySelector('.smiley').innerText = '😎'

}
//Checks if game over and sets victory or loss.
function isGameOver() {
    var TotalCellCount = gLevel.SIZE * gLevel.SIZE
    var NumOFmines = gLevel.MINES
    var emptyCellsCount = TotalCellCount - NumOFmines
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gGame.livesCount < 1) youLose()
            if (gGame.shownCount === emptyCellsCount && gGame.markedCount === NumOFmines) { victory() }
        }
    }
}
// Deals with all the situation after hitting a mine
function hitMine(elCell, curCell) {
    clearInterval(timerInterval)
    var blockingDiv = document.querySelector('.blocking-div')
    var mineNotice = document.querySelector('.notice')
    mineNotice.style.display = "block"
    blockingDiv.style.display = "block"
    // Change hit Mine  notice 
    if (gGame.livesCount < 1) {
        console.log('variable');
        document.querySelector('.notice h5').innerText = 'Too bad that was your last life ! \n Press me to continue \n 👇'
        document.querySelector('.notice h2').innerText = '😭'
        document.querySelector('.notice h4').innerText = 'Hit the Skull emoji to restart the game!'
    } else {
        document.querySelector('.notice h5').innerText = 'Holy moly, you\'v hit a mine! \n good thing you Still have some lives.'
        document.querySelector('.notice h2').innerText = '🤯'
        document.querySelector('.notice h4').innerText = 'Hit me to continue  \n 👇'
    }
    // Allowing to remove the hit mine notice by clicking anywhere on the screen.
    mineNotice.addEventListener("click", function (event) {
        if (!gGame.isOn) {
            mineNotice.style.display = "none";
            blockingDiv.style.display = "none";
            return
        } else {
            curCell.isShown = false
            mineNotice.style.display = "none"
            blockingDiv.style.display = "none";
            elCell.classList.remove('hide-before')


        }
    })
    blockingDiv.addEventListener("click", function (event) {
        if (!gGame.isOn) {
            mineNotice.style.display = "none";
            blockingDiv.style.display = "none";
            return
        } else {
            curCell.isShown = false
            mineNotice.style.display = "none"
            blockingDiv.style.display = "none";
            elCell.classList.remove('hide-before')
            startTimer()
        }
    })
}


function useHint(elHint) {
    if (gGame.shownCount === 0) {
        var elNotice = document.querySelector('.notice')
        var blockingDiv = document.querySelector('.blocking-div')
        elNotice.style.display = 'block'
        blockingDiv.style.display = 'block'
        document.querySelector('.notice h2').innerText = '🤣'
        document.querySelector('.notice h5').innerText = 'You forgot to unveil a cell \n You have to unveil one cell before using a hint!'
        document.querySelector('.notice h4').innerText = 'Click anywhere to continue!'
        elNotice.addEventListener("click", function (event) { elNotice.style.display = 'none'; return })
        blockingDiv.addEventListener("click", function (event) { blockingDiv.style.display = 'none'; return })
    } else {
        elHint.style.backgroundColor = ' rgb(212, 212, 54)'
        gGame.hintActive = true
        gGame.isOn = false
    }

}

function hintUncover(cellI, cellJ) {
    clearInterval(timerInterval)
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown) continue
            document.querySelector(`.cell-${i}-${j}`).classList.add('hide-before')
            if (document.querySelector(`.cell-${i}-${j}`).classList.contains('flag')) {
                var curCords = { i: i, j: j }
                var curCell = gBoard[i][j]
                renderCell(curCords, curCell.minesAroundCount)
                setTimeout(((row, coll) => {
                    return () => {
                        document.querySelector(`.cell-${row}-${coll}`).classList.remove('hide-before')
                        renderCell(curCords, FLAG_IMG)
                    }
                })(i, j), 1500);
            }
            else {
                setTimeout(((row, coll) => {
                    return () => {
                        document.querySelector(`.cell-${row}-${coll}`).classList.remove('hide-before')
                    }
                })(i, j), 1500);
            }
        }
    }

    setTimeout(() => {
        startTimer()
        gGame.hintsCount--
        renderHints()
        gGame.isOn = true
        gGame.hintActive = false
    }, 1500);

}
