settings = {
    columnCount: 3,
    rowCount: 3,
    imageURL: "C:\\Sem5\\WWW\\Lista3\\Jigsaw\\images\\tocotoucan.jpg"
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
var blank;  ////save blank coordinates
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

//checks if section (x,y) is neighbour to blank section
function blankNeighbour(x, y) {
    //check left
    if (x > 0 && isBlank(board[x - 1][y])) {
        return true;
    }
    //check right
    if (x < settings.columnCount - 1 && isBlank(board[x + 1][y])) {
        return true;
    }
    //check top
    if (y > 0 && isBlank(board[x][y - 1])) {
        return true;
    }
    //check bot
    if (y < settings.rowCount - 1 && isBlank(board[x][y + 1])) {
        return true;
    }
    return false;
}

//swaps section (x1,y1) with section (x2,y2)
function swap(x1, y1, x2, y2) {
    [board[x1][y1], board[x2][y2]] = [board[x2][y2], board[x1][y1]]
}

//Shuffles board considering rules of the game (shuffled board is solvable)
function shuffleBoard() {
    board[0][0] = { x: -1, y: -1 }; //mark top left as blank
    blank = { x: 0, y: 0 };
    for (var i = 0; i < 1000; i++) {
        var move = randomInt(4); //0-left,1-top,2-right,3-bot
        switch (move) {
            case 0: {
                if (blank.x > 0) {
                    swap(blank.x, blank.y, blank.x - 1, blank.y);
                    blank = { x: blank.x - 1, y: blank.y };
                }
                break;
            }
            case 1: {
                if (blank.y > 0) {
                    swap(blank.x, blank.y, blank.x, blank.y - 1);
                    blank = { x: blank.x, y: blank.y - 1 };
                }
                break;
            }
            case 2: {
                if (blank.x < settings.columnCount - 1) {
                    swap(blank.x, blank.y, blank.x + 1, blank.y);
                    blank = { x: blank.x + 1, y: blank.y };
                }
                break;
            }
            case 3: {
                if (blank.y < settings.rowCount - 1) {
                    swap(blank.x, blank.y, blank.x, blank.y + 1);
                    blank = { x: blank.x, y: blank.y + 1 };
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
            if (coord.x !== i && coord.x !== -1 || coord.y !== j && coord.y !== -1) {
                return false
            }
        }
    }
    return true;
}

/**********VIEW**********/
var jigsawCanvas = document.getElementById("jigsawCanvas");
var jigsawContext = jigsawCanvas.getContext("2d");
var originalCanvas = document.getElementById("originalCanvas");
var originalContext = originalCanvas.getContext("2d");
var gallery = document.getElementById("gallery");
var startButton = document.getElementById("startButton");
var beginButton = document.getElementById("beginButton");

var sectionWidth;
var sectionHeight;

function drawBoard() {
    for (var i = 0; i < settings.columnCount; i++) {
        for (var j = 0; j < settings.rowCount; j++) {
            coords = board[i][j];
            var imgData = originalContext.getImageData(coords.x * sectionWidth, coords.y * sectionHeight, sectionWidth, sectionHeight);
            jigsawContext.putImageData(imgData, i * sectionWidth, j * sectionHeight);
        }
    }
}

/**********CONTROLLER**********/
function initializeGame(gameImage) {
    initializeBoard();
    jigsawCanvas.style.display = "inline";
    originalCanvas.style.opacity = 0;
    originalCanvas.style.display = "inline";
    gallery.style.display = "none";
    startButton.style.display = "none";
    beginButton.style.display = "inline";
    beginButton.addEventListener("click", () => { startGame(); });
    sectionWidth = jigsawCanvas.offsetWidth / settings.columnCount;
    sectionHeight = jigsawCanvas.offsetHeight / settings.rowCount;
    originalContext.drawImage(gameImage, 0, 0);
    jigsawContext.drawImage(gameImage, 0, 0);
}

//Determines which section was clicked
function sectionFromClickCoords(x, y) {
    column = Math.floor(x / sectionWidth);
    row = Math.floor(y / sectionHeight);
    return { x: column, y: row };
}

function resolveClick(event) {
    if (!event.target.matches("#jigsawCanvas")) {
        return;
    }
    console.log(event.offsetX);
    section = sectionFromClickCoords(event.offsetX, event.offsetY);
    if (blankNeighbour(section.x, section.y)) {
        console.log(section.x);
        swap(section.x, section.y, blank.x, blank.y);
        drawBoard();
        blank.x = section.x;
        blank.y = section.y;
        if (isCompleted()) {
            console.log(board);
            alert("you win!")
        }
    }
}


function startGame() {
    shuffleBoard();
    drawBoard();
    document.addEventListener("click", (event) => { resolveClick(event) });
}


/**********GALLERY**********/


function getBiggerImagePath(smallImagePath) {
    var imgFilename = smallImagePath.slice(smallImagePath.lastIndexOf("/") + 1);  // extracts filename from file path  (this/is/long/path/to/image_c.jpg => image_c.jpg)
    imgFilename = imgFilename.replace("_c", "_s");
    return "images/".concat(imgFilename);
}

function loadBiggerVersion(imgElement) {
    return new Promise(
        (resolve, reject) => {
            imgElement.src = getBiggerImagePath(imgElement.src);
            imgElement.onload = () => { resolve(imgElement) };
            imgElement.onerror = () => { reject(imgElement) };
        }
    )
}

function loadHDGallery() {
    var galleryPromises = [];
    var galleryImages = document.getElementsByClassName("galleryImage");
    for (var i = 0; i < galleryImages.length; i++) {
        galleryPromises.push(loadBiggerVersion(galleryImages[i]));
    }

    Promise.all(galleryPromises).then(() => { }).catch(() => { });
}

function initializeGallery() {
    var selectedImage = "";
    var galleryImages = document.getElementsByClassName("galleryImage");
    for (var i = 0; i < galleryImages.length; i++) {
        galleryImages[i].addEventListener("click", (event) => {
            selectedImage = event.target.src;
            selectedImage = selectedImage.slice(selectedImage.lastIndexOf("/") + 1);
            selectedImage = selectedImage.replace(new RegExp("_c|_s"), "");
            selectedImage = "images/".concat(selectedImage);
            console.log(selectedImage);
        })
    }

    startButton.addEventListener("click", () => {
        if (selectedImage === "") {
            return;
        }
        var initializeGamePromise = new Promise((resolve, reject) => {
            var gameImage = new Image();
            gameImage.id = "gameImage";
            gameImage.onload = () => { resolve(gameImage) };
            gameImage.onerror = () => { reject(gameImage) };
            gameImage.src = selectedImage;
        });
        initializeGamePromise.then((gameImage) => {
            // document.body.appendChild(gameImage);
            initializeGame(gameImage);
        }).catch(() => {

        })
    });
    loadHDGallery();
}

initializeGallery();
