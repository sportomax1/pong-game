// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
let paddleWidth = 15;
let paddleHeight = 120;
let ballRadius = 12;
let paddleSpeed = 8;
let winningScore = 3;

let paddle1Y, paddle2Y;
let ballX, ballY, ballSpeedX, ballSpeedY;
let score1 = 0;
let score2 = 0;
let gameState = "playing"; // "playing", "gameOver"
let winner = "";

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
    message.textContent = `Welcome to ${deviceType} Pong!`;
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

// Check for win condition
function checkWinCondition() {
    if (score1 >= winningScore) {
        gameState = "gameOver";
        winner = "Player 1";
    } else if (score2 >= winningScore) {
        gameState = "gameOver";
        winner = "Player 2";
    }
}

// Restart game
function restartGame() {
    score1 = 0;
    score2 = 0;
    gameState = "playing";
    winner = "";
    confettiParticles = [];
    confettiDuration = 0;
    resetBall();
    // Reset key states
    keys.r = false;
    keys.R = false;
}

// Key state tracking for smooth desktop movement
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    r: false,
    R: false
};

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
    // Smooth keyboard controls for desktop
    document.addEventListener("keydown", function(e) {
        if (e.key in keys) {
            keys[e.key] = true;
        }
        // Handle restart immediately on key press for better responsiveness
        if ((e.key === 'r' || e.key === 'R') && gameState === "gameOver") {
            restartGame();
        }
    });
    
    document.addEventListener("keyup", function(e) {
        if (e.key in keys) {
            keys[e.key] = false;
        }
    });
}

// Click to restart when game is over
canvas.addEventListener("click", function(e) {
    if (gameState === "gameOver") {
        restartGame();
    }
});

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

// Confetti particles system
let confettiParticles = [];
let confettiDuration = 0;

function createConfettiParticles() {
    confettiParticles = [];
    confettiDuration = 60; // frames
    for(let i = 0; i < 30; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.3,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * 5 + 2,
            size: Math.random() * 8 + 3,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
}

function updateConfetti() {
    if (confettiDuration > 0) {
        confettiDuration--;
        for (let particle of confettiParticles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3; // gravity
            particle.rotation += particle.rotationSpeed;
        }
        // Remove particles that are off screen
        confettiParticles = confettiParticles.filter(p => 
            p.y < canvas.height + 50 && p.x > -50 && p.x < canvas.width + 50
        );
    }
}

function drawConfetti() {
    if (confettiDuration > 0) {
        for (let particle of confettiParticles) {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.restore();
        }
    }
}

// Legacy confetti function - replaced with animated version
function confetti() {
    createConfettiParticles();
}

// Game update
function update() {
    if (gameState === "gameOver") {
        // Handle restart input
        if (keys.r || keys.R) {
            restartGame();
        }
        return;
    }
    
    // Smooth paddle movement for desktop
    if (!isMobile()) {
        if (keys.ArrowUp) {
            paddle1Y -= paddleSpeed;
        }
        if (keys.ArrowDown) {
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
            checkWinCondition();
            resetBall();
            confetti();
        }
    }

    // Right paddle collision
    if(ballX + ballRadius > canvas.width - paddleWidth){
        if(ballY > paddle2Y && ballY < paddle2Y + paddleHeight){
            ballSpeedX = -ballSpeedX;
        } else {
            score1++;
            checkWinCondition();
            resetBall();
            confetti();
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
    
    // Update confetti animation
    updateConfetti();
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
    
    // Draw animated confetti
    drawConfetti();
    
    // Draw game over screen
    if (gameState === "gameOver") {
        // Semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Winner message
        const winText = `${winner} Wins!`;
        const restartText = "Click or Press 'R' to Restart";
        
        // Calculate text positions for centering
        ctx.font = "48px Arial";
        const winTextWidth = ctx.measureText(winText).width;
        ctx.font = "24px Arial";
        const restartTextWidth = ctx.measureText(restartText).width;
        
        // Draw winner text
        drawText(winText, (canvas.width - winTextWidth) / 2, canvas.height / 2 - 30, "#fff", "48px Arial");
        
        // Draw restart instruction
        drawText(restartText, (canvas.width - restartTextWidth) / 2, canvas.height / 2 + 30, "#ccc", "24px Arial");
    }
}

// Main loop
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
