class Game {
    constructor() {
        this.initGame();
    }

    initGame() {
        this.numbers = Array(4).fill(0).map(() => this.generateNewNumber());
        this.isAnimating = false;
        this.score = 0;
        this.combo = 0;
        this.isErrorCombo = false;
        this.comboTimer = null;
        this.gameTimer = null;
        this.timeLeft = 30;
        this.isGameOver = false;
        this.isGameStarted = false;
        this.COMBO_TIME = 700;
        this.ANIMATION_TIME = 250;
        this.lastCorrectAnswer = null;
        this.pendingAnimation = false;
        
        this.okSound = new Audio('se/ok.mp3');
        this.ngSound = new Audio('se/ng.mp3');
        
        this.updateDisplay();
        this.setupEventListeners();
        this.updateScore();
        
        document.getElementById('time').textContent = this.timeLeft;
        document.getElementById('time').classList.remove('warning');
    }

    startGameTimer() {
        if (this.gameTimer) return;
        
        this.isGameStarted = true;
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            const timeDisplay = document.getElementById('time');
            timeDisplay.textContent = this.timeLeft;

            if (this.timeLeft <= 10) {
                timeDisplay.classList.add('warning');
            }

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.gameTimer);
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        const gameOver = document.getElementById('game-over');
        const finalScore = document.getElementById('final-score');
        finalScore.textContent = this.score;
        gameOver.classList.remove('hidden');
    }

    restartGame() {
        const gameOver = document.getElementById('game-over');
        gameOver.classList.add('hidden');
        this.initGame();
    }

    updateDisplay() {
        const container = document.querySelector('.numbers-container');
        container.innerHTML = '';
        
        this.numbers.forEach((num, index) => {
            const div = document.createElement('div');
            div.className = 'number';
            div.textContent = num;
            container.appendChild(div);
        });
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
    }

    startComboTimer(isError = false) {
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        const timerBar = document.getElementById('combo-timer-bar');
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        
        if (isError) {
            timerBar.classList.add('error');
        } else {
            timerBar.classList.remove('error');
        }

        timerBar.offsetHeight;

        timerBar.style.transition = `width ${this.COMBO_TIME}ms linear`;
        timerBar.style.width = '0%';

        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.isErrorCombo = false;
            this.updateScore();
            timerBar.style.transition = 'none';
            timerBar.style.width = '0%';
            timerBar.classList.remove('error');
        }, this.COMBO_TIME);
    }

    calculateScore(combo) {
        return Math.pow(2, combo);
    }

    generateNewNumber() {
        return Math.floor(Math.random() * 9) + 1;
    }

    getCurrentAnswer() {
        const sum = this.numbers[0] + this.numbers[1];
        return sum % 10;
    }

    getNextAnswer() {
        const sum = this.numbers[1] + this.numbers[2];
        return sum % 10;
    }

    playSound(isCorrect) {
        if (isCorrect) {
            this.okSound.currentTime = 0;
            this.okSound.play();
        } else {
            this.ngSound.currentTime = 0;
            this.ngSound.play();
        }
    }

    checkAnswer(input) {
        if (this.isGameOver) return false;

        if (!this.isGameStarted) {
            this.startGameTimer();
        }

        const currentAnswer = this.getCurrentAnswer();
        const nextAnswer = this.getNextAnswer();
        const inputNum = parseInt(input);

        if (this.isAnimating && inputNum === this.lastCorrectAnswer) {
            return false;
        }

        const isCorrect = inputNum === currentAnswer || (this.isAnimating && inputNum === nextAnswer);

        if (isCorrect) {
            if (this.isErrorCombo) {
                this.combo = 0;
                this.isErrorCombo = false;
            }
            const points = this.calculateScore(this.combo);
            this.score += points;
            this.combo++;
            this.lastCorrectAnswer = inputNum;
            this.startComboTimer(false);
            this.playSound(true);

            if (this.isAnimating && inputNum === nextAnswer) {
                this.pendingAnimation = true;
            }
        } else {
            const points = this.calculateScore(this.combo);
            this.score -= points;
            
            if (!this.isErrorCombo) {
                this.combo = 1;
                this.isErrorCombo = true;
            } else {
                this.combo++;
            }
            
            this.startComboTimer(true); // コンボタイマーの更新のみ
            this.playSound(false);
        }

        this.updateScore();
        return isCorrect;
    }

    async slideNumbers() {
        if (this.isAnimating || this.isGameOver) return;
        this.isAnimating = true;

        const numbers = document.querySelectorAll('.number');
        const newNumber = this.generateNewNumber();

        numbers[0].classList.add('fading-out');

        await new Promise(resolve => setTimeout(resolve, this.ANIMATION_TIME / 2));

        for (let i = 1; i < numbers.length; i++) {
            numbers[i].classList.add('sliding');
        }

        await new Promise(resolve => setTimeout(resolve, this.ANIMATION_TIME));

        this.numbers.shift();
        this.numbers.push(newNumber);

        this.updateDisplay();
        const newNumberElement = document.querySelectorAll('.number')[3];
        newNumberElement.classList.add('new-number');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newNumberElement.classList.remove('new-number');
            });
        });

        await new Promise(resolve => setTimeout(resolve, this.ANIMATION_TIME));
        this.isAnimating = false;
        this.lastCorrectAnswer = null;

        if (this.pendingAnimation) {
            this.pendingAnimation = false;
            this.slideNumbers();
        }
    }

    setupEventListeners() {
        this.keydownHandler = (event) => {
            const key = event.key;
            if (this.isGameOver) {
                if (key === ' ') {
                    this.restartGame();
                }
                return;
            }

            if (/^[0-9]$/.test(key)) {
                if (this.checkAnswer(key)) {
                    this.slideNumbers();
                }
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
    }
}

window.onload = () => {
    new Game();
};
