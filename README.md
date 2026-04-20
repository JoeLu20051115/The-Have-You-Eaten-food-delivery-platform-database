# SmartEats Food Delivery Platform Database Project

This repository contains a cleaned, normalized, and runnable MySQL-compatible database project for CSC 3170 Project 2026. The project models a food delivery platform with four coordinated modules:

1. Consumer Side
2. Merchant and Menu
3. Order Hub
4. Delivery Network

## Web Application

The repository also includes a dynamic SmartEats web control center built with FastAPI plus a browser frontend.

Main web assets are located in:

1. [webapp/backend/app/main.py](webapp/backend/app/main.py)
2. [webapp/backend/app/static/index.html](webapp/backend/app/static/index.html)
3. [webapp/backend/app/static/app.js](webapp/backend/app/static/app.js)
4. [webapp/backend/app/static/styles.css](webapp/backend/app/static/styles.css)
5. [webapp/docs/PRODUCTION_DEPLOYMENT.md](webapp/docs/PRODUCTION_DEPLOYMENT.md)

### Fully automated setup without sudo (local MariaDB binary)

If you cannot use `apt`/`sudo`, run this **once** from the repository root after cloning (downloads ~332MB on first run unless the tarball is already present under `$HOME/.local/share/smarteats-mariadb/`):

```bash
chmod +x finish_setup_user.sh scripts/*.sh
./finish_setup_user.sh
```

Then start the backend as usual (`webapp/backend`, `uvicorn` or `start_dev.sh`). The script uses port **3307** for MySQL; `patch_webapp_env_user_mariadb.sh` aligns `SMARTEATS_DATABASE_URL` in `.env`.

### LLM AI Assistant (optional)

The web UI includes an **AI Assistant** view: you ask questions in natural language, and the backend calls an **OpenAI-compatible** chat API. The model can invoke a single tool, `run_readonly_query`, which executes **read-only** SQL: statements are validated, wrapped, and row-capped in [`webapp/backend/app/sql_guard.py`](webapp/backend/app/sql_guard.py). Sensitive columns stay masked like the rest of the app.

Copy [`webapp/backend/.env.example`](webapp/backend/.env.example) to `webapp/backend/.env`. For the AI Assistant, **`SMARTEATS_OPENAI_API_KEY` is the only value you must set** (your own token). The backend already defaults to **ModelScope** inference and **`ZhipuAI/GLM-5.1`** in [`webapp/backend/app/config.py`](webapp/backend/app/config.py); override with env vars if you use OpenAI, Ollama, or another provider.

