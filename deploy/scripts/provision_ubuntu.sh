#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root."
  exit 1
fi

apt-get update
apt-get install -y python3 python3-venv python3-pip nginx mariadb-server certbot python3-certbot-nginx git

if ! id -u smarteats >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin smarteats
fi

mkdir -p /opt/smarteats
chown -R smarteats:www-data /opt/smarteats

systemctl enable nginx
systemctl enable mariadb

echo "Base server packages installed."
echo "Next: clone the repository into /opt/smarteats and follow webapp/docs/PRODUCTION_DEPLOYMENT.md"