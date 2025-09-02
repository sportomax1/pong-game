// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
let paddleWidth = 15;
let paddleHeight = 120;
let ballRadius = 12;
let paddleSpeed = 8;

// Game variables - using window object for global access
window.paddle1Y = undefined;
window.paddle2Y = undefined;
window.ballX = undefined;
window.ballY = undefined;
window.ballSpeedX = undefined;
window.ballSpeedY = undefined;
window.score1 = 0;
window.score2 = 0;

// Key state tracking for smooth movement
window.keysPressed = {
    ArrowUp: false,
    ArrowDown: false
};

// Confetti particles array
window.confettiParticles = [];

// Game state
window.gameEnded = false;
window.winner = null;
window.WINNING_SCORE = 3;

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
    window.paddle1Y = canvas.height / 2 - paddleHeight / 2;
    window.paddle2Y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initialize ball in center
function resetBall() {
    window.ballX = canvas.width / 2;
    window.ballY = canvas.height / 2;
    window.ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    window.ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Restart game function
window.restartGame = function() {
    window.score1 = 0;
    window.score2 = 0;
    window.gameEnded = false;
    window.winner = null;
    window.confettiParticles = [];
    window.paddle1Y = canvas.height / 2 - paddleHeight / 2;
    window.paddle2Y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
}

// Touch controls for mobile/tablet
if(isMobile()){
    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        window.paddle1Y = touch.clientY - paddleHeight / 2;
        if (window.paddle1Y < 0) window.paddle1Y = 0;
        if (window.paddle1Y + paddleHeight > canvas.height) window.paddle1Y = canvas.height - paddleHeight;
    });
} else {
    // Keyboard controls for desktop - track key state for smooth movement
    document.addEventListener("keydown", function(e) {
        if(e.key === "ArrowUp") window.keysPressed.ArrowUp = true;
        if(e.key === "ArrowDown") window.keysPressed.ArrowDown = true;
        if(e.key === "r" || e.key === "R") {
            if(window.gameEnded) window.restartGame();
        }
    });
    
    document.addEventListener("keyup", function(e) {
        if(e.key === "ArrowUp") window.keysPressed.ArrowUp = false;
        if(e.key === "ArrowDown") window.keysPressed.ArrowDown = false;
    });
}

// Add click event for restart
canvas.addEventListener("click", function() {
    if(window.gameEnded) window.restartGame();
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

// Confetti effect - create animated particles
function confetti() {
    // Create burst of confetti particles
    for(let i = 0; i < 30; i++){
        window.confettiParticles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * -8 - 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 6 + 2,
            gravity: 0.3,
            life: 150
        });
    }
}

// Update confetti particles
function updateConfetti() {
    for(let i = window.confettiParticles.length - 1; i >= 0; i--) {
        let particle = window.confettiParticles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        
        // Reduce life
        particle.life--;
        
        // Remove particles that are off screen or dead
        if(particle.life <= 0 || particle.y > canvas.height + 50) {
            window.confettiParticles.splice(i, 1);
        }
    }
}

// Draw confetti particles
function drawConfetti() {
    window.confettiParticles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
}

// Game update
function update() {
    // Don't update game logic if game has ended
    if(window.gameEnded) {
        updateConfetti();
        return;
    }
    
    // Handle smooth paddle movement for desktop
    if(!isMobile()) {
        if(window.keysPressed.ArrowUp) window.paddle1Y -= paddleSpeed;
        if(window.keysPressed.ArrowDown) window.paddle1Y += paddleSpeed;
        if(window.paddle1Y < 0) window.paddle1Y = 0;
        if(window.paddle1Y + paddleHeight > canvas.height) window.paddle1Y = canvas.height - paddleHeight;
    }
    
    window.ballX += window.ballSpeedX;
    window.ballY += window.ballSpeedY;

    // Top/bottom collision
    if(window.ballY - ballRadius < 0 || window.ballY + ballRadius > canvas.height){
        window.ballSpeedY = -window.ballSpeedY;
    }

    // Left paddle collision
    if(window.ballX - ballRadius < paddleWidth){
        if(window.ballY > window.paddle1Y && window.ballY < window.paddle1Y + paddleHeight){
            window.ballSpeedX = -window.ballSpeedX;
        } else {
            window.score2++;
            if(window.score2 >= window.WINNING_SCORE) {
                window.gameEnded = true;
                window.winner = "Player 2";
            }
            resetBall();
            confetti();
        }
    }

    // Right paddle collision
    if(window.ballX + ballRadius > canvas.width - paddleWidth){
        if(window.ballY > window.paddle2Y && window.ballY < window.paddle2Y + paddleHeight){
            window.ballSpeedX = -window.ballSpeedX;
        } else {
            window.score1++;
            if(window.score1 >= window.WINNING_SCORE) {
                window.gameEnded = true;
                window.winner = "Player 1";
            }
            resetBall();
            confetti();
        }
    }

    // Simple AI for right paddle
    if(window.paddle2Y + paddleHeight/2 < window.ballY){
        window.paddle2Y += paddleSpeed;
    } else {
        window.paddle2Y -= paddleSpeed;
    }
    if(window.paddle2Y < 0) window.paddle2Y = 0;
    if(window.paddle2Y + paddleHeight > canvas.height) window.paddle2Y = canvas.height - paddleHeight;
    
    // Update confetti particles
    updateConfetti();
}

// Render game
function render() {
    // Clear canvas
    drawRect(0,0,canvas.width,canvas.height,"#000");

    // Draw paddles
    drawRect(0, window.paddle1Y, paddleWidth, paddleHeight, "#fff");
    drawRect(canvas.width - paddleWidth, window.paddle2Y, paddleWidth, paddleHeight, "#fff");

    // Draw red ball
    drawCircle(window.ballX, window.ballY, ballRadius, "red");

    // Draw scores
    drawText(window.score1, canvas.width*0.25, 50, "#fff");
    drawText(window.score2, canvas.width*0.75, 50, "#fff");
    
    // Draw confetti
    drawConfetti();
    
    // Draw win message if game ended
    if(window.gameEnded) {
        // Draw semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw win message
        const winText = `${window.winner} Wins!`;
        ctx.fillStyle = "#FFD700";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(winText, canvas.width/2, canvas.height/2 - 30);
        
        // Draw restart instruction
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.fillText("Click or press 'R' to restart", canvas.width/2, canvas.height/2 + 30);
        ctx.textAlign = "start";
    }
}

// Main loop
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function initGame() {
    window.restartGame();
}

// Start the game after initialization
initGame();
gameLoop();
