import logging
import sys
import json
from datetime import datetime, timezone
import os

_STANDARD_LOG_ATTRS = frozenset({
    "args", "created", "exc_info", "exc_text", "filename", "funcName",
    "levelname", "levelno", "lineno", "message", "module", "msecs",
    "msg", "name", "pathname", "process", "processName", "relativeCreated",
    "stack_info", "thread", "threadName",
})

class JsonFormatter(logging.Formatter):
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
            "pathname": record.pathname,
        }

        if record.exc_info:
            log_entry["traceback"] = self.formatException(record.exc_info)

        # Include any extra fields passed in 'extra={...}'
        for key, value in record.__dict__.items():
            if key not in _STANDARD_LOG_ATTRS and not key.startswith("_"):
                log_entry[key] = value

        try:
            return json.dumps(log_entry, default=str)
        except Exception:
            # Fallback if JSON serialization fails
            return f"{log_entry['timestamp']} - {log_entry['level']} - {log_entry['message']}"

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    # Allow overriding log level via environment variable for production debugging
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(log_level)
        logger.propagate = False

    return logger

auth_logger = get_logger("safar.auth")
trip_logger = get_logger("safar.trips")
api_logger = get_logger("safar.api")
db_logger = get_logger("safar.db")
