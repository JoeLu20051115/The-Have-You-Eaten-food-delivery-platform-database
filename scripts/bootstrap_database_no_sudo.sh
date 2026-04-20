#!/usr/bin/env bash
# Load project SQL into user-space MariaDB (no sudo). Requires start_mariadb_user.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_ROOT="${MARIADB_STATE_ROOT:-$HOME/.local/share/smarteats-mariadb}"
if [[ -f "$STATE_ROOT/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$STATE_ROOT/env.sh"
else
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/user_mariadb_env.sh"
fi

MARIADB_CLI="$MARIADB_BASE/bin/mariadb"
[[ -x "$MARIADB_CLI" ]] || MARIADB_CLI="$MARIADB_BASE/bin/mysql"

cd "$PROJECT_ROOT"

"$MARIADB_CLI" -S "$MARIADB_SOCKET" -u root --local-infile=1 <<SQL
SET GLOBAL local_infile = 1;
SOURCE sql/00_initialize_database.sql;
USE smarteats;
SHOW TABLES;
SOURCE sql/07_app_user_grants.sql;
SQL
