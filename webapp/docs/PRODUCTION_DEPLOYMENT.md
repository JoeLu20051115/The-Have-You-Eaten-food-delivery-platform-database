# SmartEats Production Deployment Guide

This document describes a formal long-term deployment path for the SmartEats web application using:

1. Ubuntu cloud server
2. Domain name
3. Nginx reverse proxy
4. systemd service management
5. Gunicorn + Uvicorn workers
6. MariaDB application account

## Recommended Architecture

```text
Internet
  -> Domain DNS
  -> Nginx :80/:443
  -> Gunicorn/Uvicorn :127.0.0.1:8000
  -> FastAPI app
  -> MariaDB :127.0.0.1:3306
```

This keeps the Python app off the public port surface and lets Nginx handle TLS, domain routing, compression, and reverse proxy duties.

## Server Assumptions

This guide assumes:

1. Ubuntu 24.04 LTS cloud server
2. A domain such as `your-domain.com`
3. The repository deployed under `/opt/smarteats`
4. The web backend deployed under `/opt/smarteats/webapp/backend`

## Step 1. Provision the server

Copy the repository to the server, then as root run:

```bash
cd /opt/smarteats
bash deploy/scripts/provision_ubuntu.sh
```

This installs Python, Nginx, MariaDB, Certbot, and creates the `smarteats` system user.

## Step 2. Create the Python environment

```bash
cd /opt/smarteats/webapp/backend
sudo -u smarteats python3 -m venv .venv
sudo -u smarteats .venv/bin/pip install -r requirements-prod.txt
```

## Step 3. Create the application database user

Do not run the web service as MariaDB root.

```bash
sudo mariadb
```

Then run:

```sql
CREATE USER IF NOT EXISTS 'smarteats_app'@'localhost' IDENTIFIED BY 'replace_with_strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON smarteats.* TO 'smarteats_app'@'localhost';
FLUSH PRIVILEGES;
```

## Step 4. Configure production environment variables

Create the production environment file:

```bash
cd /opt/smarteats/webapp/backend
cp .env.production.example .env.production
```

Edit `.env.production` and set:

1. `SMARTEATS_DATABASE_URL`
2. `SMARTEATS_ALLOWED_ORIGINS`
3. `SMARTEATS_GUNICORN_WORKERS`
4. Any production domain values

Recommended example:

```dotenv
SMARTEATS_DATABASE_URL=mysql+pymysql://smarteats_app:replace_with_strong_password@127.0.0.1:3306/smarteats
SMARTEATS_APP_NAME=SmartEats Control Center
SMARTEATS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
SMARTEATS_HOST=127.0.0.1
SMARTEATS_PORT=8000
SMARTEATS_SESSION_SECRET_KEY=replace-with-a-long-random-secret
SMARTEATS_SESSION_COOKIE_NAME=smarteats_session
SMARTEATS_SESSION_HTTPS_ONLY=true
SMARTEATS_ADMIN_USERNAME=admin
SMARTEATS_ADMIN_PASSWORD_HASH=pbkdf2_sha256$390000$replace$replace
SMARTEATS_VIEWER_USERNAME=viewer
SMARTEATS_VIEWER_PASSWORD_HASH=pbkdf2_sha256$390000$replace$replace
SMARTEATS_GUNICORN_BIND=127.0.0.1:8000
SMARTEATS_GUNICORN_WORKERS=4
SMARTEATS_GUNICORN_TIMEOUT=60
SMARTEATS_GUNICORN_GRACEFUL_TIMEOUT=30
SMARTEATS_GUNICORN_KEEPALIVE=5
SMARTEATS_FORWARDED_ALLOW_IPS=127.0.0.1
```

Generate the password hashes before filling those values:

```bash
cd /opt/smarteats/webapp/backend
sudo -u smarteats .venv/bin/python scripts/generate_password_hash.py
```

Run it once for the admin password and once for the viewer password, then paste each generated hash into `.env.production`.

## Step 5. Install the systemd service

Copy the service file:

```bash
sudo cp deploy/systemd/smarteats-web.service /etc/systemd/system/smarteats-web.service
```

Reload and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smarteats-web
sudo systemctl start smarteats-web
sudo systemctl status smarteats-web
```

Useful logs:

```bash
sudo journalctl -u smarteats-web -f
```

## Step 6. Configure Nginx

Copy the site config:

```bash
sudo cp deploy/nginx/smarteats.conf /etc/nginx/sites-available/smarteats.conf
```

Edit the `server_name` values to match your real domain, then enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/smarteats.conf /etc/nginx/sites-enabled/smarteats.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7. Enable HTTPS

After DNS points to the cloud server public IP, run:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

This upgrades the site from HTTP to HTTPS and keeps certificates renewable.

## Step 8. Validate deployment

Run the following checks:

```bash
curl http://127.0.0.1:8000/api/health
curl https://your-domain.com/api/health
curl https://your-domain.com/api/meta/tables
```

Expected result from the health endpoint:

```json
{"status":"ok","database":"smarteats"}
```

Then verify the login-protected flow in a browser:

1. Open `https://your-domain.com`
2. Confirm the login page appears first
3. Sign in with a `viewer` account and confirm CRUD is hidden
4. Sign in with an `admin` account and confirm CRUD becomes available
5. Open customer data and confirm password fields are displayed as `*****`

## Security Recommendations

Before public launch, add these:

1. Authentication and session handling
2. Role-based authorization for CRUD operations
3. Firewall rules allowing only `80`, `443`, and `22`
4. MariaDB backups and retention policy
5. Application logs and access monitoring
6. Secret rotation for the database user

## Recommended Cloud Providers

This stack can be deployed on any Linux VM, including:

1. Tencent Cloud Lighthouse
2. Alibaba Cloud ECS
3. AWS EC2
4. Azure Virtual Machine
5. DigitalOcean Droplet

## What this deployment gives you

After completing this guide, the SmartEats system becomes:

1. Long-term accessible through a real domain
2. Managed by systemd for automatic restarts
3. Fronted by Nginx for HTTPS and reverse proxying
4. Safer than running directly on localtunnel or a developer laptop