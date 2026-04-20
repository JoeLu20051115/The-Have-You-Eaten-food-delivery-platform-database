#!/usr/bin/env bash
# Point webapp/backend/.env at user-space MariaDB (TCP port MARIADB_PORT, default 3307).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_ROOT="${MARIADB_STATE_ROOT:-$HOME/.local/share/smarteats-mariadb}"
if [[ -f "$STATE_ROOT/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$STATE_ROOT/env.sh"
else
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/user_mariadb_env.sh"
fi

BE="$(cd "$SCRIPT_DIR/../webapp/backend" && pwd)"
ENV_FILE="$BE/.env"
PASS="${SMARTEATS_DB_PASSWORD:-SmartEats3170App123}"
export _SMARTEATS_URL="mysql+pymysql://smarteats_app:${PASS}@127.0.0.1:${MARIADB_PORT}/smarteats"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$BE/.env.example" "$ENV_FILE"
fi

export ENV_FILE
python3 <<'PY'
from pathlib import Path
import os

path = Path(os.environ["ENV_FILE"])
url = os.environ["_SMARTEATS_URL"]
lines = path.read_text(encoding="utf-8").splitlines()
out = []
found = False
for line in lines:
    if line.startswith("SMARTEATS_DATABASE_URL="):
        out.append(f"SMARTEATS_DATABASE_URL={url}")
        found = True
    else:
        out.append(line)
if not found:
    out.append(f"SMARTEATS_DATABASE_URL={url}")
path.write_text("\n".join(out) + "\n", encoding="utf-8")
PY

echo "Updated SMARTEATS_DATABASE_URL in $ENV_FILE"
