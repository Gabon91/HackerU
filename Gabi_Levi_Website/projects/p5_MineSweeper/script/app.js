// ===== Intro / Game Toggle =====
function startGame() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('game-container').style.display = '';
    initGame();
}

// ===== Constants =====
var ROWS = 9;
var COLS = 9;
var TOTAL_MINES = 10;

// ===== Game State =====
var board = [];
var revealed = [];
var flagged = [];
var minesLeft;
var gameOver;
var gameWon;
var firstClick;
var timerInterval;
var elapsedSeconds;
var cellsRevealed;

// ===== Init =====
function initGame() {
    board = [];
    revealed = [];
    flagged = [];
    minesLeft = TOTAL_MINES;
    gameOver = false;
    gameWon = false;
    firstClick = true;
    elapsedSeconds = 0;
    cellsRevealed = 0;

    for (var r = 0; r < ROWS; r++) {
        board[r] = [];
        revealed[r] = [];
        flagged[r] = [];
        for (var c = 0; c < COLS; c++) {
            board[r][c] = 0;
            revealed[r][c] = false;
            flagged[r][c] = false;
        }
    }

    if (timerInterval) clearInterval(timerInterval);
    updateDisplay();
    setSmiley('😊');
    renderBoard();

    document.getElementById('restart-btn').addEventListener('click', initGame);
    document.getElementById('smiley-btn').addEventListener('click', initGame);
}

// ===== Place Mines (after first click) =====
function placeMines(safeRow, safeCol) {
    var placed = 0;
    while (placed < TOTAL_MINES) {
        var r = Math.floor(Math.random() * ROWS);
        var c = Math.floor(Math.random() * COLS);
        if (board[r][c] === -1) continue;
        if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
        board[r][c] = -1;
        placed++;
    }
    // Calculate numbers
    for (var r2 = 0; r2 < ROWS; r2++) {
        for (var c2 = 0; c2 < COLS; c2++) {
            if (board[r2][c2] === -1) continue;
            var count = 0;
            forEachNeighbor(r2, c2, function (nr, nc) {
                if (board[nr][nc] === -1) count++;
            });
            board[r2][c2] = count;
        }
    }
}

function forEachNeighbor(r, c, fn) {
    for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            var nr = r + dr;
            var nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                fn(nr, nc);
            }
        }
    }
}

// ===== Render =====
function renderBoard() {
    var boardEl = document.getElementById('mine-board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 34px)';

    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var cell = document.createElement('div');
            cell.className = 'mine-cell';
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);

            (function (row, col) {
                cell.addEventListener('click', function () { handleClick(row, col); });
                cell.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
            })(r, c);

            boardEl.appendChild(cell);
        }
    }
}

function updateCellDisplay(r, c) {
    var index = r * COLS + c;
    var cell = document.getElementById('mine-board').children[index];
    if (!cell) return;

    cell.className = 'mine-cell';

    if (flagged[r][c] && !revealed[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '';
    } else if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (board[r][c] === -1) {
            cell.textContent = '💣';
            cell.classList.add('mine-hit');
        } else if (board[r][c] > 0) {
            cell.textContent = board[r][c];
            cell.classList.add('n' + board[r][c]);
        } else {
            cell.textContent = '';
        }
    } else {
        cell.textContent = '';
    }
}

// ===== Click Handlers =====
function handleClick(r, c) {
    if (gameOver || gameWon || flagged[r][c] || revealed[r][c]) return;

    if (firstClick) {
        firstClick = false;
        placeMines(r, c);
        startTimer();
    }

    if (board[r][c] === -1) {
        // Hit a mine
        revealAllMines();
        revealed[r][c] = true;
        updateCellDisplay(r, c);
        gameOver = true;
        setSmiley('😵');
        clearInterval(timerInterval);
        return;
    }

    revealCell(r, c);
    checkWin();
}

function handleRightClick(r, c) {
    if (gameOver || gameWon || revealed[r][c]) return;

    flagged[r][c] = !flagged[r][c];
    minesLeft += flagged[r][c] ? -1 : 1;
    updateCellDisplay(r, c);
    updateDisplay();
}

// ===== Reveal Logic =====
function revealCell(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (revealed[r][c] || flagged[r][c]) return;

    revealed[r][c] = true;
    cellsRevealed++;
    updateCellDisplay(r, c);

    if (board[r][c] === 0) {
        forEachNeighbor(r, c, function (nr, nc) {
            revealCell(nr, nc);
        });
    }
}

function revealAllMines() {
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            if (board[r][c] === -1) {
                revealed[r][c] = true;
                updateCellDisplay(r, c);
            }
        }
    }
}

// ===== Win Check =====
function checkWin() {
    var safeCells = ROWS * COLS - TOTAL_MINES;
    if (cellsRevealed === safeCells) {
        gameWon = true;
        setSmiley('😎');
        clearInterval(timerInterval);
        // Auto-flag remaining mines
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (board[r][c] === -1 && !flagged[r][c]) {
                    flagged[r][c] = true;
                    updateCellDisplay(r, c);
                }
            }
        }
        minesLeft = 0;
        updateDisplay();
    }
}

// ===== Display =====
function updateDisplay() {
    document.getElementById('mines-left').textContent = minesLeft;
}

function setSmiley(emoji) {
    document.getElementById('smiley').textContent = emoji;
}

function startTimer() {
    elapsedSeconds = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        elapsedSeconds++;
        var mins = Math.floor(elapsedSeconds / 60);
        var secs = elapsedSeconds % 60;
        document.getElementById('timer').textContent =
            (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }, 1000);
}