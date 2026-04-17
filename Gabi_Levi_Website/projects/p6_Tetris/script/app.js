// ===== Intro / Game Toggle =====
function startGame() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('game-container').style.display = '';
    initGame();
}

// ===== Constants =====
var COLS = 10;
var ROWS = 20;
var BLOCK_SIZE = 30;
var COLORS = ['#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'];

var SHAPES = [
    [[1,1,1,1]],                         // I
    [[1,0,0],[1,1,1]],                   // J
    [[0,0,1],[1,1,1]],                   // L
    [[1,1],[1,1]],                       // O
    [[0,1,1],[1,1,0]],                   // S
    [[0,1,0],[1,1,1]],                   // T
    [[1,1,0],[0,1,1]]                    // Z
];

// ===== Game State =====
var canvas, ctx;
var board;
var currentPiece, currentX, currentY, currentColor;
var score, lines, level;
var gameOver, paused;
var dropInterval, dropTimer, lastTime;
var timerInterval, startTime, elapsedSeconds;
var gameStarted = false;

// ===== Init =====
function initGame() {
    canvas = document.getElementById('tetris-canvas');
    ctx = canvas.getContext('2d');

    if (!gameStarted) {
        document.addEventListener('keydown', handleKey);
        document.getElementById('restart-btn').addEventListener('click', resetGame);
        gameStarted = true;
    }

    resetGame();
}

function resetGame() {
    board = [];
    for (var r = 0; r < ROWS; r++) {
        board[r] = [];
        for (var c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }

    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    paused = false;
    dropInterval = 1000;
    lastTime = 0;
    elapsedSeconds = 0;

    updateDisplay();
    spawnPiece();

    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    requestAnimationFrame(gameLoop);
}

// ===== Piece Management =====
function spawnPiece() {
    var index = Math.floor(Math.random() * SHAPES.length);
    currentPiece = SHAPES[index];
    currentColor = COLORS[index];
    currentX = Math.floor((COLS - currentPiece[0].length) / 2);
    currentY = 0;

    if (collides(currentPiece, currentX, currentY)) {
        gameOver = true;
        clearInterval(timerInterval);
    }
}

function rotatePiece(piece) {
    var rows = piece.length;
    var cols = piece[0].length;
    var rotated = [];
    for (var c = 0; c < cols; c++) {
        rotated[c] = [];
        for (var r = rows - 1; r >= 0; r--) {
            rotated[c].push(piece[r][c]);
        }
    }
    return rotated;
}

function collides(piece, px, py) {
    for (var r = 0; r < piece.length; r++) {
        for (var c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                var nx = px + c;
                var ny = py + r;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && board[ny][nx]) return true;
            }
        }
    }
    return false;
}

function lockPiece() {
    for (var r = 0; r < currentPiece.length; r++) {
        for (var c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                var ny = currentY + r;
                var nx = currentX + c;
                if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
                    board[ny][nx] = currentColor;
                }
            }
        }
    }
    clearLines();
    spawnPiece();
}

function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
        var full = true;
        for (var c = 0; c < COLS; c++) {
            if (!board[r][c]) { full = false; break; }
        }
        if (full) {
            board.splice(r, 1);
            var emptyRow = [];
            for (var c2 = 0; c2 < COLS; c2++) emptyRow.push(0);
            board.unshift(emptyRow);
            cleared++;
            r++;
        }
    }
    if (cleared > 0) {
        var points = [0, 100, 300, 500, 800];
        score += points[cleared] * level;
        lines += cleared;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 80);
        updateDisplay();
    }
}

// ===== Input =====
function handleKey(e) {
    if (gameOver || paused) return;

    switch (e.key) {
        case 'ArrowLeft':
            if (!collides(currentPiece, currentX - 1, currentY)) currentX--;
            break;
        case 'ArrowRight':
            if (!collides(currentPiece, currentX + 1, currentY)) currentX++;
            break;
        case 'ArrowDown':
            if (!collides(currentPiece, currentX, currentY + 1)) currentY++;
            else lockPiece();
            break;
        case 'ArrowUp':
            var rotated = rotatePiece(currentPiece);
            if (!collides(rotated, currentX, currentY)) currentPiece = rotated;
            break;
        case ' ':
            while (!collides(currentPiece, currentX, currentY + 1)) currentY++;
            lockPiece();
            break;
    }

    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].indexOf(e.key) !== -1) {
        e.preventDefault();
    }
}

// ===== Rendering =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(c, r, board[r][c]);
            }
        }
    }

    // Draw grid lines
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    for (var r2 = 0; r2 <= ROWS; r2++) {
        ctx.beginPath();
        ctx.moveTo(0, r2 * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, r2 * BLOCK_SIZE);
        ctx.stroke();
    }
    for (var c2 = 0; c2 <= COLS; c2++) {
        ctx.beginPath();
        ctx.moveTo(c2 * BLOCK_SIZE, 0);
        ctx.lineTo(c2 * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }

    // Draw current piece
    if (!gameOver) {
        for (var r3 = 0; r3 < currentPiece.length; r3++) {
            for (var c3 = 0; c3 < currentPiece[r3].length; c3++) {
                if (currentPiece[r3][c3]) {
                    drawBlock(currentX + c3, currentY + r3, currentColor);
                }
            }
        }
    }

    // Game over text
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e53e3e';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#0a0a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
}

// ===== Display Updates =====
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
}

function updateTimer() {
    elapsedSeconds++;
    var mins = Math.floor(elapsedSeconds / 60);
    var secs = elapsedSeconds % 60;
    document.getElementById('timer').textContent =
        (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ===== Game Loop =====
function gameLoop(timestamp) {
    if (gameOver) { draw(); return; }

    var delta = timestamp - lastTime;
    if (delta > dropInterval) {
        if (!collides(currentPiece, currentX, currentY + 1)) {
            currentY++;
        } else {
            lockPiece();
        }
        lastTime = timestamp;
    }

    draw();
    requestAnimationFrame(gameLoop);
}
