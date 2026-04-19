TABLE_CATALOG = {
    "customer": {
        "label": "Customers",
        "primary_keys": ["customer_id"],
        "searchable_columns": ["customer_id", "user_name", "phone"],
        "default_sort": "customer_id",
    },
    "address": {
        "label": "Addresses",
        "primary_keys": ["customer_id", "address_id"],
        "searchable_columns": ["customer_id", "contact_name", "contact_phone", "address_text"],
        "default_sort": "address_id",
    },
    "merchant": {
        "label": "Merchants",
        "primary_keys": ["merchant_id"],
        "searchable_columns": ["merchant_name", "license_no"],
        "default_sort": "merchant_id",
    },
    "store": {
        "label": "Stores",
        "primary_keys": ["store_id"],
        "searchable_columns": ["store_name", "merchant_id"],
        "default_sort": "store_id",
    },
    "category": {
        "label": "Categories",
        "primary_keys": ["category_id"],
        "searchable_columns": ["category_name"],
        "default_sort": "category_id",
    },
    "dish": {
        "label": "Dishes",
        "primary_keys": ["dish_id"],
        "searchable_columns": ["dish_name", "store_id", "category_id"],
        "default_sort": "dish_id",
    },
    "orders": {
        "label": "Orders",
        "primary_keys": ["order_id"],
        "searchable_columns": ["customer_id", "store_id", "order_status", "payment_status", "settlement_status"],
        "default_sort": "order_id",
    },
    "order_detail": {
        "label": "Order Details",
        "primary_keys": ["detail_id"],
        "searchable_columns": ["order_id", "dish_id"],
        "default_sort": "detail_id",
    },
    "rider": {
        "label": "Riders",
        "primary_keys": ["rider_id"],
        "searchable_columns": ["real_name", "phone", "status", "affiliation_type"],
        "default_sort": "rider_id",
    },
    "delivery_task": {
        "label": "Delivery Tasks",
        "primary_keys": ["task_id"],
        "searchable_columns": ["rider_id", "order_id", "task_status"],
        "default_sort": "task_id",
    },
}
