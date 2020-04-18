class Deck
{
    constructor(size)
    {
        this.size = size ;

        this.reset()
    }

    shuffle()
    {
        for (let i = 0; i < 10; ++i )
        {
            var index1 = Math.floor(Math.random()*this.deck.length) ;
            var index2 = Math.floor(Math.random()*this.deck.length) ;
    
            if ( index1 != index2 )
            {
                let temp = this.deck[index1] ;
                this.deck[index1] = this.deck[index2] ;
                this.deck[index2] = temp ;
            }
        }  
    }

    pop()
    {
        return ( this.deck.length ? this.deck.pop() : blank) ;
    }

    reset()
    {
        this.deck = [] ;

        for( let i = 0; i < this.size; ++i)
        {
            this.deck.push(i) ;
        }
    }
}

class Tile
{
    constructor(value, selected, enabled)
    {
        this.value = value ;
        this.selected = selected ;
        this.enabled = enabled ;
    }
}

const ADD = "←" ;
const REMOVE = "→" ;

class Step
{
    constructor(action, digit, row, column)
    {
        this.action = action ;
        this.digit = digit ;
        this.row = row ;
        this.column = column ;
    }

    toString()
    {
        if (this.action == ADD)
        {
            return `[${this.row},${this.column}] ${this.action} ${this.digit}` ;
        }
        else
        {
            return `[${this.row},${this.column}] ${this.action} ${this.digit}` ;
        }
    }
}

class Steps
{
    constructor()
    {
        this.steps = [] ;
    }

    push(step)
    {
        this.steps.push(step) ;
    }

    pop()
    {
        if (this.steps.length > 0)
        {
            return this.steps.pop() ;
        }
        else
        {
            return "" ;
        }
    }

    clear()
    {
        this.steps = [] ;
    }

    count()
    {
        return this.steps.length ;
    }

    toString()
    {
        let result = "" ;

        for (let i = 0 ; i < this.steps.length ; ++i)
        {
            result += `${i+1}. ${this.steps[i].toString()}\n` ;
        }

        return result ;
    }
}

const dimensions = 4 ;
const blank = -1 ;
var tiles ;

var solution = [[],[],[],[]] ;
var userAnswers = [
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank]] ;

var board = [[],[],[],[],[]] ;
var sumBoard = [[],[],[]] ;
var boardColors ; // Randomize board colors
var steps = new Steps() ;

var TILES = $("#tiles > div") ;
var BOARD = $("#board > .box") ;
var lockApp = false ; // lockApp when showing answer.
var timerId ;
var timerStartTime ;
var timePastSec ;
var isPuzzleCorrect ;
var colorPatternNo = 2 ;
var revealedNumbers = [] ;

const GAME_INTRO = "\nINSTRUCTIONS:\nPlace the numbers 0-15 in the spaces so that the number in each circle is equal to the sum of the four surrounding spaces and each color total is correct.\nClick on a tile to select and click on a box(Board) to place it." ;

function createSolution()
{
    let deck = new Deck(dimensions * dimensions) ;

    deck.shuffle() ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            solution[row][col] = deck.pop() ;
        }
    }
}

