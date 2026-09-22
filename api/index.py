import os
import sys

# 프로젝트 루트 경로를 sys.path에 추가하여 app.py 모듈 안정적 임포트
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app import app
