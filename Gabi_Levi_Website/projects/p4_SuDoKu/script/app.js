// ===== Intro / Game Toggle =====
function startGame() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('game-container').style.display = '';
    initGame();
}

// ===== Game State =====
var solution = [];
var puzzle = [];
var given = [];
var selectedRow = -1;
var selectedCol = -1;
var timerInterval;
var elapsedSeconds;
var gameWon;
var gameStarted = false;

// ===== Init =====
function initGame() {
    selectedRow = -1;
    selectedCol = -1;
    elapsedSeconds = 0;
    gameWon = false;

    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timer').textContent = '00:00';

    generatePuzzle();
    renderBoard();
    startTimer();

    if (!gameStarted) {
        document.getElementById('restart-btn').addEventListener('click', initGame);
        setupNumberPad();
        document.addEventListener('keydown', handleKeyPress);
        gameStarted = true;
    }
}

// ===== Puzzle Generator =====
function generateSolution() {
    solution = [];
    for (var r = 0; r < 9; r++) {
        solution[r] = [0,0,0,0,0,0,0,0,0];
    }
    fillBoard(0, 0);
}

function fillBoard(row, col) {
    if (row === 9) return true;
    var nextRow = col === 8 ? row + 1 : row;
    var nextCol = col === 8 ? 0 : col + 1;

    var nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (var i = 0; i < nums.length; i++) {
        if (isValid(solution, row, col, nums[i])) {
            solution[row][col] = nums[i];
            if (fillBoard(nextRow, nextCol)) return true;
            solution[row][col] = 0;
        }
    }
    return false;
}

function isValid(board, row, col, num) {
    for (var c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    for (var r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    var boxR = Math.floor(row / 3) * 3;
    var boxC = Math.floor(col / 3) * 3;
    for (var r2 = boxR; r2 < boxR + 3; r2++) {
        for (var c2 = boxC; c2 < boxC + 3; c2++) {
            if (board[r2][c2] === num) return false;
        }
    }
    return true;
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i]; a[i] = a[j]; a[j] = temp;
    }
    return a;
}

function generatePuzzle() {
    generateSolution();
    puzzle = [];
    given = [];
    for (var r = 0; r < 9; r++) {
        puzzle[r] = solution[r].slice();
        given[r] = [];
        for (var c = 0; c < 9; c++) {
            given[r][c] = true;
        }
    }
    var cellsToRemove = 46;
    var positions = [];
    for (var r2 = 0; r2 < 9; r2++) {
        for (var c2 = 0; c2 < 9; c2++) {
            positions.push([r2, c2]);
        }
    }
    positions = shuffle(positions);
    for (var i = 0; i < cellsToRemove; i++) {
        var pr = positions[i][0];
        var pc = positions[i][1];
        puzzle[pr][pc] = 0;
        given[pr][pc] = false;
    }
}

// ===== Render Board =====
function renderBoard() {
    var boardEl = document.getElementById('sudoku-board');
    boardEl.innerHTML = '';

    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            var cell = document.createElement('div');
            cell.className = 'sudoku-cell';

            if (given[r][c]) {
                cell.classList.add('given');
                cell.textContent = puzzle[r][c];
            } else if (puzzle[r][c] !== 0) {
                cell.textContent = puzzle[r][c];
                if (puzzle[r][c] !== solution[r][c]) {
                    cell.classList.add('error');
                }
            }

            (function (row, col) {
                cell.addEventListener('click', function () {
                    selectCell(row, col);
                });
            })(r, c);

            boardEl.appendChild(cell);
        }
    }
    highlightSelection();
}

function selectCell(r, c) {
    if (gameWon) return;
    selectedRow = r;
    selectedCol = c;
    highlightSelection();
}

function highlightSelection() {
    var cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(function (cell, index) {
        var r = Math.floor(index / 9);
        var c = index % 9;
        cell.classList.remove('selected', 'highlighted');

        if (r === selectedRow && c === selectedCol) {
            cell.classList.add('selected');
        } else if (selectedRow >= 0 && (r === selectedRow || c === selectedCol ||
            (Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
             Math.floor(c / 3) === Math.floor(selectedCol / 3)))) {
            cell.classList.add('highlighted');
        }
    });
}

// ===== Input =====
function setupNumberPad() {
    var buttons = document.querySelectorAll('.num-btn');
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var num = parseInt(btn.getAttribute('data-num'));
            placeNumber(num);
        });
    });
}

function handleKeyPress(e) {
    if (gameWon) return;
    var key = parseInt(e.key);
    if (key >= 1 && key <= 9) {
        placeNumber(key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        placeNumber(0);
    }
}

function placeNumber(num) {
    if (selectedRow < 0 || selectedCol < 0) return;
    if (given[selectedRow][selectedCol]) return;
    if (gameWon) return;

    puzzle[selectedRow][selectedCol] = num;
    renderBoard();
    checkWin();
}

// ===== Win Check =====
function checkWin() {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (puzzle[r][c] !== solution[r][c]) return;
        }
    }
    gameWon = true;
    clearInterval(timerInterval);
    setTimeout(function () {
        alert('!כל הכבוד, פתרת את הסודוקו');
    }, 100);
}

// ===== Timer =====
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
