const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Ball
let ball = {
    x: WIDTH/2,
    y: HEIGHT/2,
    size: 20,
    dx: 4,
    dy: 4,
    color: "red"
};

// Paddles
let paddleWidth = 10;
let paddleHeight = 100;
let paddle1 = { x: 20, y: HEIGHT/2 - paddleHeight/2 };
let paddle2 = { x: WIDTH-30, y: HEIGHT/2 - paddleHeight/2 };
let paddleSpeed = 6;

// Score
let score1 = 0;
let score2 = 0;

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Confetti
let confetti = [];

// Draw everything
function draw() {
    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    // Center line
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(WIDTH/2,0);
    ctx.lineTo(WIDTH/2, HEIGHT);
    ctx.stroke();

    // Paddles
    ctx.fillStyle = "white";
    ctx.fillRect(paddle1.x, paddle1.y, paddleWidth, paddleHeight);
    ctx.fillRect(paddle2.x, paddle2.y, paddleWidth, paddleHeight);

    // Ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size/2, 0, Math.PI*2);
    ctx.fill();

    // Score
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.fillText(`${score1}   ${score2}`, WIDTH/2 - 50, 50);

    // Draw confetti
    confetti.forEach((c, i) => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, 5, 5);
        c.x += c.vx;
        c.y += c.vy;
        if (c.y > HEIGHT || c.x < 0 || c.x > WIDTH) confetti.splice(i, 1);
    });
}

// Update game state
function update() {
    // Paddles
    if (keys["w"] && paddle1.y > 0) paddle1.y -= paddleSpeed;
    if (keys["s"] && paddle1.y + paddleHeight < HEIGHT) paddle1.y += paddleSpeed;
    if (keys["ArrowUp"] && paddle2.y > 0) paddle2.y -= paddleSpeed;
    if (keys["ArrowDown"] && paddle2.y + paddleHeight < HEIGHT) paddle2.y += paddleSpeed;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce top/bottom
    if (ball.y - ball.size/2 <= 0 || ball.y + ball.size/2 >= HEIGHT) ball.dy *= -1;

    // Bounce paddles
    if ((ball.x - ball.size/2 <= paddle1.x + paddleWidth &&
         ball.y >= paddle1.y && ball.y <= paddle1.y + paddleHeight) ||
        (ball.x + ball.size/2 >= paddle2.x &&
         ball.y >= paddle2.y && ball.y <= paddle2.y + paddleHeight)) {
        ball.dx *= -1;
    }

    // Goal detection
    if (ball.x - ball.size/2 <= 0) {
        score2++;
        resetBall();
        spawnConfetti();
    }
    if (ball.x + ball.size/2 >= WIDTH) {
        score1++;
        resetBall();
        spawnConfetti();
    }
}

// Reset ball
function resetBall() {
    ball.x = WIDTH/2;
    ball.y = HEIGHT/2;
    ball.dx *= -1;
}

// Spawn confetti
function spawnConfetti() {
    for (let i = 0; i < 50; i++) {
        confetti.push({
            x: WIDTH/2,
            y: HEIGHT/2,
            vx: Math.random()*10 -5,
            vy: Math.random()*10 -5,
            color: ["red","green","blue","yellow"][Math.floor(Math.random()*4)]
        });
    }
}

// Game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
