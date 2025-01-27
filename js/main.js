'use strict'

// global consts
const FLAG_IMG = `<img src="img/flag.jpg" alt="mine_img">`
const MINE_IMG = `<img src="img/mine.jpg" alt="mine_img">`
const EMPTY = ''
// global variables 
var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }


function onInit() {
    gGame.isOn = true
    gBoard = buildBoard(4)
    getEmptyCords(gBoard)
    placeRandomMines(gBoard, 2)
    renderBoard(gBoard, '.board-container')
    setMinesNegsCount(gBoard)

    
    
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
                isMarked: true
            }
            board[i][j] = cell
        }
    }

    // Hand placed minds for development - Should change to random at some point.
    // board[1][1].isMine = true
    // board[1][2].isMine = true

    console.table(board)
    return board

}
function hello() {
    console.log("hello")
}

function placeRandomMines(gBoard, HowManyMines) {
    var emptyCordsArray = getEmptyCords(gBoard)
    var CopyCordsArray = [...emptyCordsArray]
    for (let i = 1; i <= HowManyMines; i++) {
        var curIdx = getRandomIntInclusive(0, CopyCordsArray.length-1)
        CopyCordsArray[curIdx].isMine = true
        CopyCordsArray.splice(curIdx,1)
    }
}

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j]
            switch (true) {
                case cell.isMine:
                    var cellContent = MINE_IMG
                    break;

                case cell.minesAroundCount:
                    var cellContent = cell.minesAroundCount
                    break;

                // case cell.minesAroundCount:
                //     var cellContent = cell.minesAroundCount
                //     break;

                default:
                    var cellContent = EMPTY
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

function setMinesNegsCount(gBoard) {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var cellLocation = { i: i, j: j }
            cell.minesAroundCount = countNeighborMines(i, j, gBoard)
            if (cell.isMine) { continue }
            else renderCell(cellLocation, cell.minesAroundCount)
        }
    }

}
// // Listen to right click on mouse
// function placeFlage(){

// }
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('contextmenu', function(event) {
      event.preventDefault(); // Stop the default right-click menu
      event.target = FLAG_IMG
    });
  });

  
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

function onCellClicked(elCell, i, j) {
    // console.log("🚀 ~ onCellClicked ~ elCell:", elCell)
        elCell.classList.add('hide-before')
    // elCell.classList.remove('hide-before')
}

