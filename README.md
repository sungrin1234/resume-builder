# 🚀 AI Resume & Portfolio Builder

> **사용자의 기본 정보와 프로젝트 경험을 바탕으로, Google Gemini AI가 맞춤형 국문 이력서(Resume)와 포트폴리오(Portfolio)를 즉시 작성해 주는 풀스택 웹 애플리케이션입니다.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-black.svg?logo=flask&logoColor=white)](https://palletsprojects.com/p/flask/)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-Flash-orange.svg?logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 주요 핵심 기능

1. **맞춤형 정보 입력 폼**
   - 이름, 지원 직무, 경력 요약, 프로젝트 세부 경험, 문체(Tone & Manner) 설정
2. **이원화된 프롬프트 엔지니어링**
   - **Prompt A (일반 모드)**: 읽기 편하고 매끄러운 표준 국문 이력서 형식
   - **Prompt B (전문가 모드)**: STAR 기법(Situation, Task, Action, Result)과 정량적 성과 중심의 임팩트 있는 이력서
3. **실시간 4가지 디자인 테마 뷰어**
   - **🔥 사이버 선셋 (Cyber Sunset)**: 다크 옵시디언 캔버스 & 네온 마그마 글로우
   - **🌸 파스텔톤 (Soft Pastel)**: 화사하고 부드러운 감성의 크림 & 피치 로즈
   - **💼 진한톤 (Modern Deep Navy)**: 신뢰감을 주는 중후한 엔터프라이즈 네이비
   - **📄 미니멀톤 (Clean Minimal)**: 단정하고 클래식한 흑백 모던 스타일
   - *(생성 후에도 페이지 새로고침 없이 퀵 버튼으로 즉시 테마 전환 가능)*
4. **마크다운(Markdown) 완벽 지원**
   - `marked.js` 연동을 통한 실시간 웹 렌더링 (헤더, 볼드, 리스트 서식)
   - **📋 내용 복사 버튼**: 원클릭 클립보드 복사
   - **💾 Markdown 다운로드 버튼**: `[이름]_이력서_포트폴리오.md` 파일로 즉시 저장
5. **철저한 보안 및 예외 처리**
   - API Key는 `.env` 환경변수로만 로드되며 `.gitignore`를 통해 Git 유출을 원천 방지
   - 프론트엔드와 백엔드 양방향 입력값 유효성 검증 (Validation)
   - 서버 터미널 실시간 요청/응답/오류 로깅(Logging)

---

## 🗂️ 프로젝트 폴더 구조

```text
resume-builder/
├── app.py                  # Flask 백엔드 서버, 라우트, Gemini API 통신 로직
├── requirements.txt        # 프로젝트 의존성 라이브러리 목록
├── .env                    # 실제 보안 API 키 보관 (Git 제외)
├── .env.example            # 환경변수 설정 템플릿 견본
├── .gitignore              # Git 추적 제외 설정 (.env, venv 등)
├── README.md               # 프로젝트 매뉴얼 및 문서
├── templates/
│   └── index.html          # 메인 웹 UI 템플릿
└── static/
    ├── css/
    │   └── style.css       # 반응형 레이아웃 및 4대 테마 스타일시트
    └── js/
        └── app.js          # 폼 검증, 비동기 Fetch 통신, 렌더링 및 다운로드 로직
```

---

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Python 3.x, Flask 3.x, python-dotenv
- **AI Engine**: Google Gemini API (`gemini-3.5-flash-lite` / `gemini-2.5-flash`)
- **Frontend**: HTML5, CSS3 (Modern Flex/Grid, Glassmorphism, Theme Engine), Vanilla JavaScript (ES6+), marked.js
- **Version Control**: Git

---

## 🚀 설치 및 로컬 실행 가이드 (Windows PowerShell 기준)

### 1. 가상환경 생성 및 활성화
```powershell
# 프로젝트 폴더로 이동
cd C:\AI-study\resume-builder

# 가상환경 생성
py -m venv venv

# 가상환경 활성화 (프롬프트에 (venv) 표시 확인)
.\venv\Scripts\Activate.ps1
```

> 💡 **PowerShell 스크립트 실행 오류 발생 시**:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 실행 후 다시 활성화합니다.

### 2. 필수 패키지 설치
```powershell
py -m pip install -r requirements.txt
```

### 3. 환경변수(.env) 설정
```powershell
# 견본 파일 복사
Copy-Item .\.env.example .\.env

# 메모장으로 열어 본인의 Gemini API Key 입력
notepad .\.env
```
`.env` 파일 내용:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> 🔑 **API 키 발급**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받으실 수 있습니다.

### 4. 웹 서버 실행
```powershell
py app.py
```

### 5. 브라우저 접속
웹 브라우저(Chrome, Edge 등)를 열고 아래 주소로 접속합니다:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔒 보안 원칙
- 실제 비밀 API Key가 담긴 `.env` 파일과 대용량 `venv/` 가상환경 폴더는 `.gitignore`에 등록되어 있어 GitHub 등 원격 저장소에 커밋되지 않습니다.
- 외부에 코드를 공유할 때는 `.env.example` 형식만 공유됩니다.

---

## 📄 라이선스 (License)
This project is licensed under the MIT License.
