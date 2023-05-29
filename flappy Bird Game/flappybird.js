

//  flappybird game using JavaScript




//board
let board;
let boardWidth = 360;           // canvas dimensions 
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;       // x coordinate of bird
let birdY = boardHeight/2;      // y- coordinate of bird (in the middle of screen)
let birdImg;                    

let bird = {            // bird object with these 4 parameters
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;     // pype position is top right corner
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;  // Gravity is rate of change of velocity over time. It is positive means downward direction.

let gameOver = false;
let score = 0;

window.onload = function() { 
    board = document.getElementById("board"); // get the canvas using DOM
    board.height = boardHeight;     // set the canvas height
    board.width = boardWidth;         // Set the canvas width
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load  bird images
    birdImg = new Image();      // object of Image()
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {           // load the bird image
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image(); 
    topPipeImg.src = "./toppipe.png";       // object the top pipe image.

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";     // object of down pipe image.

    requestAnimationFrame(update);      // call update function from outside
    setInterval(placePipes, 1500); //every 1.5 seconds call placePipes and it will push the pipes in Array
    document.addEventListener("keydown", moveBird); // whenever you press a key it calls moveBird function
}

function update() {                 // update the frame of the canvas i.e redraw the canvas over and over again
    requestAnimationFrame(update);  // call update function from inside
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);     // before load the new frame clear the previous frame

    //bird
    velocityY += gravity;       // Change Velocity by  applying velocity in y-direction
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // draw the bird image over and over again.

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {         // if game over just return
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);  // decrease the height of pipe and generate it randomly.
    let openingSpace = board.height/4;

    let topPipe = {         // top pipe object
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false          // flappy bird has not yet passed this pipe
    }
    pipeArray.push(topPipe);        // push the topPipe object to pipeArray

    let bottomPipe = {                  // down pipe object
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,    // place the pipe after opening space from top.
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);     // push the bottomPipe object to pipeArray
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") { // if we press space or up arrow or x in keyboard
        //jump
        velocityY = -6;         // Bird jumps

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}