function setBoard()
{
    createSolution() ;

    board[0].push($("#A1"))
    board[0].push($("#A2"))
    board[0].push($("#A3"))
    board[0].push($("#A4"))

    board[1].push($("#B1"))
    board[1].push($("#B2"))
    board[1].push($("#B3"))
    board[1].push($("#B4"))

    board[2].push($("#C1"))
    board[2].push($("#C2"))
    board[2].push($("#C3"))
    board[2].push($("#C4"))

    board[3].push($("#D1"))
    board[3].push($("#D2"))
    board[3].push($("#D3"))
    board[3].push($("#D4"))

    board[4].push($("#E1"))
    board[4].push($("#E2"))
    board[4].push($("#E3"))
    board[4].push($("#E4"))

    boardColors = [[1,0,3,4],[1,2,3,4],[0,2,0,4],[1,2,3,0]] ;

    var positionDeck = new Deck(dimensions) ;
    var colorDeck = new Deck(dimensions) ;

    positionDeck.shuffle() ;
    colorDeck.shuffle() ;

    setBoardColor(positionDeck.pop(), colorDeck.pop()+1) ;
    setBoardColor(positionDeck.pop(), colorDeck.pop()+1) ;
    setBoardColor(positionDeck.pop(), colorDeck.pop()+1) ;
    colorDeck.reset() ;
    setBoardColor(positionDeck.pop(), colorDeck.pop()+1) ;

    // boardColors = rotateBoardColors(boardColors) ;

    var colorPatternDeck = new Deck(5) ;
    colorPatternDeck.shuffle() ;
    colorPatternNo = colorPatternDeck.pop() ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            board[row][col].addClass(`colorPattern${colorPatternNo}-${boardColors[row][col]}`) ;
            board[row][col].click(function() {
                boardClicked(row, col) ;
            })
        }
    }

    for (let col = 0; col < dimensions; ++col)
    {
        board[4][col].addClass(`colorPattern${colorPatternNo}-${col+1}`) ;
        board[4][col].text(solution[0][col]+solution[1][col]+solution[2][col]+solution[3][col]) ;

        board[4][col].text(calculateSumForColor(col+1)) ;
    }

    sumBoard[0].push($("#SA1"))
    sumBoard[0].push($("#SA2"))
    sumBoard[0].push($("#SA3"))
    sumBoard[1].push($("#SB1"))
    sumBoard[1].push($("#SB2"))
    sumBoard[1].push($("#SB3"))
    sumBoard[2].push($("#SC1"))
    sumBoard[2].push($("#SC2"))
    sumBoard[2].push($("#SC3"))

    sumBoard[0][0].text(solution[0][0] + solution[0][1] + solution[1][0] + solution[1][1]) ;
    sumBoard[0][1].text(solution[0][1] + solution[0][2] + solution[1][1] + solution[1][2] ) ;
    sumBoard[0][2].text(solution[0][2] + solution[0][3] + solution[1][2] + solution[1][3] ) ;
    sumBoard[1][0].text(solution[1][0] + solution[1][1] + solution[2][0] + solution[2][1] ) ;
    sumBoard[1][1].text(solution[1][1] + solution[1][2] + solution[2][1] + solution[2][2] ) ;
    sumBoard[1][2].text(solution[1][2] + solution[1][3] + solution[2][2] + solution[2][3] ) ;
    sumBoard[2][0].text(solution[2][0] + solution[2][1] + solution[3][0] + solution[3][1] ) ;
    sumBoard[2][1].text(solution[2][1] + solution[2][2] + solution[3][1] + solution[3][2] ) ;
    sumBoard[2][2].text(solution[2][2] + solution[2][3] + solution[3][2] + solution[3][3] ) ;

    TILES = $("#tiles > div") ;
    
    // initialize tiles
    initializeTiles() ;

    steps.clear() ;
    updateBoard() ;
    updateTiles() ;

    TILES.click(function() {
        tileClicked(this) ;
    }) ;

    timerId = setInterval(updateTimer, 1000) ;
    timerStartTime = new Date() ;
    isPuzzleCorrect = false ;    
}

function rotateBoardColors(boardColors)
{
    let randomDeck = new Deck(4) ;

    randomDeck.shuffle() ;

    let rotationCount = randomDeck.pop() ;


    for( let i = 0; i <= rotationCount; ++i)
    {
        boardColors = rotateBoardColorsOnce(boardColors) ;
    }

    return boardColors ;
}

function rotateBoardColorsOnce(boardColors)
{
    let newBoardColors = [[0,0,0,0], [0,0,0,0], [0,0,0,0]] ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            newBoardColors[col][2-row] = boardColors[row][col] ;
        }
    }

    return newBoardColors ;
}

function updateTimer()
{
    let now = new Date() ;
    timePastSec = Math.floor((now - timerStartTime)/1000) ;

    $("#timer").val(secondsToTimeString(timePastSec)) ;
}

function secondsToTimeString(timePastSec)
{
    let hours = Math.floor(timePastSec/3600) ;
    let minutes = Math.floor((timePastSec%3600)/60) ;
    let seconds = Math.floor(timePastSec%60) ;

    if ( hours )
    {
        return `${leadingZero(hours)}:${leadingZero(minutes)}:${leadingZero(seconds)}`
    }
    else
    {
        return `${leadingZero(minutes)}:${leadingZero(seconds)}`
    }
}

function leadingZero(number)
{
    return number > 9 ? number : "0" + number ; 
}

function initializeTiles()
{
    tiles = [] ;
    
    for( let i = 0; i < dimensions * dimensions ; ++i)
    {
        tiles.push(new Tile(i, false, true)) ;
    }
}

function clearTileSelection()
{
    for( let i = 0; i < dimensions * dimensions ; ++i)
    {
        tiles[i].selected = false ;
    }
}

function calculateSumForColor(color)
{
    let total = 0 ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( boardColors[row][col] == color)
            {
                total += solution[row][col] ;
            }
        }
    }

    return total ;
}

