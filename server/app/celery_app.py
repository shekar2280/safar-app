from celery import Celery
import os

celery_app = Celery(
    "safar_worker",
    broker=os.getenv("CELERY_BROKER_URL", "pyamqp://user:password@localhost:5672//"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "rpc://")
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["app"])
