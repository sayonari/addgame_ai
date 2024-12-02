class Game {
    constructor() {
        this.numbers = [5, 3, 7, 2];
        this.isAnimating = false;
        this.updateDisplay();
        this.setupEventListeners();
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

    generateNewNumber() {
        return Math.floor(Math.random() * 9) + 1;
    }

    checkAnswer(input) {
        const sum = this.numbers[0] + this.numbers[1];
        const correctAnswer = sum % 10;
        return parseInt(input) === correctAnswer;
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
