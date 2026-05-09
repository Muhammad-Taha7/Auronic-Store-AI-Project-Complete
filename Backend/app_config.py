"""
App Configuration - مشترک ترتیبات
ہر API میں استعمال ہونے والے shared functions
"""
import os
from pathlib import Path
from mysql.connector import connect

# بنیادی ڈائریکٹریز
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# اجازت شدہ فائلوں کی اقسام
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

# ڈیٹابیس کی ترتیبات
DEFAULT_DB = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "auronic_store"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
}


def get_db_connection():
    """ڈیٹابیس سے جڑیں"""
    return connect(**DEFAULT_DB)
