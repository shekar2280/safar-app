from celery import Celery
import os
from app.config import settings

celery_app = Celery(
    "safar_worker",
    broker=os.getenv("CELERY_BROKER_URL", settings.redis_url),
    backend=os.getenv("CELERY_RESULT_BACKEND", settings.redis_url)
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["app"])
