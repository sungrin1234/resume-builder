import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# 1. 환경변수(.env) 로드
load_dotenv()

# 2. 로깅 설정 (요청, 응답, 오류 기록)
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# 3. Flask 앱 생성 (로컬 및 Vercel 서버리스 환경 경로 호환성 확보)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# 3-1. PWA 지원 라우트 (manifest.json 및 Service Worker)
@app.route("/sw.js")
@app.route("/api/sw.js")
def service_worker():
    response = app.send_static_file("sw.js")
    response.headers["Content-Type"] = "application/javascript"
    response.headers["Service-Worker-Allowed"] = "/"
    return response

@app.route("/manifest.json")
@app.route("/api/manifest.json")
def manifest():
    return app.send_static_file("manifest.json")

# 4. 프롬프트 생성 헬퍼 함수 (Prompt A: 일반 모드, Prompt B: 전문가 모드)
def build_prompts(name, role, experience, projects, tone, prompt_type):
    if prompt_type == "expert":
        # Prompt B: 전문가 모드 (성과 중심, STAR 기법, 임팩트 강조)
        system_instruction = (
            "당신은 글로벌 IT 기업의 수석 테크니컬 리크루터이자 커리어 코치입니다. "
            "사용자의 기본 정보를 바탕으로 수치와 성과 중심(STAR 기법), 전문적이고 임팩트 있는 "
            "국문 이력서(Resume)와 프로젝트 포트폴리오(Portfolio)를 마크다운(Markdown) 형식으로 작성하세요."
        )
        prompt_content = f"""
[요청: 전문가 모드 이력서 & 포트폴리오 작성]
- 지원자 이름: {name}
- 희망 직무: {role}
- 경력 요약: {experience}
- 주요 프로젝트: {projects}
- 희망 톤앤매너: {tone} (전문적, 설득력 있는 비즈니스 톤)

[작성 가이드라인]
1. 단순 나열을 지양하고, 기여도와 비즈니스 임팩트를 강조하세요.
2. 성과를 서술할 때는 액션 중심의 강한 동사를 사용하세요.
3. 이력서(Resume)와 포트폴리오(Portfolio) 섹션을 명확한 마크다운 헤더(## 1. Resume, ## 2. Portfolio)로 구분해 주세요.
4. 가독성을 높이기 위해 불릿 포인트와 강조 표기를 적절히 활용하세요.
"""
    else:
        # Prompt A: 일반 모드 (자연스럽고 읽기 쉬운 표준 이력서)
        system_instruction = (
            "당신은 친절하고 전문적인 커리어 멘토입니다. "
            "사용자의 정보를 바탕으로 깔끔하고 가독성 좋은 표준 국문 이력서(Resume)와 "
            "프로젝트 포트폴리오(Portfolio) 초안을 마크다운(Markdown) 형식으로 작성하세요."
        )
        prompt_content = f"""
[요청: 표준 모드 이력서 & 포트폴리오 작성]
- 지원자 이름: {name}
- 희망 직무: {role}
- 경력 요약: {experience}
- 주요 프로젝트: {projects}
- 희망 톤앤매너: {tone}

[작성 가이드라인]
1. 지원자의 열정과 경험이 잘 드러나도록 부드럽고 설득력 있게 작성하세요.
2. 이력서(Resume)와 포트폴리오(Portfolio) 섹션을 명확한 마크다운 헤더(## 1. Resume, ## 2. Portfolio)로 구분해 주세요.
3. 읽기 쉬운 구조로 깔끔하게 정리해 주세요.
"""
    return system_instruction, prompt_content

# 5. 메인 화면 라우트 (루트 및 Vercel 라우트 별칭 지원)
@app.route("/")
@app.route("/api")
@app.route("/api/index")
@app.route("/api/index.py")
def index():
    return render_template("index.html")

# 6. AI 생성 API 라우트
@app.route("/generate", methods=["POST"])
@app.route("/api/generate", methods=["POST"])
def generate():
    # 6-1. 요청 데이터 파싱
    data = request.get_json()
    if not data:
        logger.warning("[요청 실패] 클라이언트로부터 전달된 JSON 데이터가 없습니다.")
        return jsonify({"success": False, "message": "요청 데이터가 올바르지 않습니다."}), 400

    name = data.get("name", "").strip()
    role = data.get("role", "").strip()
    experience = data.get("experience", "").strip()
    projects = data.get("projects", "").strip()
    tone = data.get("tone", "전문적이고 신뢰감 있는").strip()
    theme = data.get("theme", "cyber").strip()
    prompt_type = data.get("prompt_type", "standard").strip()

    logger.info(f"[API 요청 접수] 이름: {name} | 직무: {role} | 톤: {tone} | 테마: {theme} | 프롬프트 모드: {prompt_type}")

    # 6-2. 백엔드 필수 입력값 검증 (Validation)
    if not name:
        return jsonify({"success": False, "message": "이름을 입력해 주세요."}), 400
    if not role:
        return jsonify({"success": False, "message": "지원 직무를 입력해 주세요."}), 400
    if not experience:
        return jsonify({"success": False, "message": "경력 사항을 입력해 주세요."}), 400
    if not projects:
        return jsonify({"success": False, "message": "프로젝트 경험을 입력해 주세요."}), 400

    # 6-3. .env 환경변수에서만 API Key 로드 확인
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or api_key == "your_gemini_api_key_here":
        logger.error("[설정 오류] .env 파일에 GEMINI_API_KEY가 올바르게 설정되지 않았습니다.")
        return jsonify({
            "success": False,
            "message": "서버에 Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해 주세요."
        }), 500

    # 6-4. Gemini API 호출
    try:
        genai.configure(api_key=api_key)
        system_instruction, user_prompt = build_prompts(name, role, experience, projects, tone, prompt_type)

        target_model = "gemini-3.5-flash-lite"
        logger.info(f"[Gemini 호출] {target_model} 모델 호출 중...")
        try:
            model = genai.GenerativeModel(
                model_name=target_model,
                system_instruction=system_instruction
            )
            response = model.generate_content(
                user_prompt,
                generation_config={"temperature": 0.7}
            )
        except Exception as model_err:
            # 지정된 모델명이 404 Not Found인 경우 가벼운 최신 기본 모델로 안전하게 자동 폴백
            if "404" in str(model_err) or "not found" in str(model_err).lower():
                fallback_model = "gemini-2.5-flash"
                logger.warning(f"[{target_model} 404 감지] {fallback_model} 모델로 자동 전환하여 생성합니다.")
                model = genai.GenerativeModel(
                    model_name=fallback_model,
                    system_instruction=system_instruction
                )
                response = model.generate_content(
                    user_prompt,
                    generation_config={"temperature": 0.7}
                )
            else:
                raise model_err

        result_text = response.text
        logger.info(f"[API 응답 성공] 총 {len(result_text)}자의 이력서/포트폴리오 생성 완료")

        return jsonify({
            "success": True,
            "result": result_text
        })

    except Exception as e:
        logger.error(f"[Gemini API 처리 오류] {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": f"AI 이력서 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

if __name__ == "__main__":
    # 로컬 개발 서버 구동
    print("========================================")
    print("🚀 AI Resume & Portfolio Builder 시작")
    print("👉 접속 주소: http://127.0.0.1:5000")
    print("========================================")
    app.run(host="127.0.0.1", port=5000, debug=True)
