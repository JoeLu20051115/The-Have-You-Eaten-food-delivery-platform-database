#!/usr/bin/env bash
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

MYSQLADMIN="$MARIADB_BASE/bin/mariadb-admin"
[[ -x "$MYSQLADMIN" ]] || MYSQLADMIN="$MARIADB_BASE/bin/mysqladmin"

if [[ ! -x "$MYSQLADMIN" ]]; then
  echo "MariaDB not found at $MARIADB_BASE" >&2
  exit 1
fi

if [[ -S "$MARIADB_SOCKET" ]]; then
  "$MYSQLADMIN" -S "$MARIADB_SOCKET" -u root shutdown || true
fi

if [[ -f "$MARIADB_STATE_ROOT/mysqld_safe.pid" ]]; then
  PID="$(cat "$MARIADB_STATE_ROOT/mysqld_safe.pid" 2>/dev/null || true)"
  if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
  fi
  rm -f "$MARIADB_STATE_ROOT/mysqld_safe.pid"
fi

echo "Stopped (if it was running)."
