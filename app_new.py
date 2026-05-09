"""
Auronic E-commerce Backend - Main Server
تمام APIs کو یہاں منظم کیا گیا ہے
"""
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
from mysql.connector import Error
from app_config import get_db_connection

# API Blueprints import کریں
from api_carousel import carousel_bp
from api_products import products_bp
from api_orders import orders_bp
from api_contacts import contacts_bp
from api_blogs import blogs_bp
from api_chatbot import chatbot_bp

# Flask ایپ بنائیں
app = Flask(__name__)

# ترتیبات
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8MB

# CORS فعال کریں
CORS(app)

# ہر Blueprint کو رجسٹر کریں
app.register_blueprint(carousel_bp)
app.register_blueprint(products_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(contacts_bp)
app.register_blueprint(blogs_bp)
app.register_blueprint(chatbot_bp)


# ============ DATABASE SETUP ============

ORDER_COLUMNS = {
    "order_number": "VARCHAR(64) DEFAULT NULL",
    "customer_name": "VARCHAR(255) NOT NULL DEFAULT ''",
    "customer_email": "VARCHAR(255) NOT NULL DEFAULT ''",
    "customer_phone": "VARCHAR(80) NOT NULL DEFAULT ''",
    "shipping_address": "TEXT",
    "city": "VARCHAR(120) NOT NULL DEFAULT ''",
    "notes": "TEXT DEFAULT NULL",
    "payment_method": "VARCHAR(40) NOT NULL DEFAULT 'COD'",
    "status": "VARCHAR(40) NOT NULL DEFAULT 'pending'",
    "subtotal": "DECIMAL(12,2) NOT NULL DEFAULT 0",
    "shipping_fee": "DECIMAL(12,2) NOT NULL DEFAULT 0",
    "total": "DECIMAL(12,2) NOT NULL DEFAULT 0",
    "items_json": "LONGTEXT",
    "user_uid": "VARCHAR(255) DEFAULT NULL",
    "updated_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
}
ORDER_TABLE = "customer_orders"


def ensure_orders_columns(cursor) -> None:
    """آرڈرز ٹیبل میں کالمز شامل کریں"""
    cursor.execute(f"SHOW COLUMNS FROM {ORDER_TABLE}")
    existing_columns = {row[0] for row in cursor.fetchall()}

    for column_name, definition in ORDER_COLUMNS.items():
        if column_name not in existing_columns:
            cursor.execute(f"ALTER TABLE {ORDER_TABLE} ADD COLUMN {column_name} {definition}")

    cursor.execute(f"SHOW INDEX FROM {ORDER_TABLE} WHERE Key_name = 'ux_orders_order_number'")
    if cursor.fetchone() is None:
        cursor.execute(f"CREATE UNIQUE INDEX ux_orders_order_number ON {ORDER_TABLE}(order_number)")


def ensure_table() -> None:
    """ڈیٹابیس ٹیبلز بنائیں"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # کیروسیل ٹیبل
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS carousel_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                alt_text VARCHAR(255) DEFAULT NULL,
                display_order INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        
        # پروڈکٹس ٹیبل
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10,2) NOT NULL DEFAULT 0,
                original_price DECIMAL(10,2) DEFAULT NULL,
                category VARCHAR(120) DEFAULT NULL,
                badge VARCHAR(120) DEFAULT NULL,
                cover_image VARCHAR(255) NOT NULL,
                gallery_images LONGTEXT DEFAULT NULL,
                colors LONGTEXT DEFAULT NULL,
                warranty_options LONGTEXT DEFAULT NULL,
                highlights LONGTEXT DEFAULT NULL,
                rating DECIMAL(3,1) NOT NULL DEFAULT 5.0,
                is_trending TINYINT(1) NOT NULL DEFAULT 1,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                display_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        
        # آرڈرز ٹیبل
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customer_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(64) NOT NULL UNIQUE,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(80) NOT NULL,
                shipping_address TEXT NOT NULL,
                city VARCHAR(120) NOT NULL,
                notes TEXT DEFAULT NULL,
                payment_method VARCHAR(40) NOT NULL DEFAULT 'COD',
                status VARCHAR(40) NOT NULL DEFAULT 'pending',
                subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
                shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
                total DECIMAL(12,2) NOT NULL DEFAULT 0,
                items_json LONGTEXT NOT NULL,
                user_uid VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        ensure_orders_columns(cursor)
        
        # رابطے ٹیبل
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(80) DEFAULT NULL,
                subject VARCHAR(255) DEFAULT NULL,
                message LONGTEXT NOT NULL,
                is_read TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        
        # بلاگز ٹیبل
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                content LONGTEXT NOT NULL,
                image_url VARCHAR(255) DEFAULT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        
        connection.commit()
        print("✅ ڈیٹابیس ٹیبلز بن گئے")
        
    except Error as e:
        print(f"❌ ڈیٹابیس میں خرابی: {e}")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ============ ROUTES ============

@app.get("/api/health")
def health():
    """سرور کو چیک کریں"""
    return jsonify({
        "status": "ok ✅",
        "message": "Auronic Backend Running",
        "time": datetime.utcnow().isoformat()
    })


@app.get("/")
def home():
    """ہوم پیج"""
    return jsonify({
        "name": "Auronic E-commerce Backend",
        "version": "2.0",
        "status": "Running ✅",
        "endpoints": {
            "carousel": "/api/carousel-images",
            "products": "/api/products",
            "orders": "/api/orders",
            "contacts": "/api/contacts",
            "blogs": "/api/blogs",
            "chatbot": "/api/chatbot",
            "health": "/api/health"
        }
    })


# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    """صفحہ نہیں ملا"""
    return jsonify({
        "error": "Page Not Found",
        "message": "یہ URL موجود نہیں ہے"
    }), 404


@app.errorhandler(500)
def server_error(error):
    """سرور میں خرابی"""
    return jsonify({
        "error": "Internal Server Error",
        "message": "سرور میں خرابی"
    }), 500


# ============ STARTUP ============

if __name__ == "__main__":
    print("🚀 Auronic Backend شروع ہو رہا ہے...")
    ensure_table()
    print("✅ سب کچھ تیار ہے!")
    app.run(debug=True, host="0.0.0.0", port=5000)