function boardClicked(row, col)
{
    if ( isAppLocked() )
    {
        return ;
    }

    selectedTileIndex = getSelectedTileIndex() ;

    if ( selectedTileIndex < 0 )
    {
        if (userAnswers[row][col] != blank)
        {
            steps.push(new Step(REMOVE, userAnswers[row][col], row, col )) ;
            tiles[userAnswers[row][col]].enabled = true ;
            tiles[userAnswers[row][col]].selected = true ;
            userAnswers[row][col] = blank ;
            updateBoard() ;
            updateTiles() ;
        }
        else
        {
            // alert("Select a tile before selecting box.") ;
            logToPage("Select a tile before selecting box.") ;
        }
    }
    else
    {
        if ( userAnswers[row][col] >= 0)
        {
            tiles[userAnswers[row][col]].enabled = true ;
            tiles[userAnswers[row][col]].selected = true ;
            steps.push(new Step(REMOVE, userAnswers[row][col], row, col )) ;
        }

        userAnswers[row][col] = tiles[selectedTileIndex].value ;
        tiles[selectedTileIndex].selected = false ;
        tiles[selectedTileIndex].enabled = false ;
        steps.push(new Step(ADD, userAnswers[row][col], row, col )) ;

        updateBoard() ;
        updateTiles() ;
    }
}

function setBoardColor(position, color)
{
    if ( position == 0)
    {
        boardColors[0][1] = color ;
    }
    else if ( position == 1)
    {
        boardColors[2][0] = color ;
    }
    else if ( position == 2)
    {
        boardColors[2][2] = color ;
    }
    else
    {
        boardColors[3][3] = color ;
    }
}

function getSelectedTileIndex()
{
    for( let i = 0; i < dimensions * dimensions ; ++i)
    {
        if ( tiles[i].selected )
        {
            return i ;
        }
    }

    return blank ;
}

function tileClicked(e)
{
    if (isAppLocked())
    {
        return ;
    }

    let result = !tiles[e.innerText].selected ;

    if (!tiles[e.innerText].enabled) return ;

    tiles.forEach(tile => {
        tile.selected = false ;
    });

    tiles[e.innerText].selected = result ;

    updateTiles() ;
}

function updateTiles()
{
    TILES.removeClass("tileSelected").removeClass("tileNotSelected").removeClass("tileEnabled").removeClass("tileDisabled") ;

    TILES.each(function(index) {
        this.innerText = tiles[index].value ;
        tiles[index].selected ? $(this).addClass("tileSelected") : $(this).addClass("tileNotSelected") ;
        tiles[index].enabled ? $(this).addClass("tileEnabled") : $(this).addClass("tileDisabled") ;
    }) ;
}

function updateBoard()
{
    showSteps() ;
    showAnswer(false) ; // show user answers on board
    markTotalFields() ; // mark total fields with correct/incorrect colors.
    checkAnswer(true) ; // check automatically
}

function markTotalFields()
{
    let result = markGridTotalField(0,0) ;
    
    result = markGridTotalField(0,1) && result ;
    result = markGridTotalField(0,2) && result ;
    result = markGridTotalField(1,0) && result ;
    result = markGridTotalField(1,1) && result ;
    result = markGridTotalField(1,2) && result ;
    result = markGridTotalField(2,0) && result ;
    result = markGridTotalField(2,1) && result ;
    result = markGridTotalField(2,2) && result ;

    result = markColorTotalField(1) && result ;
    result = markColorTotalField(2) && result ;
    result = markColorTotalField(3) && result ;
    result = markColorTotalField(4) && result ;

    return result ;
}

function markGridTotalField(row, col)
{
    if ( (userAnswers[row][col] != blank) && (userAnswers[row][col+1] != blank) && (userAnswers[row+1][col] != blank) && (userAnswers[row+1][col+1] != blank) )
    {
        let userTotal = userAnswers[row][col] + userAnswers[row][col+1] + userAnswers[row+1][col] + userAnswers[row+1][col+1] ;

        if ( sumBoard[row][col].text() == userTotal )
        {
            sumBoard[row][col].removeClass("incorrect").addClass("correct") ;

            return true ;
        }
        else
        {
            sumBoard[row][col].removeClass("correct").addClass("incorrect") ;
        }
    }
    else
    {
        sumBoard[row][col].removeClass("correct").removeClass("incorrect") ;
    }

    return false ;
}

