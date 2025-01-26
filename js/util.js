

// onInit() This is called when page loads
//  buildBoard()Builds the board Set the mines Call setMinesNegsCount() Return the created board
 
// setMinesNegsCount(board) Count mines around each cell and set the cell's minesAroundCount.

// renderBoard(board) Render the board as a <table> to the page

// onCellClicked(elCell, i, j) Called when a cell is clicked

// onCellMarked(elCell) Called when a cell is right - clicked See how you can hide the context menu on right click

// checkGameOver() Game ends when all mines are marked, and all the other cells are shown

// expandShown(board, elCell, i, j) When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.

// NOTE: start with a basic implementation that only opens the non - mine 1st degree neighbors 

// BONUS: if you have the time later, try to work more like the real 

// algorithm(see description at the Bonuses section below)


// Step1 – the seed app:

// •
// Create a 4x4 gBoard Matrix containing Objects.

// •
// Set 2 of them to be mines

// •
// Present the mines using renderBoard() function.
// Step2 – counting neighbors:

// •
// Create setMinesNegsCount() and store the numbers

// •
// Update the renderBoard() function to also display the neighbor count and the mines

// •
// Add a console.log – to help you with debugging
// Step3 – click to reveal:

// •
// When clicking a cell, call the onCellClicked() function.

// •
// Clicking a safe cell reveals the minesAroundCount of this cell
// Step4 – randomize mines' location:

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


