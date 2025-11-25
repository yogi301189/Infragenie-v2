import logging
import sys
from utils.zip_builder import build_zip_from_result


def get_logger(name: str) -> logging.Logger:
    """
    Create and return a configured logger.
    Ensures we don't add duplicate handlers if called multiple times.
    """
    logger = logging.getLogger(name)

    # If already configured, just return it
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        "%Y-%m-%d %H:%M:%S",
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Avoid double logging to root logger
    logger.propagate = False

    return logger
