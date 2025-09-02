// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
let paddleWidth = 15;
let paddleHeight = 120;
let ballRadius = 12;
let paddleSpeed = 8;

let paddle1Y, paddle2Y;
let ballX, ballY, ballSpeedX, ballSpeedY;
let score1 = 0;
let score2 = 0;
let gameState = "playing"; // "playing" or "won"
let winner = 0; // 1 or 2
let keys = {}; // Track key states for smooth movement

// Device detection
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth > 768)) {
        return "Tablet";
    } else if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return "Mobile";
    } else {
        return "Desktop";
    }
}

// Show welcome popup
function showWelcomePopup() {
    const deviceType = getDeviceType();

    const overlay = document.createElement("div");
    overlay.id = "welcomeOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 9999;

    const box = document.createElement("div");
    box.style.backgroundColor = "#fff";
    box.style.padding = "30px";
    box.style.borderRadius = "10px";
    box.style.textAlign = "center";
    box.style.maxWidth = "80%";
    box.style.fontFamily = "Arial, sans-serif";

    const message = document.createElement("p");
    message.textContent = `⚽ WELCOME TO ${deviceType.toUpperCase()} PONG! ⚽`;
    message.style.fontSize = "24px";
    message.style.marginBottom = "20px";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.padding = "10px 20px";
    closeBtn.style.cursor = "pointer";

    closeBtn.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    box.appendChild(message);
    box.appendChild(closeBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// Call popup on load
window.addEventListener("load", showWelcomePopup);

// Detect mobile for controls
function isMobile() {
    const type = getDeviceType();
    return type === "Mobile" || type === "Tablet";
}

// Resize canvas
function resizeCanvas() {
    if(isMobile()){
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.7;
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }
    paddle1Y = canvas.height / 2 - paddleHeight / 2;
    paddle2Y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initialize ball in center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Restart the entire game
function restartGame() {
    score1 = 0;
    score2 = 0;
    gameState = "playing";
    winner = 0;
    resetBall();
    // Remove any existing win overlay
    const existingOverlay = document.getElementById("winOverlay");
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }
    // Reset paddle positions
    paddle1Y = canvas.height / 2 - paddleHeight / 2;
    paddle2Y = canvas.height / 2 - paddleHeight / 2;
}

// Show win message
function showWinMessage(winnerPlayer) {
    // Remove any existing win overlay first
    const existingOverlay = document.getElementById("winOverlay");
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }
    
    const overlay = document.createElement("div");
    overlay.id = "winOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 10000; // Higher than welcome popup

    const box = document.createElement("div");
    box.style.backgroundColor = "#fff";
    box.style.padding = "40px";
    box.style.borderRadius = "15px";
    box.style.textAlign = "center";
    box.style.maxWidth = "80%";
    box.style.fontFamily = "Arial, sans-serif";

    const message = document.createElement("p");
    message.textContent = `🎉 PLAYER ${winnerPlayer} WINS! 🎉`;
    message.style.fontSize = "28px";
    message.style.marginBottom = "20px";
    message.style.color = "#007BFF";
    message.style.fontWeight = "bold";

    const instruction = document.createElement("p");
    instruction.textContent = "Click here or press 'R' to restart";
    instruction.style.fontSize = "18px";
    instruction.style.marginBottom = "20px";
    instruction.style.color = "#666";

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Game";
    restartBtn.style.fontSize = "18px";
    restartBtn.style.padding = "10px 20px";
    restartBtn.style.cursor = "pointer";
    restartBtn.style.border = "none";
    restartBtn.style.borderRadius = "5px";
    restartBtn.style.backgroundColor = "#007BFF";
    restartBtn.style.color = "white";

    restartBtn.addEventListener("click", restartGame);
    overlay.addEventListener("click", restartGame);

    box.appendChild(message);
    box.appendChild(instruction);
    box.appendChild(restartBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// Touch controls for mobile/tablet
if(isMobile()){
    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        paddle1Y = touch.clientY - paddleHeight / 2;
        if (paddle1Y < 0) paddle1Y = 0;
        if (paddle1Y + paddleHeight > canvas.height) paddle1Y = canvas.height - paddleHeight;
    });
} else {
    // Keyboard controls for desktop - track key states for smooth movement
    document.addEventListener("keydown", function(e) {
        keys[e.key] = true;
        
        // Handle restart
        if (e.key === "r" || e.key === "R") {
            if (gameState === "won") {
                restartGame();
            }
        }
    });
    
    document.addEventListener("keyup", function(e) {
        keys[e.key] = false;
    });
}

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.fill();
}

function drawText(text, x, y, color, font="30px Arial") {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

// Confetti effect
function confetti() {
    for(let i=0;i<50;i++){
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 8 + 2;
        ctx.fillStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
        ctx.fillRect(x,y,size,size);
    }
}

// Game update
function update() {
    // Don't update game if someone has won
    if (gameState === "won") {
        return;
    }

    // Handle smooth desktop paddle movement
    if (!isMobile()) {
        if (keys["ArrowUp"]) {
            paddle1Y -= paddleSpeed;
        }
        if (keys["ArrowDown"]) {
            paddle1Y += paddleSpeed;
        }
        // Keep paddle in bounds
        if (paddle1Y < 0) paddle1Y = 0;
        if (paddle1Y + paddleHeight > canvas.height) paddle1Y = canvas.height - paddleHeight;
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/bottom collision
    if(ballY - ballRadius < 0 || ballY + ballRadius > canvas.height){
        ballSpeedY = -ballSpeedY;
    }

    // Left paddle collision
    if(ballX - ballRadius < paddleWidth){
        if(ballY > paddle1Y && ballY < paddle1Y + paddleHeight){
            ballSpeedX = -ballSpeedX;
        } else {
            score2++;
            resetBall();
            confetti();
            // Check for win condition
            if (score2 >= 3) {
                gameState = "won";
                winner = 2;
                showWinMessage(2);
            }
        }
    }

    // Right paddle collision
    if(ballX + ballRadius > canvas.width - paddleWidth){
        if(ballY > paddle2Y && ballY < paddle2Y + paddleHeight){
            ballSpeedX = -ballSpeedX;
        } else {
            score1++;
            resetBall();
            confetti();
            // Check for win condition
            if (score1 >= 3) {
                gameState = "won";
                winner = 1;
                showWinMessage(1);
            }
        }
    }

    // Simple AI for right paddle
    if(paddle2Y + paddleHeight/2 < ballY){
        paddle2Y += paddleSpeed;
    } else {
        paddle2Y -= paddleSpeed;
    }
    if(paddle2Y < 0) paddle2Y = 0;
    if(paddle2Y + paddleHeight > canvas.height) paddle2Y = canvas.height - paddleHeight;
}

// Render game
function render() {
    // Clear canvas
    drawRect(0,0,canvas.width,canvas.height,"#000");

    // Draw paddles
    drawRect(0, paddle1Y, paddleWidth, paddleHeight, "#fff");
    drawRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight, "#fff");

    // Draw red ball
    drawCircle(ballX, ballY, ballRadius, "red");

    // Draw scores
    drawText(score1, canvas.width*0.25, 50, "#fff");
    drawText(score2, canvas.width*0.75, 50, "#fff");
}

// Main loop
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
