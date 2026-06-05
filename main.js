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

    // 동물상 테스트 기능
    const animalStartBtn = document.getElementById('start-animal-test');
    const fileUpload = document.getElementById('file-upload');
    const webcamContainer = document.getElementById('webcam-container');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const animalLabelContainer = document.getElementById('label-container');
    const animalError = document.getElementById('animal-error');
    const modelURL = "https://teachablemachine.withgoogle.com/models/6n0H-ae_8/";
    
    let animalModel, webcam, maxPredictions;
    let isPredicting = false;

    // 모델 로딩 함수
    async function loadModel() {
        if (animalModel) return;
        try {
            const modelJsonURL = modelURL + "model.json";
            const metadataURL = modelURL + "metadata.json";
            animalModel = await tmImage.load(modelJsonURL, metadataURL);
            maxPredictions = animalModel.getTotalClasses();
            
            // 결과 컨테이너 초기화
            animalLabelContainer.innerHTML = '';
            for (let i = 0; i < maxPredictions; i++) {
                const labelDiv = document.createElement("div");
                labelDiv.className = 'prediction-label';
                animalLabelContainer.appendChild(labelDiv);
            }
        } catch (error) {
            showError("모델을 불러오는데 실패했습니다. URL을 확인해주세요.");
            throw error;
        }
    }

    function showError(message) {
        animalError.textContent = message;
        animalError.style.display = 'block';
        setTimeout(() => {
            animalError.style.display = 'none';
        }, 5000);
    }

    // 웹캠 시작 버튼 클릭
    animalStartBtn.addEventListener('click', async () => {
        animalStartBtn.disabled = true;
        animalStartBtn.textContent = '웹캠 활성화 중...';
        
        try {
            await loadModel();
            
            const flip = true;
            webcam = new tmImage.Webcam(200, 200, flip);
            await webcam.setup();
            await webcam.play();
            
            isPredicting = true;
            window.requestAnimationFrame(animalLoop);

            webcamContainer.appendChild(webcam.canvas);
            webcamContainer.style.display = 'flex';
            imagePreviewContainer.style.display = 'none';
            
            animalStartBtn.style.display = 'none';
        } catch (error) {
            console.error(error);
            showError("웹캠을 시작할 수 없습니다. 카메라 권한을 확인해주세요.");
            animalStartBtn.disabled = false;
            animalStartBtn.textContent = '웹캠으로 시작하기';
        }
    });

    // 파일 업로드 핸들러
    fileUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await loadModel();
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'flex';
                webcamContainer.style.display = 'none';
                
                // 웹캠이 켜져있다면 중지
                if (webcam) {
                    isPredicting = false;
                    webcam.stop();
                    webcamContainer.innerHTML = '';
                    animalStartBtn.style.display = 'block';
                    animalStartBtn.disabled = false;
                    animalStartBtn.textContent = '웹캠으로 시작하기';
                }

                // 이미지가 로드된 후 예측 실행
                imagePreview.onload = async () => {
                    await animalPredict(imagePreview);
                };
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            showError("이미지 분석 중 오류가 발생했습니다.");
        }
    });

    async function animalLoop() {
        if (!isPredicting) return;
        webcam.update();
        await animalPredict(webcam.canvas);
        window.requestAnimationFrame(animalLoop);
    }

    async function animalPredict(inputElement) {
        const prediction = await animalModel.predict(inputElement);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
            animalLabelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }
});
