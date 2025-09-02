// script.js - Pong Game with Rainbow Flash, Baseball Emoji, Touch Controls, and Game End

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 40; // bigger for emoji
const paddleSpeed = 6;
const ballSpeed = 5;
const WIN_SCORE = 3;

// Player paddle
let playerY = canvas.height / 2 - paddleHeight / 2;
let playerDY = 0;

// AI paddle
let aiY = canvas.height / 2 - paddleHeight / 2;
let aiDY = 0;

// Ball
let ballX = canvas.width / 2 - ballSize / 2;
let ballY = canvas.height / 2 - ballSize / 2;
let ballDX = ballSpeed;
let ballDY = ballSpeed;

// Scores
let playerScore = 0;
let aiScore = 0;
let gameOver = false;
let rainbowFlash = false;
let flashColor = '#000';
let flashTimeout = null;

// Baseball emoji
const baseball = '⚾';

// Touch controls
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const touchControls = document.getElementById('touchControls');

// Welcome overlay
const welcomeOverlay = document.getElementById('welcomeOverlay');
const startBtn = document.getElementById('startBtn');
const controlsDesktop = document.getElementById('controls-desktop');
const controlsTouch = document.getElementById('controls-touch');

function randomRainbowColor() {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function flashRainbow() {
    rainbowFlash = true;
    flashColor = randomRainbowColor();
    if (flashTimeout) clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => { rainbowFlash = false; }, 120);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawText(text, x, y, color, size = 40) {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function resetBall() {
    ballX = canvas.width / 2 - ballSize / 2;
    ballY = canvas.height / 2 - ballSize / 2;
    ballDX = -ballDX;
    ballDY = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
}

function draw() {
    // Flash background if needed
    if (rainbowFlash) {
        drawRect(0, 0, canvas.width, canvas.height, flashColor);
    } else {
        drawRect(0, 0, canvas.width, canvas.height, '#000');
    }
    // Net
    for (let i = 0; i < canvas.height; i += 30) {
        drawRect(canvas.width / 2 - 1, i, 2, 20, '#fff');
    }
    // Paddles
    drawRect(0, playerY, paddleWidth, paddleHeight, '#fff');
    drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, '#fff');
    // Ball as baseball emoji
    ctx.font = `${ballSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(baseball, ballX, ballY);
    // Scores
    drawText(playerScore, canvas.width / 4, 50, '#fff');
    drawText(aiScore, 3 * canvas.width / 4, 50, '#fff');
    // Game over
    if (gameOver) {
        drawText(
            playerScore === WIN_SCORE ? 'You Win! 🏆' : 'AI Wins! 🤖',
            canvas.width / 2,
            canvas.height / 2,
            '#fff',
            60
        );
        drawText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 60, '#fff', 30);
    }
}

function update() {
    if (gameOver) return;
    // Move player
    playerY += playerDY;
    if (playerY < 0) playerY = 0;
    if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;

    // Move AI
    if (aiY + paddleHeight / 2 < ballY) {
        aiDY = paddleSpeed;
    } else if (aiY + paddleHeight / 2 > ballY) {
        aiDY = -paddleSpeed;
    } else {
        aiDY = 0;
    }
    aiY += aiDY;
    if (aiY < 0) aiY = 0;
    if (aiY + paddleHeight > canvas.height) aiY = canvas.height - paddleHeight;

    // Move ball
    ballX += ballDX;
    ballY += ballDY;

    // Top/bottom collision
    if (ballY < 0 || ballY + ballSize > canvas.height) {
        ballDY = -ballDY;
    }

    // Player paddle collision
    if (
        ballX < paddleWidth &&
        ballY + ballSize > playerY &&
        ballY < playerY + paddleHeight
    ) {
        ballDX = -ballDX;
        let collidePoint = (ballY + ballSize / 2) - (playerY + paddleHeight / 2);
        collidePoint = collidePoint / (paddleHeight / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        ballDY = ballSpeed * Math.sin(angleRad);
        flashRainbow();
    }

    // AI paddle collision
    if (
        ballX + ballSize > canvas.width - paddleWidth &&
        ballY + ballSize > aiY &&
        ballY < aiY + paddleHeight
    ) {
        ballDX = -ballDX;
        let collidePoint = (ballY + ballSize / 2) - (aiY + paddleHeight / 2);
        collidePoint = collidePoint / (paddleHeight / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        ballDY = ballSpeed * Math.sin(angleRad);
        flashRainbow();
    }

    // Score
    if (ballX < 0) {
        aiScore++;
        if (aiScore === WIN_SCORE) {
            gameOver = true;
        }
        resetBall();
    } else if (ballX + ballSize > canvas.width) {
        playerScore++;
        if (playerScore === WIN_SCORE) {
            gameOver = true;
        }
        resetBall();
    }
}

function game() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(game);
}

// Keyboard controls
function setupKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            playerDY = -paddleSpeed;
        } else if (e.key === 'ArrowDown') {
            playerDY = paddleSpeed;
        }
    });
    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            playerDY = 0;
        }
    });
}

// Touch controls
function setupTouch() {
    if (!btnUp || !btnDown || !touchControls) return;
    btnUp.addEventListener('touchstart', function(e) {
        playerDY = -paddleSpeed;
        e.preventDefault();
    });
    btnDown.addEventListener('touchstart', function(e) {
        playerDY = paddleSpeed;
        e.preventDefault();
    });
    btnUp.addEventListener('touchend', function(e) {
        playerDY = 0;
        e.preventDefault();
    });
    btnDown.addEventListener('touchend', function(e) {
        playerDY = 0;
        e.preventDefault();
    });
    // Swipe support
    let touchStartY = null;
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
        }
    });
    canvas.addEventListener('touchmove', function(e) {
        if (touchStartY !== null && e.touches.length === 1) {
            let deltaY = e.touches[0].clientY - touchStartY;
            if (Math.abs(deltaY) > 10) {
                playerDY = deltaY > 0 ? paddleSpeed : -paddleSpeed;
            }
        }
    });
    canvas.addEventListener('touchend', function(e) {
        playerDY = 0;
        touchStartY = null;
    });
}

// Device detection and UI
function setupDeviceUI() {
    if (isTouch) {
        if (controlsDesktop) controlsDesktop.style.display = 'none';
        if (controlsTouch) controlsTouch.style.display = '';
        if (touchControls) touchControls.style.display = '';
        setupTouch();
    } else {
        if (controlsDesktop) controlsDesktop.style.display = '';
        if (controlsTouch) controlsTouch.style.display = 'none';
        if (touchControls) touchControls.style.display = 'none';
        setupKeyboard();
    }
}

// Start game after welcome
function startGame() {
    if (welcomeOverlay) welcomeOverlay.style.display = 'none';
    game();
}

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

setupDeviceUI();

// Prevent scrolling on mobile
window.addEventListener('touchmove', function(e) {
    if (isTouch) e.preventDefault();
}, { passive: false });
