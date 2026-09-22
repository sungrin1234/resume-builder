/**
 * AI Resume & Portfolio Builder - 브라우저 프론트엔드 스크립트 (app.js)
 * 기능: 폼 검증, /generate API 통신, 로딩 상태 관리, 결과 출력, 클립보드 복사, 마크다운 다운로드
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 주요 DOM 엘리먼트 가져오기
    const form = document.getElementById('builderForm');
    const nameInput = document.getElementById('name');
    const roleInput = document.getElementById('role');
    const experienceInput = document.getElementById('experience');
    const projectsInput = document.getElementById('projects');
    const toneSelect = document.getElementById('tone');
    const themeSelect = document.getElementById('theme');
    
    // 에러 표시 span 엘리먼트들
    const nameError = document.getElementById('nameError');
    const roleError = document.getElementById('roleError');
    const experienceError = document.getElementById('experienceError');
    const projectsError = document.getElementById('projectsError');

    // 버튼 및 상태 표시 엘리먼트들
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnSpinner = generateBtn.querySelector('.spinner');

    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const resultContainer = document.getElementById('resultContainer');
    const resultOutput = document.getElementById('resultOutput');
    const actionButtons = document.getElementById('actionButtons');
    const themeQuickBar = document.getElementById('themeQuickBar');
    const themePills = document.querySelectorAll('.theme-pill');
    const alertBox = document.getElementById('alertBox');

    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 현재 생성된 최신 마크다운 텍스트 저장용 변수
    let currentGeneratedMarkdown = '';

    // 테마 적용 함수
    function applyResultTheme(themeName) {
        // 기존 테마 클래스 제거
        resultContainer.classList.remove('theme-nature', 'theme-cyber', 'theme-pastel', 'theme-deep', 'theme-minimal');
        resultContainer.classList.add(`theme-${themeName}`);

        // 셀렉트 박스 동기화
        if (themeSelect) themeSelect.value = themeName;

        // 퀵 스위치 버튼 active 상태 갱신
        themePills.forEach(pill => {
            if (pill.dataset.theme === themeName) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    // 테마 셀렉트 박스 변경 시 실시간 반영
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyResultTheme(e.target.value);
        });
    }

    // 테마 퀵 버튼 클릭 시 실시간 반영
    themePills.forEach(pill => {
        pill.addEventListener('click', () => {
            applyResultTheme(pill.dataset.theme);
        });
    });

    // 2. 알림 메시지 표시 함수
    function showAlert(message, type = 'error') {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type}`;
        alertBox.style.display = 'block';

        // 6초 후 알림 자동 숨김
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 6000);
    }

    function hideAlert() {
        alertBox.style.display = 'none';
    }

    // 3. 필드 에러 메시지 초기화 함수
    function clearFieldErrors() {
        nameError.textContent = '';
        roleError.textContent = '';
        experienceError.textContent = '';
        projectsError.textContent = '';
    }

    // 4. 프론트엔드 입력값 유효성 검사 (Validation)
    function validateForm() {
        clearFieldErrors();
        let isValid = true;

        if (!nameInput.value.trim()) {
            nameError.textContent = '이름을 입력해 주세요.';
            isValid = false;
        }

        if (!roleInput.value.trim()) {
            roleError.textContent = '희망하는 지원 직무를 입력해 주세요.';
            isValid = false;
        }

        if (!experienceInput.value.trim()) {
            experienceError.textContent = '경력 또는 학습 이력을 입력해 주세요.';
            isValid = false;
        }

        if (!projectsInput.value.trim()) {
            projectsError.textContent = '프로젝트 경험 내용을 입력해 주세요.';
            isValid = false;
        }

        return isValid;
    }

    // 5. 로딩 UI 전환 함수
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.textContent = 'AI 이력서 생성 중...';
            btnSpinner.style.display = 'inline-block';

            emptyState.style.display = 'none';
            resultContainer.style.display = 'none';
            actionButtons.style.display = 'none';
            if (themeQuickBar) themeQuickBar.style.display = 'none';
            loadingState.style.display = 'block';
            hideAlert();
        } else {
            generateBtn.disabled = false;
            btnText.textContent = 'AI로 이력서 & 포트폴리오 생성하기';
            btnSpinner.style.display = 'none';
            loadingState.style.display = 'none';
        }
    }

    // 6. 폼 제출 이벤트 리스너
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1단계: 유효성 검사
        if (!validateForm()) {
            showAlert('필수 입력 항목을 모두 확인해 주세요.', 'error');
            return;
        }

        // 선택된 프롬프트 라디오 버튼 값 가져오기
        const selectedPromptType = document.querySelector('input[name="prompt_type"]:checked').value;
        const selectedTheme = themeSelect ? themeSelect.value : 'nature';

        // 전송할 페이로드 데이터 구성
        const payload = {
            name: nameInput.value.trim(),
            role: roleInput.value.trim(),
            experience: experienceInput.value.trim(),
            projects: projectsInput.value.trim(),
            tone: toneSelect.value,
            theme: selectedTheme,
            prompt_type: selectedPromptType
        };

        // 로딩 시작
        setLoading(true);

        try {
            // 백엔드 /generate 라우트로 POST 요청
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`서버 응답 오류 (${response.status}): ${text.substring(0, 100)}`);
            }

            if (!response.ok || !data.success) {
                // 백엔드에서 전달한 오류 메시지 표시
                const errorMsg = data.message || '이력서 생성 중 문제가 발생했습니다.';
                throw new Error(errorMsg);
            }

            // 성공 시 마크다운 파싱 및 결과 화면 표시
            currentGeneratedMarkdown = data.result;
            
            if (typeof marked !== 'undefined') {
                resultOutput.innerHTML = marked.parse(currentGeneratedMarkdown);
            } else {
                resultOutput.textContent = currentGeneratedMarkdown;
            }

            // 선택된 테마 스타일 즉시 적용
            applyResultTheme(selectedTheme);

            loadingState.style.display = 'none';
            resultContainer.style.display = 'block';
            actionButtons.style.display = 'flex';
            if (themeQuickBar) themeQuickBar.style.display = 'flex';

            showAlert('🎉 이력서와 포트폴리오가 성공적으로 생성되었습니다!', 'success');

        } catch (error) {
            console.error('API 통신 오류:', error);
            showAlert(error.message, 'error');
            // 에러 시 다시 빈 화면 상태 보여주기
            if (!currentGeneratedMarkdown) {
                emptyState.style.display = 'block';
            }
        } finally {
            // 로딩 종료
            setLoading(false);
        }
    });

    // 7. 결과 내용 클립보드 복사 기능
    copyBtn.addEventListener('click', async () => {
        if (!currentGeneratedMarkdown) return;

        try {
            await navigator.clipboard.writeText(currentGeneratedMarkdown);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ 복사 완료!';
            copyBtn.style.backgroundColor = '#dcfce7';
            copyBtn.style.borderColor = '#86efac';

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.borderColor = '';
            }, 2000);
        } catch (err) {
            console.error('복사 실패:', err);
            showAlert('클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.', 'error');
        }
    });

    // 8. Markdown(.md) 파일 다운로드 기능
    downloadBtn.addEventListener('click', () => {
        if (!currentGeneratedMarkdown) return;

        const userName = nameInput.value.trim() || 'Resume';
        const fileName = `${userName}_이력서_포트폴리오.md`;

        // UTF-8 BOM 추가하여 한글 깨짐 방지
        const blob = new Blob(['\uFEFF' + currentGeneratedMarkdown], {
            type: 'text/markdown;charset=utf-8;'
        });

        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(downloadUrl);

        showAlert(`💾 "${fileName}" 파일이 다운로드되었습니다!`, 'success');
    });
});

// 10. PWA Service Worker 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[PWA] Service Worker 등록 완료:', reg.scope))
            .catch(err => console.warn('[PWA] Service Worker 등록 실패:', err));
    });
}
