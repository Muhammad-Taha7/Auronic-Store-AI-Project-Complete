"""
App Configuration - مشترک ترتیبات
ہر API میں استعمال ہونے والے shared functions
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from mysql.connector import connect

# بنیادی ڈائریکٹریز
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BASE_DIR / ".env")

# اجازت شدہ فائلوں کی اقسام
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

DEFAULT_PAYMENT_METHODS = ("COD", "CARD", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA")


def _env_value(name, default=""):
    value = os.getenv(name)
    if value is None:
        return default

    text = str(value).strip()
    return text if text else default


def normalize_payment_method(value):
    if value is None:
        return "COD"

    text = str(value).strip().upper().replace("-", "_").replace(" ", "_")
    aliases = {
        "CASH_ON_DELIVERY": "COD",
        "COD": "COD",
        "CARD": "CARD",
        "CARDS": "CARD",
        "BANK": "BANK_TRANSFER",
        "BANK_TRANSFER": "BANK_TRANSFER",
        "BANKTRANSFER": "BANK_TRANSFER",
        "JAZZ_CASH": "JAZZCASH",
        "JAZZCASH": "JAZZCASH",
        "EASY_PAISA": "EASYPAISA",
        "EASYPAISA": "EASYPAISA",
        "EASYPEISA": "EASYPAISA",
    }
    return aliases.get(text, text)


def get_enabled_payment_methods():
    configured = _env_value("PAYMENT_METHODS", ",".join(DEFAULT_PAYMENT_METHODS))
    methods = []

    for raw_method in configured.split(","):
        method = normalize_payment_method(raw_method)
        if method in DEFAULT_PAYMENT_METHODS and method not in methods:
            methods.append(method)

    return methods or list(DEFAULT_PAYMENT_METHODS)


def get_payment_details(payment_method):
    method = normalize_payment_method(payment_method)
    support_phone = _env_value("PAYMENT_SUPPORT_PHONE", "")

    if method == "COD":
        return {
            "code": "COD",
            "label": "Cash On Delivery",
            "summary": "Pay the courier when your order arrives.",
            "instructions": [
                "Keep the exact amount ready at delivery time.",
                "You can inspect the parcel before handing over cash, if your courier allows it.",
            ],
            "supportPhone": support_phone,
        }

    if method == "CARD":
        return {
            "code": "CARD",
            "label": _env_value("CARD_GATEWAY_LABEL", "Card Payment"),
            "summary": _env_value("CARD_GATEWAY_SUMMARY", "Secure card payments through your configured gateway."),
            "instructions": [
                _env_value("CARD_GATEWAY_INSTRUCTIONS", "Complete the payment through the secure card gateway configured on the backend."),
            ],
            "checkoutUrl": _env_value("CARD_GATEWAY_CHECKOUT_URL", ""),
            "publicKey": _env_value("CARD_GATEWAY_PUBLIC_KEY", ""),
            "supportPhone": support_phone,
        }

    if method == "BANK_TRANSFER":
        return {
            "code": "BANK_TRANSFER",
            "label": _env_value("BANK_TRANSFER_LABEL", "Bank Transfer"),
            "summary": _env_value("BANK_TRANSFER_SUMMARY", "Transfer payment to the configured Pakistani bank account."),
            "instructions": [
                _env_value("BANK_TRANSFER_INSTRUCTIONS", "Use the account details below to transfer your order amount."),
            ],
            "bankName": _env_value("BANK_TRANSFER_BANK_NAME", ""),
            "accountName": _env_value("BANK_TRANSFER_ACCOUNT_NAME", ""),
            "accountNumber": _env_value("BANK_TRANSFER_ACCOUNT_NUMBER", ""),
            "iban": _env_value("BANK_TRANSFER_IBAN", ""),
            "branch": _env_value("BANK_TRANSFER_BRANCH", ""),
            "supportPhone": support_phone,
        }

    if method == "JAZZCASH":
        return {
            "code": "JAZZCASH",
            "label": _env_value("JAZZCASH_LABEL", "JazzCash"),
            "summary": _env_value("JAZZCASH_SUMMARY", "Pay through JazzCash using the configured merchant account."),
            "instructions": [
                _env_value("JAZZCASH_INSTRUCTIONS", "Send the payment to the JazzCash number below and keep the reference safe."),
            ],
            "merchantName": _env_value("JAZZCASH_MERCHANT_NAME", ""),
            "merchantNumber": _env_value("JAZZCASH_MERCHANT_NUMBER", ""),
            "referencePrefix": _env_value("JAZZCASH_REFERENCE_PREFIX", ""),
            "supportPhone": support_phone,
        }

    if method == "EASYPAISA":
        return {
            "code": "EASYPAISA",
            "label": _env_value("EASYPAISA_LABEL", "Easypaisa"),
            "summary": _env_value("EASYPAISA_SUMMARY", "Pay through Easypaisa using the configured merchant account."),
            "instructions": [
                _env_value("EASYPAISA_INSTRUCTIONS", "Send the payment to the Easypaisa number below and keep the reference safe."),
            ],
            "merchantName": _env_value("EASYPAISA_MERCHANT_NAME", ""),
            "merchantNumber": _env_value("EASYPAISA_MERCHANT_NUMBER", ""),
            "referencePrefix": _env_value("EASYPAISA_REFERENCE_PREFIX", ""),
            "supportPhone": support_phone,
        }

    return None


def get_payment_options():
    return [
        option
        for method in get_enabled_payment_methods()
        if (option := get_payment_details(method)) is not None
    ]

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