function markColorTotalField(color)
{
    let userTotal = 0 ;
    let isColorComplete = true ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( boardColors[row][col] == color)
            {
                if ( userAnswers[row][col] == blank )
                {
                    isColorComplete = false ;

                    break ;
                }
                else
                {
                    userTotal += userAnswers[row][col] ;
                }
            }
        }
    }

    if ( isColorComplete )
    {
        if ( board[4][color-1].text() == userTotal)
        {
            board[4][color-1].removeClass("incorrect").addClass("correct") ;

            return true ;
        }
        else
        {
            board[4][color-1].removeClass("correct").addClass("incorrect") ;
        }
    }
    else
    {
        board[4][color-1].removeClass("correct").removeClass("incorrect") ;
    }

    return false ;
}

function showAnswer(show)
{
    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            board[row][col].text(show ? solution[row][col] : userAnswers[row][col] != blank ? userAnswers[row][col] : "") ;
        }
    }
}

function checkAnswer(autoCheck)
{
    let isComplete = true ;
    let isCorrect = true ;
    let wrongAnswers = 0 ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( userAnswers[row][col] == blank )
            {
                isComplete = false ;

                break ;
            }
        }
    }

    if ( isComplete )
    {
        for (let row = 0; row < dimensions; ++row)
        {
            for (let col = 0; col < dimensions; ++col)
            {
                if ( userAnswers[row][col] != solution[row][col] )
                {
                    isCorrect = false ;
    
                    ++wrongAnswers ;
                }
            }
        }

        if ( isCorrect )
        {
            clearInterval(timerId) ;

            setTimeout(function() {
                    alert(`Congratulations, you completed puzzle in [${secondsToTimeString(timePastSec)}] !!!!`) ;
                 }, 500) ;
            
            logToPage(`Checking - Congratulations, you completed puzzle in [${secondsToTimeString(timePastSec)}]`) ;
            isPuzzleCorrect = true ;
        }
        else if (markTotalFields())
        {
            setTimeout(function() {
                alert(`Congratulations, You found alternative Solution in [${secondsToTimeString(timePastSec)}] !!!!`) ;
             }, 500) ;
        
            logToPage(`Checking - Congratulations. You have found alternative solution in [${secondsToTimeString(timePastSec)}] !!!!.`) ;
            isCorrect = true ;
        }
        else if (!autoCheck) // log & alert only if not auto check
        {
            alert(`Incorrect. You have ${wrongAnswers} wrong answers.`) ;
            logToPage(`Checking - Incorrect. You have ${wrongAnswers} wrong answers.`) ;
        }
    }
    else if (!autoCheck) // log only if not auto check
    {
        // alert("Please fill all boxes...") ;
        logToPage("Checking - Incomplete, fill all boxes.") ;

        return ;
    }
}

function toggleAnswer()
{
    answer = $("#answer") ;

    if ( !lockApp )
    {
        if (!confirm("Aer you sure you want to reveal answers?"))
        {
            return ;
        }
    }

    if ( answer.val() == "Show Answer" )
    {
        logToPage("Showing Answer.") ;
        showAnswer(true) ;
        answer.val("Hide Answer") ;
        lockApp = true ;
    }
    else
    {
        logToPage("Hiding answer...") ;
        showAnswer(false) ;
        answer.val("Show Answer") ;
        lockApp = false ;
    }
}

function isAppLocked()
{
    if ( lockApp )
    {
        alert("Board is locked while showing answer!!!") ;
        logToPage(`Board is locked while showing answer!!!`) ;

        return true ;
    }

    return false ;
}

function resetBoard()
{
    if (lockApp)
    {
        toggleAnswer() ;
    }
    else if (!confirm("Aer you sure you want to reset board?"))
    {
        return ;
    }

    userAnswers = [
        [blank, blank, blank, blank],
        [blank, blank, blank, blank],
        [blank, blank, blank, blank],
        [blank, blank, blank, blank]] ;

    initializeTiles() ;
    steps.clear() ;

    updateBoard() ;
    updateTiles() ;

    revealedNumbers.forEach(number => {
        moveNumberToBoard(number) ;
    }) ;

    logToPage("Resetting Board...") ;
}

function newPuzzle(ask)
{
    if (!isPuzzleCorrect && ask && !confirm("Aer you sure you want to discard current puzzle?"))
    {
        return ;
    }

    if (lockApp)
    {
        toggleAnswer() ;
    }

    if ( timerId )
    {
        clearInterval(timerId) ;
    }

    $("#log").text(GAME_INTRO) ;
    logToPage(`Setting new Puzzle.`) ;

    tiles = [] ;
    solution = [[],[],[],[]] ;
    userAnswers = [
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank],
                    [blank, blank, blank, blank]] ;

    board = [[],[],[],[],[]] ;
    sumBoard = [[],[],[]] ;
    revealedNumbers = [] ;
 
    TILES.unbind("click") ;
    $("#board > div").unbind("click") ;
    $("#board > div").removeClass(`colorPattern${colorPatternNo}-1`).removeClass(`colorPattern${colorPatternNo}-2`).removeClass(`colorPattern${colorPatternNo}-3`).removeClass("revealedNumber") ;

    setBoard() ;
}

