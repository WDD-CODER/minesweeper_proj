



// onCellClicked(elCell, i, j) Called when a cell is clicked

// onCellMarked(elCell) Called when a cell is right - clicked See how you can hide the context menu on right click

// checkGameOver() Game ends when all mines are marked, and all the other cells are shown

// expandShown(board, elCell, i, j) When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.

// NOTE: start with a basic implementation that only opens the non - mine 1st degree neighbors 

// BONUS: if you have the time later, try to work more like the real 

// algorithm(see description at the Bonuses section below)






// •
// Add some randomicity for mines location

// •
// After you have this functionality working– its best to comment the code and switch back to static 
// location to help you focus during the development phase
// Step5 –

// •
// Add a footer with your name

// •
// Upload to git
// Continue to Functionality and Features, then to Further Tasks, and if you went that far, 
// do go ahead and check the Bonus Tasks.

// function getEmptyCord(board) {
//     // var emptyCordsArray = []
//     for (let i = 0; i < board.length; i++) {
//         for (let j = 0; j < board[0].length; j++) {

            
//         var randomCell = board[i][j]
//         if (!randomCell.isMine) { emptyCordsArray.push(randomCell) }
//     }
// }
// return emptyCordsArray
// }
function getEmptyCords(board) {
    var emptyCordsArray = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
        var randomCell = board[i][j]
        if (!randomCell.isMine) { emptyCordsArray.push(randomCell) }
    }
}
return emptyCordsArray
}

function getRandomCord(){
 var  emptyCordsArray =  getEmptyCords(gBoard)
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
