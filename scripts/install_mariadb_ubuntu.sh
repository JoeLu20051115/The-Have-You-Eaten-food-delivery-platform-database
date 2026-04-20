#!/usr/bin/env bash
# One-shot: install MariaDB server + client on Debian/Ubuntu (requires sudo).
set -euo pipefail
sudo apt-get update
sudo apt-get install -y mariadb-server mariadb-client