function logToPage(message)
{
    let now = new Date() ;

    let dateString = `${leadingZero(now.getHours())}:${leadingZero(now.getMinutes())}:${leadingZero(now.getSeconds())}` ;
    let currentMessages = $("#log").text() ;

    $("#log").text(`${dateString} - ${message}\n${currentMessages}`) ;
}

function showSteps()
{
    $("#steps").text(steps.toString()) ;
}

function undoStep()
{
    if ( lockApp )
    {
        alert("Board is locked while showing answer!!!") ;
        logToPage(`Board is locked while showing answer!!!`) ;

        return true ;
    }

    if ( steps.count() <= 0 )
    {
        logToPage("No steps left to undo...") ;       
    }

    step = steps.pop() ;

    if ( step.action == ADD)
    {
        clearTileSelection() ;
        userAnswers[step.row][step.column] = blank ;
        tiles[step.digit].enabled = true ;
        tiles[step.digit].selected = true ;
    }
    else if ( step.action == REMOVE)
    {
        userAnswers[step.row][step.column] = step.digit ;
        tiles[step.digit].enabled = false ;
        tiles[step.digit].selected = false ;
    }

    updateBoard() ;
    updateTiles() ;
}

function revealOneBox()
{
    let remainingBoxes = [] ;

    if ( revealedNumbers.length > 3)
    {
        if (!confirm(`Already revealed ${revealedNumbers.length} numbers. Are you sure you want to reveal one more?`))
        {
            return ;
        }
    }

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( userAnswers[row][col] == blank )
            {
                remainingBoxes.push(row*dimensions+col) ;
            }
        }
    }

    if ( remainingBoxes.length == 0)
    {
        alert("No box left to reveal.") ;
        logToPage("No box left to reveal.") ;

        return ;
    }

    let d = new Deck(remainingBoxes.length) ;
    d.shuffle() ;
    let revealLocation = remainingBoxes[d.pop()] ;
    let revealRow = Math.floor(revealLocation/dimensions) ;
    let revealCol = Math.floor(revealLocation%dimensions) ;
    let revealNumber = solution[revealRow][revealCol] ;

    // console.log(`Reveal: (${revealRow},${revealCol}) - ${revealNumber}`) ;

    let tile = tiles[revealNumber] ;

    // if revealRow/revealCol is not blank, then move tile back.
    if ( userAnswers[revealRow][revealCol] != blank)
    {
        clearTileSelection() ;
        boardClicked(revealRow, revealCol) ;
    }

    // if tile is not available, move number back to tiles.
    if ( !tiles[revealNumber].enabled )
    {
        moveNumberBack(revealNumber) ;
    }
    else
    {
        tiles[revealNumber].selected = true ;
    }

    boardClicked(revealRow, revealCol) ;
    logToPage(`Revealed(${revealRow},${revealCol}) - ${revealNumber}`) ;
    board[revealRow][revealCol].addClass("revealedNumber") ;
    revealedNumbers.push(revealNumber) ;
}

function moveNumberBack(number)
{
    clearTileSelection() ;
    let numRow = -1 ;
    let numCol = -1 ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( userAnswers[row][col] == number )
            {
                numRow = row ;
                numCol = col ;

                break ;
            }
        }
    }

    if ( numRow >= 0 && numCol >= 0 )
    {
        boardClicked(numRow, numCol) ;
    }
    else
    {
        console.log(`Oops... ${number} not found on the board...`) ;
        alert(`Oops... ${number} not found on the board...`) ;
    }
}

function moveNumberToBoard(number)
{
    if ( !tiles[number].enabled )
    {
        alert(`${number} tile is already used.`) ;
        console.log(`${number} tile is already used.`) ;

        return ;
    }

    clearTileSelection() ;
    let numRow = -1 ;
    let numCol = -1 ;

    for (let row = 0; row < dimensions; ++row)
    {
        for (let col = 0; col < dimensions; ++col)
        {
            if ( solution[row][col] == number )
            {
                numRow = row ;
                numCol = col ;

                break ;
            }
        }
    }

    if ( numRow >= 0 && numCol >= 0 )
    {
        tiles[number].selected = true ;
        boardClicked(numRow, numCol) ;
    }
    else
    {
        alert(`Oops... ${number} not found in tiles...`) ;
        console.log(`Oops... ${number} not found in tiles...`) ;
    }
}