from pathlib import Path

from loguru import logger

from app.core.config import settings

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Remove Loguru's default console logger
logger.remove()

# Console logging
logger.add(
    sink=lambda msg: print(msg, end=""),
    level=settings.LOG_LEVEL,
    colorize=True,
)

# File logging
logger.add(
    LOG_DIR / "app.log",
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    level=settings.LOG_LEVEL,
    enqueue=True,
)

app_logger = logger