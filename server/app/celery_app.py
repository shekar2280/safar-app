from celery import Celery
import os
from app.config import settings

def get_celery_redis_url(url):
    if url and url.startswith("rediss://") and "ssl_cert_reqs" not in url:
        delimiter = "&" if "?" in url else "?"
        return f"{url}{delimiter}ssl_cert_reqs=CERT_NONE"
    return url

celery_app = Celery(
    "safar_worker",
    broker=get_celery_redis_url(os.getenv("CELERY_BROKER_URL", settings.redis_url)),
    backend=get_celery_redis_url(os.getenv("CELERY_RESULT_BACKEND", settings.redis_url))
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["app"])
