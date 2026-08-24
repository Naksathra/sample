class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.mode = 'player';
        this.scores = { X: 0, O: 0, tie: 0 };
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.initializeElements();
        this.attachEventListeners();
        this.renderBoard();
        this.updateStatus('Player X\'s turn');
        this.applyTheme('neon');
    }

    initializeElements() {
        this.cells = document.querySelectorAll('.cell');
        this.statusMessage = document.getElementById('statusMessage');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreTie = document.getElementById('scoreTie');
        this.winningOverlay = document.getElementById('winningOverlay');
        this.winnerMessage = document.getElementById('winnerMessage');
        this.winnerEmoji = document.getElementById('winnerEmoji');
        this.gameBoard = document.getElementById('gameBoard');
        this.statusIndicator = document.querySelector('.status-indicator');
    }

    attachEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.dataset.index);
                this.handleCellClick(index);
            });
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.mode = e.target.dataset.mode;
                this.resetGame();
            });
        });

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyTheme(e.target.dataset.theme);
            });
        });

        document.getElementById('resetGame').addEventListener('click', () => {
            this.resetGame();
            this.winningOverlay.classList.remove('show');
        });

        document.getElementById('resetScore').addEventListener('click', () => {
            this.resetScore();
        });

        document.getElementById('playAgain').addEventListener('click', () => {
            this.winningOverlay.classList.remove('show');
            this.resetGame();
        });
    }

    applyTheme(theme) {
        document.body.className = theme;
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] || 
            (this.mode === 'ai' && this.currentPlayer === 'O')) {
            return;
        }

        this.makeMove(index);

        if (this.gameActive && this.mode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.aiMove(), 400);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.renderBoard();
        this.playSound();

        if (this.checkWin()) {
            this.endGame(`${this.currentPlayer} wins!`);
            return;
        }

        if (this.checkTie()) {
            this.endGame('Tie game!');
            return;
        }

        this.switchPlayer();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        const playerName = this.currentPlayer === 'X' ? 'X' : 
                          (this.mode === 'ai' ? 'AI' : 'O');
        this.updateStatus(`Player ${playerName}'s turn`);
        this.statusIndicator.style.background = this.currentPlayer === 'X' ? '#60a5fa' : '#f472b6';
    }

    checkWin() {
        for (const combo of this.winningCombos) {
            const [a, b, c] = combo;
            if (this.board[a] && this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.highlightWinningCells(combo);
                return true;
            }
        }
        return false;
    }

    highlightWinningCells(combo) {
        combo.forEach(index => {
            this.cells[index].classList.add('win');
        });
    }

    checkTie() {
        return this.board.every(cell => cell !== null);
    }

    endGame(message) {
        this.gameActive = false;
        this.winningOverlay.classList.add('show');
        
        if (message.includes('wins')) {
            const winner = message.charAt(0);
            const emojis = { X: '❌', O: '⭕' };
            this.winnerEmoji.textContent = '🏆';
            this.winnerMessage.textContent = `Player ${winner} Wins!`;
            this.scores[winner]++;
            this.updateScores();
            this.celebrate();
        } else {
            this.winnerEmoji.textContent = '🤝';
            this.winnerMessage.textContent = 'It\'s a Tie!';
            this.scores.tie++;
            this.updateScores();
        }
        
        this.updateStatus(message);
    }

    celebrate() {
        // Confetti celebration
        if (typeof confetti !== 'undefined') {
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 7,
                    startVelocity: 30,
                    spread: 360,
                    origin: { y: 0.6 }
                });
                
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        }
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningOverlay.classList.remove('show');
        this.cells.forEach(cell => {
            cell.classList.remove('win', 'x', 'o', 'taken');
        });
        this.renderBoard();
        this.updateStatus('Player X\'s turn');
        this.statusIndicator.style.background = '#4ade80';
    }

    resetScore() {
        this.scores = { X: 0, O: 0, tie: 0 };
        this.updateScores();
        this.resetGame();
    }

    renderBoard() {
        this.cells.forEach((cell, index) => {
            const value = this.board[index];
            cell.textContent = value || '';
            cell.className = 'cell';
            if (value) {
                cell.classList.add(value.toLowerCase(), 'taken');
            }
        });
    }

    updateStatus(message) {
        this.statusMessage.textContent = message;
    }

    updateScores() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreTie.textContent = this.scores.tie;
        
        // Update progress bars
        const total = this.scores.X + this.scores.O + this.scores.tie;
        if (total > 0) {
            document.querySelector('.player-x .score-bar').style.setProperty('--progress', 
                `${(this.scores.X / total) * 100}%`);
            document.querySelector('.player-o .score-bar').style.setProperty('--progress', 
                `${(this.scores.O / total) * 100}%`);
        }
    }

    playSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = this.currentPlayer === 'X' ? 523 : 392;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {}
    }

    aiMove() {
        if (!this.gameActive) return;

        // Win
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = null;
                    this.makeMove(i);
                    return;
                }
                this.board[i] = null;
            }
        }

        // Block
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = null;
                    this.makeMove(i);
                    return;
                }
                this.board[i] = null;
            }
        }

        // Take center
        if (!this.board[4]) {
            this.makeMove(4);
            return;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => !this.board[i]);
        if (availableCorners.length > 0) {
            const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            this.makeMove(randomCorner);
            return;
        }

        // Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => !this.board[i]);
        if (availableEdges.length > 0) {
            const randomEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
            this.makeMove(randomEdge);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
});