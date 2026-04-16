// ===== Game State =====
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0 };

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// ===== DOM References =====
let cells;
let statusText;
let restartBtn;
let scoreDisplays;

// ===== Intro / Game Toggle =====
function startGame() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('game-container').style.display = '';
}

// ===== Game Logic =====
function handleCellClick(e) {
    const cell = e.currentTarget;
    const index = cell.getAttribute('data-index');

    if (board[index] !== '' || !gameActive) return;

    board[index] = currentPlayer;
    var img = document.createElement('img');
    img.src = currentPlayer === 'X' ? 'images/X_button.png' : 'images/O_button.png';
    img.alt = currentPlayer;
    img.className = 'cell-img';
    cell.textContent = '';
    cell.appendChild(img);

    if (checkWin()) {
        statusText.textContent = currentPlayer + ' ניצח';
        scores[currentPlayer]++;
        updateScores();
        gameActive = false;
        return;
    }

    if (board.every(cell => cell !== '')) {
        statusText.textContent = '!תיקו';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.textContent = currentPlayer + ' turn.';
}

function checkWin() {
    return winConditions.some(function (condition) {
        return condition.every(function (index) {
            return board[index] === currentPlayer;
        });
    });
}

function updateScores() {
    scoreDisplays[0].textContent = scores.X;
    scoreDisplays[1].textContent = scores.O;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusText.textContent = 'X turn.';
    cells.forEach(function (cell) {
        cell.textContent = '';
        cell.innerHTML = '';
    });
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function () {
    cells = document.querySelectorAll('.cell');
    statusText = document.querySelector('.status');
    restartBtn = document.querySelector('.restart-btn');
    scoreDisplays = document.querySelectorAll('.player-score');

    cells.forEach(function (cell, index) {
        cell.setAttribute('data-index', index);
        cell.addEventListener('click', handleCellClick);
    });

    restartBtn.addEventListener('click', restartGame);
});
