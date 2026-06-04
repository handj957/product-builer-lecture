document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const lottoContainer = document.getElementById('lotto-container');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    // 테마 토글 기능
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            updateTheme('dark-mode');
        } else {
            updateTheme('light-mode');
        }
    });

    function updateTheme(theme) {
        if (theme === 'dark-mode') {
            body.classList.replace('light-mode', 'dark-mode');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light-mode');
        }
    }

    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        updateTheme(savedTheme);
    }

    // 로또 번호 생성 기능
    generateBtn.addEventListener('click', () => {
        // 애니메이션 효과를 위해 버튼 비활성화
        generateBtn.disabled = true;
        lottoContainer.innerHTML = '<div class="ball placeholder">?</div>'.repeat(6);
        
        setTimeout(() => {
            const numbers = generateLottoNumbers();
            displayNumbers(numbers);
            generateBtn.disabled = false;
        }, 300);
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
        numbers.forEach((num, index) => {
            setTimeout(() => {
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
                
                // 애니메이션 효과
                ball.style.transform = 'scale(0)';
                requestAnimationFrame(() => {
                    ball.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    ball.style.transform = 'scale(1)';
                });
            }, index * 100);
        });
    }
});
