# SmartEats Food Delivery Platform Database Project

This repository contains a cleaned, normalized, and runnable MySQL 8.0 database project for CSC 3170 Project 2026. The project models a food delivery platform with four coordinated modules:

1. Consumer Side
2. Merchant and Menu
3. Order Hub
4. Delivery Network

## Repository Structure

```text
archive/
  delivery.zip
  merchantData.zip
  order_hub.zip
data/
  consumer_side/
    address.csv
    customer.csv
  delivery_network/
    delivery_task.csv
    rider.csv
  merchant_and_menu/
    category.csv
    dish.csv
    merchant.csv
    store.csv
  order_hub/
    order_details.csv
    orders.csv
docs/
  Project_CSC3170_2026.pdf
  food_delivery_platform_erd.pdf
sql/
  00_initialize_database.sql
  01_consumer_side.sql
  02_merchant_and_menu.sql
  03_order_hub.sql
  04_delivery_network.sql
  05_operational_queries.sql
  06_analytics_queries.sql
README.md
```

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

## How to Run

### Prerequisites

- MySQL 8.0 or above
- `LOCAL INFILE` enabled in the MySQL client

If you use the MySQL command line client, start it with local infile enabled:

```sql
mysql --local-infile=1 -u root -p
```

Then from the project root, run:

```sql
SOURCE sql/00_initialize_database.sql;
```

This will:

1. Drop and recreate the `smarteats` database
2. Create tables in the correct dependency order
3. Load all CSV data from the `data/` directory

After loading, you can run:

```sql
USE smarteats;
SHOW TABLES;
```

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
