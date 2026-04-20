#!/usr/bin/env bash
# Run the full SmartEats stack in README order:
#   install_wsl_env.sh -> bootstrap_database.sh -> verify_database.sh -> pip -> uvicorn
# Requires: sudo (for apt + mariadb SOURCE), Python 3 with pip.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
BE="$ROOT/webapp/backend"

echo "=== SmartEats 一键启动（与 README 步骤一致）==="
echo "项目根目录: $ROOT"
echo

echo "[1/5] 安装 MariaDB 并启动服务 (scripts/install_wsl_env.sh) …"
bash "$ROOT/scripts/install_wsl_env.sh"

echo
echo "[2/5] 建库、导入 CSV、创建应用账号 (scripts/bootstrap_database.sh) …"
bash "$ROOT/scripts/bootstrap_database.sh"

echo
echo "[3/5] 校验数据 (scripts/verify_database.sh) …"
bash "$ROOT/scripts/verify_database.sh"

echo
echo "[4/5] 安装 Python 依赖 (webapp/backend/requirements.txt) …"
pip3 install -r "$BE/requirements.txt"

if [[ ! -f "$BE/.env" ]]; then
  cp "$BE/.env.example" "$BE/.env"
  echo "已创建 $BE/.env"
fi

# 若管理员密码哈希为空，则写入默认演示密码 SmartEats2026 的哈希
export ENV_FILE="$BE/.env"
PYTHONPATH="$BE" python3 <<'PY'
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
echo "[5/5] 启动 Web: http://127.0.0.1:8000"
echo "    管理员账号: admin  密码: SmartEats2026（若未自行改过 .env）"
echo "    按 Ctrl+C 停止服务"
echo
cd "$BE"
exec python3 -m uvicorn app.main:app --host "${SMARTEATS_HOST:-127.0.0.1}" --port "${SMARTEATS_PORT:-8000}"
