# SmartEats Web Application Manual

## Overview

The SmartEats web application is a full-stack control center designed around the current `smarteats` database. It provides a modern browser interface for live business operations, decision support, and guided record management without requiring end users to write SQL.

## Core Modules

1. Executive Dashboard
   Displays business KPIs such as customers, stores, riders, GMV, active deliveries, and completed orders.
2. No-Code Query Builder
   Lets users select any exposed table, search keyword fields, add filters, control sort order, and paginate results.
3. CRUD Studio
   Supports create, update, and delete operations using generated forms based on the actual reflected database schema.
4. Schema Explorer
   Shows table names, columns, types, primary keys, and searchable fields directly from live metadata.
5. Feature Manual View
   Provides an in-app summary of the implemented web capabilities.
6. Page Guide View
   Explains what each page is used for, who should use it, and what can be demonstrated there.
7. Login and Access Control
   Requires sign-in before entering the system and separates viewer and admin permissions.

## User-Facing Features

1. No-code table browsing across all exposed entities
2. Full-text style search on important business columns
3. Filter builder with operators such as equals, contains, greater-than, and less-than
4. Pagination and sorting for large result sets
5. Guided create, update, and delete workflows
6. Live integrity enforcement through backend and database constraints
7. KPI dashboard for operations and presentation use
8. Delivery and order status visual summaries
9. Top dish revenue analysis
10. Rider performance ranking
11. Schema visibility for teaching and debugging
12. Responsive single-page interface for desktop and tablet use
13. Production-style backend API structure suitable for further deployment
14. Dedicated in-app page-by-page explanation screen for demonstrations and user onboarding
15. Role-based login with protected CRUD capability
16. Sensitive password fields masked as `*****` in returned results

## Backend Capabilities

1. FastAPI REST API
2. SQLAlchemy live schema reflection
3. Table exposure catalog to control what the web app can access
4. Structured query endpoint for safe no-code exploration
5. Table-specific CRUD endpoints
6. Dashboard summary endpoint
7. Analytics bundle endpoint
8. Database overview endpoint
9. Health check endpoint

## Internet-Ready Direction

The codebase is structured so it can be deployed to a real server with a dedicated database account.

Recommended deployment path:

1. Host the FastAPI service behind Nginx or Caddy
2. Use HTTPS with a reverse proxy
3. Create a dedicated MariaDB/MySQL application user instead of using root
4. Configure `SMARTEATS_DATABASE_URL` in a server-side `.env` file
5. Restrict allowed origins in production
6. Add authentication and role-based access control before public internet exposure

## Suggested Roles for Real Usage

1. Operations Manager
   Uses the dashboard and query builder to monitor order and delivery activity.
2. Customer Service Staff
   Searches customers, addresses, and orders without SQL knowledge.
3. Merchant Operations Staff
   Reviews stores, dishes, and order performance.
4. Data Analyst
   Uses dashboard analytics and schema explorer for business insights.
5. Database Administrator
   Uses metadata views and CRUD tools for controlled maintenance.

## Important Note

This web application is already capable of real browser-based use on a trusted network or course-demo deployment. For unrestricted public internet release, the next mandatory step is authentication plus authorization, followed by production secrets management and database user hardening.

## Dynamic Deployment Quick Start

If you want the original backend-driven dynamic version, use the FastAPI backend instead of GitHub Pages.

### WSL local deployment

```bash
cd /mnt/c/Users/15957/Desktop/CSC3170_project/webapp/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python scripts/generate_password_hash.py
bash start_dev.sh
```

Before the final start command, put generated hashes into `.env` for:

1. `SMARTEATS_ADMIN_PASSWORD_HASH`
2. `SMARTEATS_VIEWER_PASSWORD_HASH`

Recommended role split:

1. `viewer` can browse and query data
2. `admin` can browse, query, create, update, and delete data

Then open:

```text
http://127.0.0.1:8000
```

### Public temporary demo sharing

If you want other people to access your current dynamic version without a cloud server, run this in another terminal:

```bash
npx localtunnel --port 8000
```

This gives you a temporary public URL.

### Formal production deployment

For a long-term deployment path using a real domain, Nginx, and systemd, see:

1. [webapp/docs/PRODUCTION_DEPLOYMENT.md](webapp/docs/PRODUCTION_DEPLOYMENT.md)
