settings = {
    columnCount: 4,
    rowCount: 4,
    imageURL: "C:\\Sem5\WWW\\Lista3\\Jigsaw\\images\\karina-zhukovskaya-qMI4XmgTST8-unsplash.jpg"
}

/*
    image is split into tiles indexed with x:columnNumber, y:rowNumber starting from 0
*/


/**********MODEL**********/
/*
    Board is represented by array of arrays
    each entry represents section of original image with given coordinates
    an example of original(unchanged) 3x3 board:
    [
        [{x:0,y:0},{x:1,y:0},{x:2,y:0}]
        [{x:0,y:1},{x:1,y:1},{x:2,y:1}]
        [{x:0,y:2},{x:1,y:2},{x:2,y:2}]
    ]
    an example of 3x3 board where top-left corner was swaped with top-right corner:
    [
        [{x:2,y:0},{x:1,y:0},{x:0,y:0}]
        [{x:0,y:1},{x:1,y:1},{x:2,y:1}]
        [{x:0,y:2},{x:1,y:2},{x:2,y:2}]
    ]
    blank section is represented by {x:-1,y:-1}
*/
var board;
function initializeBoard() {
    board = new Array(settings.columnCount)
    for (var i = 0; i < settings.columnCount; i++) {
        var column = [];
        for (var j = 0; j < settings.rowCount; j++) {
            column.push({ x: i, y: j });
        }
        board[i] = column;
    }
}

function isBlank(coords) {
    if (coords.x === -1 && coords.y === -1) {
        return true;
    }
    return false;
}

//swaps section (x,y) with blank neighbouring section if it's possible
function blankNeighbour(x, y) {
    //check left
    if (x > 0 && isBlank(board[x - 1][y])) {
        swap(x, y, x - 1, y);
    }
    //check right
    if (x < settings.columnCount-1 && isBlank(board[x + 1][y])) {
        swap(x, y, x + 1, y);
    }
    //check top
    if (y > 0 && isBlank(board[x][y - 1])) {
        swap(x, y, x, y - 1);
    }
    //check bot
    if (x < settings.rowCount-1 && isBlank(board[x][y + 1])) {
        swap(x, y, x, y + 1);
    }

}

//swaps section (x1,y1) with section (x2,y2)
function swap(x1, y1, x2, y2) {
    [board[x1][y1], board[x2][y2]] = [board[x2][y2], board[x1][y1]]
}

//Shuffles board considering rules of the game (shuffled board is solvable)
function shuffleBoard() {
    board[0][0] = {x:-1,y:-1}; //mark top left as blank
    var blank = {x:0,y:0};  //save blank coordinates
    for(var i = 0; i < 1000; i++) {
        var move = randomInt(4); //0-left,1-top,2-right,3-bot
        switch(move) {
            case 0: {
                if(blank.x > 0) {
                    swap(blank.x,blank.y,blank.x-1,blank.y);
                    blank = {x:blank.x-1,y:blank.y};
                }
                break;
            }
            case 1: {
                if(blank.y > 0) {
                    swap(blank.x,blank.y,blank.x,blank.y-1);
                    blank = {x:blank.x,y:blank.y-1};
                }
                break;
            }
            case 2: {
                if(blank.x < settings.columnCount-1) {
                    swap(blank.x,blank.y,blank.x + 1,blank.y);
                    blank = {x:blank.x+1,y:blank.y};
                }
                break;
            }
            case 3: {
                if(blank.y < settings.rowCount-1) {
                    swap(blank.x,blank.y,blank.x,blank.y+1);
                    blank = {x:blank.x,y:blank.y+1};
                }
                break;
            }
        }
    }

}
//returns random int from 0 to bound-1
function randomInt(bound) {
    return Math.floor(Math.random() * bound);
}

//checks if the puzzle is completed
function isCompleted() {
    for (var i = 0; i < settings.columnCount; i++) {
        for (var j = 0; j < settings.rowCount; j++) {
            var coord = board[i][j];
            if (coord.x !== i && coord.x !== -1 && coord.y !== j && coord.y !== -1) {
                return false
            }
        }
    }
    return true;
}


initializeBoard();
shuffleBoard();
console.log(board);




