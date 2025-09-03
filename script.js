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
const btnPause = document.getElementById('btnPause');
const touchControls = document.getElementById('touchControls');

// Welcome overlay
const welcomeOverlay = document.getElementById('welcomeOverlay');
const startBtn = document.getElementById('startBtn');
const controlsDesktop = document.getElementById('controls-desktop');
const controlsTouch = document.getElementById('controls-touch');
const playerNameInput = document.getElementById('playerNameInput');

// Pause overlay
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeBtn = document.getElementById('resumeBtn');
const historyBtn = document.getElementById('historyBtn');
const restartBtn = document.getElementById('restartBtn');
const playerHistorySection = document.getElementById('playerHistorySection');
const playerHistoryList = document.getElementById('playerHistoryList');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const pauseButtons = document.getElementById('pauseButtons');

// Game state
let isPaused = false;

// Player data
let currentPlayerName = '';
let playerHistory = [];

// Google Apps Script endpoint for shared player history
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwbLuJImJifWHQVXuTJKAUPSlgICu85k4IuMtrFc3r2vFHrgqUZk0boKx5R2NS973O-/exec';

// Load player history from Google Sheet via Apps Script
function loadPlayerHistory() {
    fetch(APPS_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            playerHistory = Array.isArray(data) ? data : [];
            displayPlayerHistory();
        })
        .catch(() => {
            playerHistory = [];
            displayPlayerHistory();
        });
}

// Add player to Google Sheet via Apps Script
function addPlayerToHistory(name) {
    if (!name || name.trim() === '') return;
    const trimmedName = name.trim();
    const now = new Date();
    const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    // Remove duplicate in local array for display only
    playerHistory = playerHistory.filter(player => player.name !== trimmedName);
    playerHistory.unshift({ name: trimmedName, timestamp });
    if (playerHistory.length > 10) {
        playerHistory = playerHistory.slice(0, 10);
    }

    // Send POST request to add to sheet
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, timestamp })
    });
}

// Pause game functionality
function pauseGame() {
    if (gameOver) return;
    isPaused = true;
    if (pauseOverlay) pauseOverlay.style.display = 'flex';
    showPauseMenu();
}

function resumeGame() {
    isPaused = false;
    if (pauseOverlay) pauseOverlay.style.display = 'none';
    game();
}

function restartGame() {
    // Reset game state
    playerScore = 0;
    aiScore = 0;
    gameOver = false;
    isPaused = false;
    playerY = canvas.height / 2 - paddleHeight / 2;
    aiY = canvas.height / 2 - paddleHeight / 2;
    resetBall();

    // Hide pause overlay and show welcome
    if (pauseOverlay) pauseOverlay.style.display = 'none';
    if (welcomeOverlay) welcomeOverlay.style.display = 'flex';

    // Clear current player name and refocus input
    currentPlayerName = '';
    if (playerNameInput) {
        playerNameInput.value = '';
        playerNameInput.focus();
    }
}

function showPauseMenu() {
    if (pauseButtons) pauseButtons.style.display = 'flex';
    if (playerHistorySection) playerHistorySection.style.display = 'none';
}

function showPlayerHistory() {
    if (pauseButtons) pauseButtons.style.display = 'none';
    if (playerHistorySection) playerHistorySection.style.display = 'block';
    displayPlayerHistory();
}

function displayPlayerHistory() {
    if (!playerHistoryList) return;

    if (playerHistory.length === 0) {
        playerHistoryList.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">No previous players found.</p>';
        return;
    }

    let historyHTML = '';
    playerHistory.forEach((player, index) => {
        historyHTML += `
            <div class="player-entry">
                <span class="player-name">${escapeHtml(player.name)}</span>
                <span class="player-timestamp">${escapeHtml(player.timestamp || '')}</span>
            </div>
        `;
    });

    playerHistoryList.innerHTML = historyHTML;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
    if (gameOver || isPaused) return;
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
    if (!gameOver && !isPaused) requestAnimationFrame(game);
}

// Keyboard controls
function setupKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            playerDY = -paddleSpeed;
        } else if (e.key === 'ArrowDown') {
            playerDY = paddleSpeed;
        } else if (e.key === 'Escape') {
            if (isPaused) {
                resumeGame();
            } else if (!gameOver && welcomeOverlay.style.display === 'none') {
                pauseGame();
            }
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

    // Pause button for touch devices
    if (btnPause) {
        btnPause.addEventListener('touchstart', function(e) {
            if (isPaused) {
                resumeGame();
            } else if (!gameOver && welcomeOverlay.style.display === 'none') {
                pauseGame();
            }
            e.preventDefault();
        });
    }

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
    const name = playerNameInput ? playerNameInput.value : '';
    currentPlayerName = name.trim();

    if (currentPlayerName) {
        addPlayerToHistory(currentPlayerName);
    }

    if (welcomeOverlay) welcomeOverlay.style.display = 'none';
    game();
}

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

// Pause menu button listeners
if (resumeBtn) {
    resumeBtn.addEventListener('click', resumeGame);
}

if (historyBtn) {
    historyBtn.addEventListener('click', showPlayerHistory);
}

if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
}

if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', showPauseMenu);
}

setupDeviceUI();

// Initialize player history from Google Sheet
loadPlayerHistory();

// Handle canvas scaling for responsive design
function scaleCanvas() {
    const container = document.querySelector('.game-container');
    if (!container || !canvas) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit canvas in container while maintaining aspect ratio
    const scaleX = (containerWidth - 20) / canvas.width;
    const scaleY = (containerHeight - 20) / canvas.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

    // Apply scaling
    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';
}

// Scale canvas on load and resize
window.addEventListener('resize', scaleCanvas);
window.addEventListener('orientationchange', function() {
    setTimeout(scaleCanvas, 100); // Delay to account for orientation change
});

// Initial canvas scaling
scaleCanvas();

// Prevent scrolling on mobile
window.addEventListener('touchmove', function(e) {
    if (isTouch) e.preventDefault();
}, { passive: false });