| Variable | Purpose |
|----------|---------|
| `SMARTEATS_OPENAI_API_KEY` | Required to enable the assistant. Use your [ModelScope access token](https://modelscope.cn/my/myaccesstoken) for the default stack. **Never commit this key.** |
| `SMARTEATS_OPENAI_BASE_URL` | Optional. Default: `https://api-inference.modelscope.cn/v1`. For Ollama’s OpenAI shim, use `http://127.0.0.1:11434/v1`. |
| `SMARTEATS_LLM_MODEL` | Optional. Default: `ZhipuAI/GLM-5.1`. Use any id from your provider’s model list. |

The backend uses the same `OpenAI` client as the official Python example; it does **not** use streaming in the agent route—tool calls use the non-streaming chat completion API. If a model does not support function/tool calling, switch models or rely on the JSON fallback in the agent service.

Endpoints: `GET /api/agent/status`, `POST /api/agent/chat` (authenticated users). Restart the backend after changing `.env`. For production or public exposure, add rate limiting, budget caps, and review of prompts—**do not** put secrets in the frontend. **Never commit real API keys**; keep them only in local `.env`.

### First-time web setup

This section is only required for people who want to run the dynamic website locally on their own machine.

You do not need to run this if:

1. You only want to open someone else's temporary `localtunnel` link.
2. You only want to view the static GitHub Pages version.

You do need to run this once if:

1. You want your own local dynamic website at `http://127.0.0.1:8000`.
2. You want to develop, debug, or demonstrate the backend on your own computer.
3. You are a teammate who cloned the repository and wants to run the full project independently.

In WSL, run:

```bash
cd /mnt/c/Users/15957/Desktop/CSC3170_project/webapp/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Then generate an administrator password hash:

```bash
python scripts/generate_password_hash.py
```

Put the generated hash into `.env` as:

```dotenv
SMARTEATS_ADMIN_USERNAME=admin
SMARTEATS_ADMIN_PASSWORD_HASH=pbkdf2_sha256$390000$replace$replace
```

After that, start the website locally:

```bash
bash start_dev.sh
```

After the first successful setup, later launches are much shorter. Usually you only need:

```bash
cd /mnt/c/Users/15957/Desktop/CSC3170_project/webapp/backend
source .venv/bin/activate
bash start_dev.sh
```

You only need to repeat the full first-time setup if one of these happens:

1. You are on a new machine.
2. The `.venv` folder was deleted.
3. The `.env` file does not exist yet.
4. The Python dependencies changed and need reinstalling.

## How To Open The Website

This project contains a dynamic website, but it is not officially deployed on a public server.

That means:

1. `http://127.0.0.1:8000` only works on the same machine that is running the FastAPI backend.
2. Other people cannot open your own `127.0.0.1:8000`, because on their computer that address points to their own local machine, not yours.
3. If another person wants to use the dynamic website, they must either run the project locally themselves or you must temporarily expose your local server through a tool such as `localtunnel`.

So the practical rule is:

1. If a person wants their own local dynamic website, they must do the first-time setup once on their own machine.
2. If a person only wants to access your already running website, they should use your shared `localtunnel` URL and do not need to run the setup locally.

### Option 1. Open the website on your own computer

This is the standard way to use the dynamic version without paying for formal deployment.

In WSL, run:

```bash
cd /mnt/c/Users/15957/Desktop/CSC3170_project/webapp/backend
source .venv/bin/activate
bash start_dev.sh
```

Then open this address in the browser on the same computer:

```text
http://127.0.0.1:8000
```

Current login model:

1. The administrator account is preconfigured locally in `.env`.
2. Normal users are not pre-created.
3. The website opens with the Sign In page first.
4. If a user has no account, they click `Have no account? Register here` to switch to the register page.
5. After registration succeeds, the page returns to Sign In and the new user logs in there.
6. If the password is wrong, the error is shown directly inside the login card.
7. Only the administrator can perform create, update, and delete operations.

### Option 2. Let another person run the project locally

If another teammate wants to open the same dynamic website without using your computer, they should:

1. Clone or download this repository.
2. Set up WSL MariaDB and bootstrap the database.
3. Start the backend locally with `bash start_dev.sh`.
4. Open `http://127.0.0.1:8000` on their own machine.

This is the recommended no-cost collaboration path for this project.

### Option 3. Temporary public sharing without official deployment

If you want another person to access your currently running local website without buying a server, first keep the backend running locally, then open another terminal and run:

```bash
npx localtunnel --port 8000
```

This command returns a temporary public URL such as:

```text
https://example-name.loca.lt
```

Other people must open that `loca.lt` URL, not `http://127.0.0.1:8000`.

Important limitations:

1. This is temporary sharing, not formal deployment.
2. The URL may change every time you restart localtunnel.
3. Your computer and local backend must stay running.
4. If your network changes or your computer sleeps, the shared link may stop working.

### Option 4. Static online preview only

If you only need an online presentation page and do not need the real backend database, you can use the static GitHub Pages version in `docs/`.

That version can be published online for free, but it does not provide the real dynamic backend, live database queries, or true CRUD operations.

Deployment assets are provided in:

1. [webapp/docs/PRODUCTION_DEPLOYMENT.md](webapp/docs/PRODUCTION_DEPLOYMENT.md)
2. [deploy/nginx/smarteats.conf](deploy/nginx/smarteats.conf)
3. [deploy/systemd/smarteats-web.service](deploy/systemd/smarteats-web.service)
4. [deploy/scripts/provision_ubuntu.sh](deploy/scripts/provision_ubuntu.sh)

The repository also includes a GitHub Pages static presentation version for zero-server online access:

1. [docs/index.html](docs/index.html)
2. [docs/styles.css](docs/styles.css)
3. [docs/app.js](docs/app.js)

If you enable GitHub Pages on the `/docs` folder of the `main` branch, the project can be accessed online without keeping a backend service running.

## Design Highlights

### 1. One unified database
All four modules now run inside a single MySQL schema named `smarteats`. This fixes the original cross-database inconsistency between `consumer_side`, `orderhub`, `csc3170`, and `smarteats`.

### 2. Weak entity handling for Address
`address` is modeled as a weak entity owned by `customer`.

- Primary key: `(customer_id, address_id)`
- Additional unique key: `address_id`
- `orders` references `(customer_id, address_id)` together, which ensures an order cannot point to another customer's address.

This is a stronger and more faithful implementation of the ER design than the original standalone `address_id` foreign key.

### 3. Order-Delivery relationship repaired
The original delivery script did not connect `delivery_task` to `orders`, even though the ER diagram clearly includes the `ASSIGNED` relationship.

The cleaned schema adds:

- `delivery_task.order_id`
- `UNIQUE (order_id)` so one order maps to at most one delivery task
- A foreign key from `delivery_task.order_id` to `orders.order_id`

### 4. Stronger integrity constraints
The cleaned schema adds practical constraints suitable for a course project and report discussion:

- Unique phone numbers for customers and riders
- Unique merchant license numbers
- Price, quantity, rating, preparation time, and amount checks
- Enumerated business states for orders and delivery tasks
- Proper cascading behavior for dependent entities

### 5. Better normalization
The design keeps the schema in good normalized form:

- Merchant, store, category, dish are separated cleanly
- Orders and order details are separated to resolve repeating line items
- Delivery data is separated from order and customer data
- Address ownership is enforced relationally instead of by application logic

## Data Summary

- 300 customers
- 300 addresses
- 30 merchants
- 45 stores
- 18 categories
- Dish catalog loaded from cleaned CSV
- 50 orders
- Order details loaded from CSV
- 200 riders
- 500 delivery tasks

## Environment Setup

### Dependency file

This repository now includes a simple system package list in [requirements.txt](requirements.txt).

Note: this file is used here as a lightweight package manifest for WSL Ubuntu system dependencies, not as a Python dependency file.

For WSL Ubuntu, the one-click installation target is MariaDB 10.11, which is MySQL-compatible for this project.

The SQL scripts are written to run under:

- MySQL 8.0+
- MariaDB 10.11+ on Ubuntu WSL

### One-command installation in WSL

From the project root in WSL, run:

```bash
chmod +x scripts/install_wsl_env.sh scripts/bootstrap_database.sh scripts/verify_database.sh
./scripts/install_wsl_env.sh
```

This script will:

1. Install the required client and server packages from [requirements.txt](requirements.txt)
2. Start the MariaDB service
3. Prepare the local database environment

Important:

The shell scripts are stored inside the [scripts](scripts) directory.
If you run `chmod +x install_wsl_env.sh bootstrap_database.sh verify_database.sh` directly from the project root, Linux will report that the files do not exist.
The correct paths are:

```bash
chmod +x scripts/install_wsl_env.sh scripts/bootstrap_database.sh scripts/verify_database.sh
```

### One-command database bootstrap

After installation, initialize the project database with:

```bash
./scripts/bootstrap_database.sh
```

This script runs [sql/00_initialize_database.sql](sql/00_initialize_database.sql) and will:

1. Drop and recreate the `smarteats` database
2. Create all tables in the correct dependency order
3. Load all CSV data from the `data/` directory

### One-command verification

To verify that the database is loaded correctly, run:

```bash
./scripts/verify_database.sh
```

This script checks:

1. Row counts for all major tables
2. Whether any order references an invalid customer address
3. Whether any delivery task references a non-existent order

### Manual client mode

If you want to enter the client manually in WSL Ubuntu, use:

```bash
sudo mariadb --local-infile=1
```

Then run SQL commands inside the client:

```sql
SOURCE sql/00_initialize_database.sql;
USE smarteats;
SHOW TABLES;
```

What these commands mean:

1. `sudo mariadb --local-infile=1`
  Starts the MariaDB command-line client with administrator privileges and enables CSV loading.
2. `SOURCE sql/00_initialize_database.sql;`
  Executes the main project script, which creates the database, creates all tables, and loads the CSV data.
3. `USE smarteats;`
  Switches the current session to the `smarteats` database.
4. `SHOW TABLES;`
  Lists all tables currently created inside the selected database.

Why `sudo` is required in WSL:

- On Ubuntu, MariaDB often configures `root@localhost` with socket authentication by default.
- That means `mariadb -u root` may fail with `ERROR 1698 (28000): Access denied for user 'root'@'localhost'`.
- `sudo mariadb` is the correct default way to access the local database as root in this environment.

## Example Usage

The following example shows a complete database session from connection to business query.

### Step 1. Enter the database client

```bash
cd /mnt/c/Users/15957/Desktop/CSC3170_project
sudo mariadb --local-infile=1
```

### Step 2. Select the project database

```sql
USE smarteats;
```

This tells MariaDB that all following operations should be executed inside the SmartEats project database.

### Step 3. Check whether the schema is loaded

```sql
SHOW TABLES;
```

Expected result:

- `address`
- `category`
- `customer`
- `delivery_task`
- `dish`
- `merchant`
- `order_detail`
- `orders`
- `rider`
- `store`

This confirms that the four modules have been successfully created.

### Step 4. Check whether the data is loaded

```sql
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_dishes FROM dish;
SELECT COUNT(*) AS total_riders FROM rider;
```

Expected values in this project:

- `total_orders = 50`
- `total_dishes = 550`
- `total_riders = 200`

This confirms that the CSV data import process completed successfully.

### Step 5. Execute a real business query

Example: show the order history and delivery progress of customer `C001`.

```sql
SELECT o.order_id,
       o.order_time,
       o.order_status,
       o.total_amount,
       dt.task_status,
       r.real_name AS rider_name
FROM orders AS o
LEFT JOIN delivery_task AS dt ON dt.order_id = o.order_id
LEFT JOIN rider AS r ON r.rider_id = dt.rider_id
WHERE o.customer_id = 'C001'
ORDER BY o.order_time DESC;
```

What this query proves:

1. The customer module and order module are linked correctly.
2. The order module and delivery module are linked correctly.
3. The database supports practical operational queries, not just table creation.

### Step 6. Verify structural integrity

```sql
SELECT COUNT(*) AS invalid_customer_address_links
FROM orders AS o
LEFT JOIN address AS a
  ON o.customer_id = a.customer_id
 AND o.address_id = a.address_id
WHERE a.address_id IS NULL;

SELECT COUNT(*) AS invalid_delivery_links
FROM delivery_task AS dt
LEFT JOIN orders AS o
  ON dt.order_id = o.order_id
WHERE dt.order_id IS NOT NULL
  AND o.order_id IS NULL;
```

Expected result:

- `invalid_customer_address_links = 0`
- `invalid_delivery_links = 0`

This is direct evidence that the foreign key design and weak entity handling are working correctly.

## Query Files

### Operational queries
Run:

```sql
SOURCE sql/05_operational_queries.sql;
```

This file contains practical daily-operation examples such as:

- customer order history
- merchant preparation queue
- order line-item inspection
- daily revenue by store
- rider workload dashboard
- best-selling dishes
- merchant settlement summary

### Analytics queries
Run:

```sql
SOURCE sql/06_analytics_queries.sql;
```

This file contains higher-value analytic examples for bonus discussion, including:

- category revenue contribution by merchant
- hourly demand analysis
- rider performance ranking
- customer lifetime value quartiles
- frequent co-purchase dish pairs

## Suggested Report Talking Points

You can directly reuse the following points in the project report and presentation.

### Introduction and motivation
- SmartEats integrates consumers, merchants, orders, and riders in one delivery ecosystem.
- The platform needs transactional consistency, operational visibility, and analytical support.
- A normalized relational schema is suitable because the system is highly structured and relationship-heavy.

### Design and implementation
- Explain the ER diagram and four modules.
- Emphasize the weak entity treatment of `address`.
- Explain why `order_detail` resolves the many-to-many relationship between `orders` and `dish`.
- Explain why `delivery_task.order_id` is necessary to faithfully capture `ASSIGNED`.
- Mention that CSV-backed loading makes the project reproducible and easy to demonstrate.

### Index recommendations
These indexes are already included or naturally supported by primary/unique keys:

- `orders(customer_id, order_time)` for customer history queries
- `orders(store_id, order_status)` for merchant dashboards
- `orders(payment_status, settlement_status)` for finance and settlement queries
- `dish(store_id, category_id)` for menu browsing and category analytics
- `delivery_task(rider_id, task_status)` for dispatch and rider workload tracking
- unique phone and license indexes for identity lookups and data quality

### Security and privacy suggestions
If you want to discuss the Security & Privacy bonus path, this project already gives you a solid starting point:

- password hashes are stored instead of plain-text passwords
- unique identifiers reduce duplicate identity records
- foreign keys reduce orphaned sensitive records
- you can further propose role-based permissions, row-level views, and phone masking in reports

### LLM + Database bonus framing
If you want to discuss the LLM bonus path, you can honestly present this cleaned version as an LLM-assisted refinement of the original draft:

- unifying multiple inconsistent databases into one schema
- repairing missing integrity constraints
- correcting weak entity modeling
- adding better sample operational and analytical SQL

## Original Problems Fixed

The original repository had several issues that would reduce project quality:

- inconsistent database names across modules
- scripts that could not be executed cleanly as one project
- missing order-to-delivery foreign key
- consumer module stored only partial schema information from a raw dump
- no password hash in the customer schema despite the ER model
- weak entity semantics for address not enforced
- data files scattered across root, `data`, and a Chinese-named folder

These issues are now corrected in the cleaned project structure.

## Notes

- The original ZIP bundles are preserved in `archive/` for traceability.
- The cleaned SQL scripts in `sql/` are now the authoritative version.
- If your MySQL environment blocks `LOCAL INFILE`, enable it in the client configuration before loading.

```