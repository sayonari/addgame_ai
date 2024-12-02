class Game {
    constructor() {
        this.numbers = [5, 3, 7, 2];
        this.isAnimating = false;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = null;
        this.COMBO_TIME = 700; // ms
        this.lastCorrectAnswer = null; // 最後に正解した答えを記録
        
        // 音声の初期化
        this.okSound = new Audio('se/ok.mp3');
        this.ngSound = new Audio('se/ng.mp3');
        
        this.updateDisplay();
        this.setupEventListeners();
        this.updateScore();
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

    startComboTimer() {
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        const timerBar = document.getElementById('combo-timer-bar');
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';

        // Force reflow
        timerBar.offsetHeight;

        timerBar.style.transition = `width ${this.COMBO_TIME}ms linear`;
        timerBar.style.width = '0%';

        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.updateScore();
            timerBar.style.transition = 'none';
            timerBar.style.width = '0%';
        }, this.COMBO_TIME);
    }

    calculateScore() {
        // 基本スコアは1点
        // コンボ数に応じて指数関数的に増加 (2のコンボ数乗)
        return Math.pow(2, this.combo);
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
        const currentAnswer = this.getCurrentAnswer();
        const nextAnswer = this.getNextAnswer();
        const inputNum = parseInt(input);

        // アニメーション中に同じ答えを連打できないようにする
        if (this.isAnimating && inputNum === this.lastCorrectAnswer) {
            return false;
        }

        // アニメーション中でも次の問題の正解は受け付ける
        if (this.isAnimating && inputNum === nextAnswer) {
            this.playSound(true);
            return true;
        }

        const isCorrect = inputNum === currentAnswer;

        if (isCorrect) {
            this.lastCorrectAnswer = currentAnswer; // 正解した答えを記録
            this.combo++;
            const points = this.calculateScore();
            this.score += points;
            this.startComboTimer();
            this.playSound(true);
        } else {
            // 不正解の場合、正解時と同じ点数を減点
            const points = this.calculateScore();
            this.score = Math.max(0, this.score - points);
            this.combo = 0;
            if (this.comboTimer) {
                clearTimeout(this.comboTimer);
                const timerBar = document.getElementById('combo-timer-bar');
                timerBar.style.transition = 'none';
                timerBar.style.width = '0%';
            }
            this.playSound(false);
        }

        this.updateScore();
        return isCorrect;
    }

    async slideNumbers() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const numbers = document.querySelectorAll('.number');
        const newNumber = this.generateNewNumber();

        // 1. 最初の数字をフェードアウト
        numbers[0].classList.add('fading-out');

        // 2. 少し待ってから残りの数字をスライド
        await new Promise(resolve => setTimeout(resolve, 150));

        for (let i = 1; i < numbers.length; i++) {
            numbers[i].classList.add('sliding');
        }

        // 3. スライドが完了するのを待つ
        await new Promise(resolve => setTimeout(resolve, 400));

        // 4. 配列を更新
        this.numbers.shift();
        this.numbers.push(newNumber);

        // 5. DOMを更新して新しい数字を追加
        this.updateDisplay();
        const newNumberElement = document.querySelectorAll('.number')[3];
        newNumberElement.classList.add('new-number');

        // 6. 新しい数字をフェードイン
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newNumberElement.classList.remove('new-number');
            });
        });

        // 7. アニメーション完了を待つ
        await new Promise(resolve => setTimeout(resolve, 400));
        this.isAnimating = false;
        this.lastCorrectAnswer = null; // アニメーション完了時に記録をリセット
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if (/^[0-9]$/.test(key)) {
                if (this.checkAnswer(key)) {
                    this.slideNumbers();
                }
            }
        });
    }
}

// ゲームの初期化
window.onload = () => {
    new Game();
};
