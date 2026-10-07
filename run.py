"""
MHD Real Estate Tech • FastAPI Backend Runner
Tự động kích hoạt môi trường ảo .venv và khởi chạy Uvicorn server
"""
import sys
import os
import subprocess
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
workspace_dir = backend_dir.parent

# Tìm python.exe của môi trường ảo .venv
venv_python_candidates = [
    workspace_dir / ".venv" / "Scripts" / "python.exe",
    backend_dir / ".venv" / "Scripts" / "python.exe",
    workspace_dir / ".venv" / "bin" / "python",
    backend_dir / ".venv" / "bin" / "python",
]

# Kiểm tra xem có đang chạy trong virtualenv không
is_in_venv = (sys.prefix != sys.base_prefix) or ("VIRTUAL_ENV" in os.environ)

if not is_in_venv:
    for venv_py in venv_python_candidates:
        if venv_py.exists():
            env = os.environ.copy()
            env["PYTHONUTF8"] = "1"
            print(f"[MHD Backend] Phat hien .venv tai: {venv_py}")
            print(f"[MHD Backend] Dang khoi chay bang moi truong ao .venv...")
            try:
                result = subprocess.run([str(venv_py), str(Path(__file__).resolve())] + sys.argv[1:], env=env)
                sys.exit(result.returncode)
            except KeyboardInterrupt:
                print("\n[MHD Backend] Da dung server thanh cong.")
                sys.exit(0)

# Đảm bảo UTF-8 cho Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(workspace_dir))

try:
    import uvicorn
except ImportError:
    print("[LOI] Khong tim thay uvicorn trong moi truong Python hien tai.")
    print("Vui long chay lenh sau de kich hoat moi truong ao:")
    print(r"  ..\.venv\Scripts\activate")
    print("Sau do chay lai: python run.py")
    sys.exit(1)

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  MHD REAL ESTATE TECH • FASTAPI AI VALUATION BACKEND SERVICE")
    print("  Server dang khoi chay tai: http://127.0.0.1:8000")
    print("  Tai lieu API Swagger Docs: http://127.0.0.1:8000/docs")
    print("="*70 + "\n")
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
