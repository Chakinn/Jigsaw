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
var gallery = document.getElementById("gallery");
var gameMenu = document.getElementById("gameMenu");
var beginButton = document.getElementById("beginButton");
var menuButton = document.getElementById("menuButton");
var galleryMenu = document.getElementById("galleryMenu");
var columnInput = document.getElementById("columnInput");
var rowInput = document.getElementById("rowInput");
var victoryText = document.getElementById("victoryText");

var sectionWidth;
var sectionHeight;

function drawSection(sectionX, sectionY) {
    let originalX = board[sectionX][sectionY].x
    let originalY = board[sectionX][sectionY].y
    if (originalX !== -1) {
        jigsawContext.drawImage(currentImage, originalX * sectionWidth, originalY * sectionHeight, sectionWidth, sectionHeight, sectionX * sectionWidth, sectionY * sectionHeight, sectionWidth, sectionHeight);
    }
    else {
        jigsawContext.fillStyle = "#dd0000";
        jigsawContext.fillRect(sectionX * sectionWidth, sectionY * sectionHeight, sectionWidth, sectionHeight);
    }
}

function drawBoard() {
    for (var i = 0; i < settings.columnCount; i++) {
        for (var j = 0; j < settings.rowCount; j++) {
            drawSection(i, j);
        }
    }
}

var previousSection = { x: 0, y: 0 };

function highlightSection(sectionX, sectionY) {
    var imgData = jigsawContext.getImageData(sectionX * sectionWidth, sectionY * sectionHeight, sectionWidth, sectionHeight);
    var pixels = imgData.data;
    for (var i = 0; i < pixels.length; i += 4) {
        var factor = 50;
        pixels[i] = Math.min(pixels[i] + factor, 255);
        pixels[i + 1] = Math.min(pixels[i + 1] + factor, 255);
        pixels[i + 2] = Math.min(pixels[i + 2] + factor, 255);
    }
    jigsawContext.putImageData(imgData, sectionX * sectionWidth, sectionY * sectionHeight);
}

//hides game and shows gallery
function showGalleryView() {
    jigsawCanvas.style.display = "none";
    gameMenu.style.display = "none";
    gallery.style.display = "grid";
    galleryMenu.style.display = "flex";
}

//hides gallery and shows game screen
function showGameView() {
    jigsawCanvas.style.display = "inline";
    gameMenu.style.display = "flex";
    gallery.style.display = "none";
    galleryMenu.style.display = "none";
    beginButton.textContent = "begin";
}

/**********CONTROLLER**********/
var currentImage;

function initializeGame(gameImage) {
    showGameView();
    sectionWidth = jigsawCanvas.width / settings.columnCount;
    sectionHeight = jigsawCanvas.height / settings.rowCount;
    jigsawContext.drawImage(gameImage, 0, 0);
    currentImage = gameImage;
}

//Determines which section contains given coordinates
function sectionFromCoords(x, y) {
    canvasX = (jigsawCanvas.width / jigsawCanvas.offsetWidth) * x
    canvasY = (jigsawCanvas.height / jigsawCanvas.offsetHeight) * y
    column = Math.floor(canvasX / sectionWidth);
    row = Math.floor(canvasY / sectionHeight);
    return { x: column, y: row };
}

function resolveClick(sectionX, sectionY) {
    if (blankNeighbour(sectionX, sectionY)) {
        swap(sectionX, sectionY, blank.x, blank.y);
        drawBoard();
        blank.x = sectionX;
        blank.y = sectionY;
        if (isCompleted()) {
            finishGame();
        }
    }
}

//Listeners only active during game
var clickEventListener = (event) => {
    let section = sectionFromCoords(event.offsetX, event.offsetY);
    resolveClick(section.x, section.y);
};

var moveEventListener = (event) => {
    let section = sectionFromCoords(event.offsetX, event.offsetY);

    if (section.x !== previousSection.x || section.y !== previousSection.y) {
        if (blankNeighbour(section.x, section.y)) {
            highlightSection(section.x, section.y);
        }
        drawSection(previousSection.x, previousSection.y);
        previousSection = section;
    }
};

//adds game handlers
function addMouseHandlers() {
    jigsawCanvas.addEventListener("click", clickEventListener);
    jigsawCanvas.addEventListener("mousemove", moveEventListener);
}

//removes game handlers
function removeMouseHandlers() {
    jigsawCanvas.removeEventListener("click", clickEventListener);
    jigsawCanvas.removeEventListener("mousemove", moveEventListener);
}

function startGame() {
    beginButton.textContent = "restart";
    victoryText.style.display = "none";
    addMouseHandlers();
    initializeBoard();
    shuffleBoard();
    drawBoard();
}

function finishGame() {
    removeMouseHandlers();
    victoryText.style.display = "inline";
}


/**********GALLERY**********/

var selectedElement = null;
var selectedImage = "";

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

function initializeUI() {
    gallery.addEventListener("click", (event) => {
        if (event.target.matches(".galleryImage")) {
            selectedImage = event.target.src;
            selectedImage = selectedImage.slice(selectedImage.lastIndexOf("/") + 1);
            selectedImage = selectedImage.replace(new RegExp("_c|_s"), "");
            selectedImage = "images/".concat(selectedImage);
            if (selectedElement !== null) {
                selectedElement.classList.remove("selected");
            }
            selectedElement = event.target.parentElement;
            selectedElement.classList.add("selected");

        }
    });

    startButton.addEventListener("click", () => {
        if (selectedImage === "" || columnInput.value < 2 || rowInput.value < 2) {
            return;
        }
        var initializeGamePromise = new Promise((resolve, reject) => {
            var gameImage = new Image();
            gameImage.onload = () => { resolve(gameImage) };
            gameImage.onerror = () => { reject(gameImage) };
            gameImage.src = selectedImage;
        });
        initializeGamePromise.then((gameImage) => {
            settings.columnCount = columnInput.value;
            settings.rowCount = rowInput.value;
            initializeGame(gameImage);
        }).catch(() => {

        })
    });

    beginButton.addEventListener("click", () => { startGame(); });
    menuButton.addEventListener("click", () => {
        removeMouseHandlers();
        showGalleryView();
    });
    loadHDGallery();
}

initializeUI();