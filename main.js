document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const lottoContainer = document.getElementById('lotto-container');
    const body = document.body;

    // 테마 토글 기능
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
    }

    // 로또 번호 생성 기능
    generateBtn.addEventListener('click', () => {
        const numbers = generateLottoNumbers();
        displayNumbers(numbers);
    });

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            numbers.add(num);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumbers(numbers) {
        lottoContainer.innerHTML = '';
        numbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.textContent = num;

            // 번호대별 클래스 추가
            if (num <= 10) ball.classList.add('range-1');
            else if (num <= 20) ball.classList.add('range-10');
            else if (num <= 30) ball.classList.add('range-20');
            else if (num <= 40) ball.classList.add('range-30');
            else ball.classList.add('range-40');

            lottoContainer.appendChild(ball);
        });
    }
});
