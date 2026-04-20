#!/usr/bin/env bash
# Full SmartEats stack without sudo: user MariaDB + bootstrap + FastAPI.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BE="$ROOT/webapp/backend"

echo "=== SmartEats 无 sudo 一键流程 ==="

bash "$ROOT/scripts/install_mariadb_no_sudo.sh"
bash "$ROOT/scripts/start_mariadb_user.sh"
bash "$ROOT/scripts/bootstrap_database_no_sudo.sh"
bash "$ROOT/scripts/verify_database_no_sudo.sh"
bash "$ROOT/scripts/patch_webapp_env_user_mariadb.sh"

echo "[pip] webapp/backend/requirements.txt"
pip3 install -r "$BE/requirements.txt"

export ENV_FILE="$BE/.env"
export PYTHONPATH="$BE"
python3 <<'PY'
from pathlib import Path
import os, sys
sys.path.insert(0, os.environ["PYTHONPATH"])
from app.auth import hash_password

p = Path(os.environ["ENV_FILE"])
text = p.read_text(encoding="utf-8")
lines = []
for line in text.splitlines():
    if line.startswith("SMARTEATS_ADMIN_PASSWORD_HASH="):
        val = line.split("=", 1)[1].strip()
        if not val:
            line = "SMARTEATS_ADMIN_PASSWORD_HASH=" + hash_password("SmartEats2026")
    lines.append(line)
p.write_text("\n".join(lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
PY

echo
echo "=== 启动 Web: http://127.0.0.1:8000 ==="
echo "管理员: admin  密码: SmartEats2026（若 .env 中管理员哈希为空时已自动填充）"
echo "按 Ctrl+C 停止"
echo
cd "$BE"
exec python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
