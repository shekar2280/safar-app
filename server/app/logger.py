import logging
import sys
import json
from datetime import datetime, timezone


_STANDARD_LOG_ATTRS = frozenset({
    "args", "created", "exc_info", "exc_text", "filename", "funcName",
    "levelname", "levelno", "lineno", "message", "module", "msecs",
    "msg", "name", "pathname", "process", "processName", "relativeCreated",
    "stack_info", "thread", "threadName",
})


class JsonFormatter(logging.Formatter):
    """Structured JSON log formatter — production-grade, compatible with Datadog/GCP/ELK."""

    LEVEL_MAP = {
        logging.DEBUG: "DEBUG",
        logging.INFO: "INFO",
        logging.WARNING: "WARNING",
        logging.ERROR: "ERROR",
        logging.CRITICAL: "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": self.LEVEL_MAP.get(record.levelno, "INFO"),
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            log_entry["traceback"] = self.formatException(record.exc_info)

        # Capture any extra fields added via logger.error(..., extra={...})
        for key, value in record.__dict__.items():
            if key not in _STANDARD_LOG_ATTRS and not key.startswith("_"):
                log_entry[key] = value

        return json.dumps(log_entry, default=str)


def get_logger(name: str) -> logging.Logger:
    """Returns a structured JSON logger. Use this everywhere instead of print()."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False

    return logger


# App-wide loggers
auth_logger = get_logger("safar.auth")
trip_logger = get_logger("safar.trips")
api_logger = get_logger("safar.api")
db_logger = get_logger("safar.db")
