#!/usr/bin/env bash
# One-shot: user-space MariaDB (no sudo) → import CSV → patch .env port 3307 → pip deps.
# Run from the repository root after network has finished downloading the MariaDB tarball (or let install_mariadb_no_sudo.sh fetch it).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "=== SmartEats: finish setup (no sudo) ==="

bash "$ROOT/scripts/install_mariadb_no_sudo.sh"
bash "$ROOT/scripts/start_mariadb_user.sh"
bash "$ROOT/scripts/bootstrap_database_no_sudo.sh"
bash "$ROOT/scripts/verify_database_no_sudo.sh"
bash "$ROOT/scripts/patch_webapp_env_user_mariadb.sh"

echo "=== pip install ==="
pip3 install -r "$ROOT/webapp/backend/requirements.txt"

echo
echo "=== Done ==="
echo "Start the web app:"
echo "  cd $ROOT/webapp/backend && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
echo "Then open: http://127.0.0.1:8000"
echo "Admin (if unchanged): admin / SmartEats2026"
echo "Database URL in .env should use port ${MARIADB_PORT:-3307} (see patch_webapp_env_user_mariadb.sh)."
