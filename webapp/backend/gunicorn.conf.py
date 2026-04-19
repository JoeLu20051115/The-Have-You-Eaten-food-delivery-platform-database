from __future__ import annotations

import multiprocessing
import os


bind = os.getenv("SMARTEATS_GUNICORN_BIND", "127.0.0.1:8000")
workers = int(os.getenv("SMARTEATS_GUNICORN_WORKERS", max(2, multiprocessing.cpu_count() * 2 + 1)))
worker_class = "uvicorn.workers.UvicornWorker"
accesslog = "-"
errorlog = "-"
timeout = int(os.getenv("SMARTEATS_GUNICORN_TIMEOUT", "60"))
graceful_timeout = int(os.getenv("SMARTEATS_GUNICORN_GRACEFUL_TIMEOUT", "30"))
keepalive = int(os.getenv("SMARTEATS_GUNICORN_KEEPALIVE", "5"))
forwarded_allow_ips = os.getenv("SMARTEATS_FORWARDED_ALLOW_IPS", "*")