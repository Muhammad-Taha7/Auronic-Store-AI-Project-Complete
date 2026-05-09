from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS
from mysql.connector import Error, connect
from werkzeug.utils import secure_filename

from app_config import get_enabled_payment_methods, get_payment_details, normalize_payment_method
from chatbot import chatbot

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
DEFAULT_DB = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "auronic_store"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
CORS(app)


def get_db_connection():
    return connect(**DEFAULT_DB)


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
    cursor.execute(f"SHOW COLUMNS FROM {ORDER_TABLE}")
    existing_columns = {row[0] for row in cursor.fetchall()}

    for column_name, definition in ORDER_COLUMNS.items():
        if column_name not in existing_columns:
            cursor.execute(f"ALTER TABLE {ORDER_TABLE} ADD COLUMN {column_name} {definition}")

    cursor.execute(f"SHOW INDEX FROM {ORDER_TABLE} WHERE Key_name = 'ux_orders_order_number'")
    if cursor.fetchone() is None:
        cursor.execute(f"CREATE UNIQUE INDEX ux_orders_order_number ON {ORDER_TABLE}(order_number)")


def ensure_table() -> None:
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
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
        # Contacts / Queries table
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
        connection.commit()
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_list_field(value):
    if value is None:
        return []

    if isinstance(value, list):
        return [item for item in value if item]

    text = str(value).strip()
    if not text:
        return []

    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [item for item in parsed if item]
    except (TypeError, ValueError):
        pass

    return [item.strip() for item in text.replace("\n", ",").split(",") if item.strip()]


def parse_bool_field(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def parse_float_field(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_int_field(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def serialize_product_row(row):
    cover_image = row[7]
    if cover_image and not cover_image.startswith(("http://", "https://")):
        cover_image = f"/uploads/{cover_image}"

    def parse_json_column(raw_value):
        if not raw_value:
            return []
        try:
            parsed = json.loads(raw_value)
            return parsed if isinstance(parsed, list) else []
        except (TypeError, ValueError):
            return []

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2] or "",
        "price": float(row[3] or 0),
        "originalPrice": float(row[4]) if row[4] is not None else None,
        "category": row[5] or "",
        "badge": row[6] or "",
        "coverImage": cover_image or "",
        "galleryImages": parse_json_column(row[8]),
        "colors": parse_json_column(row[9]),
        "warrantyOptions": parse_json_column(row[10]),
        "highlights": parse_json_column(row[11]),
        "rating": float(row[12] or 0),
        "isTrending": bool(row[13]),
        "isActive": bool(row[14]),
        "displayOrder": row[15] or 0,
        "createdAt": row[16].isoformat() if row[16] else None,
    }


def serialize_row(row):
    image_path = row[2]
    # Check if it's a URL or a local file path
    if image_path.startswith(('http://', 'https://')):
        image_url = image_path
    else:
        image_url = f"/uploads/{image_path}"
    
    return {
        "id": row[0],
        "title": row[1],
        "imageUrl": image_url,
        "description": row[3] or "",
        "altText": row[3] or row[1],
        "displayOrder": row[4] or 0,
        "isActive": bool(row[5]),
        "createdAt": row[6].isoformat() if row[6] else None,
    }


def serialize_order_row(row):
    items = []
    try:
        parsed_items = json.loads(row[13] or "[]")
        if isinstance(parsed_items, list):
            items = parsed_items
    except (TypeError, ValueError):
        items = []

    return {
        "id": row[0],
        "orderNumber": row[1],
        "customerName": row[2],
        "customerEmail": row[3],
        "customerPhone": row[4],
        "shippingAddress": row[5],
        "city": row[6],
        "notes": row[7] or "",
        "paymentMethod": row[8],
        "status": row[9],
        "subtotal": float(row[10] or 0),
        "shippingFee": float(row[11] or 0),
        "total": float(row[12] or 0),
        "items": items,
        "userUid": row[14] or "",
        "createdAt": row[15].isoformat() if row[15] else None,
        "updatedAt": row[16].isoformat() if row[16] else None,
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})


@app.get("/api/carousel-images")
def get_carousel_images():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT id, title, image_path, alt_text, display_order, is_active, created_at
            FROM carousel_images
            WHERE is_active = 1
            ORDER BY display_order ASC, id DESC
            """
        )
        rows = cursor.fetchall()
        return jsonify([serialize_row(row) for row in rows])
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.post("/api/carousel-images")
def create_carousel_image():
    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or request.form.get("altText") or "").strip()
    file = request.files.get("image")
    image_url = (request.form.get("imageUrl") or "").strip()
    try:
        display_order = int(request.form.get("displayOrder", 0))
    except (TypeError, ValueError):
        display_order = 0

    if not title:
        return jsonify({"message": "Title is required."}), 400

    # Handle file upload or URL
    if file and file.filename != "":
        # File upload mode
        if not allowed_file(file.filename):
            return jsonify({"message": "Only png, jpg, jpeg, webp and gif files are allowed."}), 400

        filename = secure_filename(file.filename)
        unique_name = f"{uuid4().hex}_{filename}"
        file.save(UPLOAD_DIR / unique_name)
        image_path = unique_name
    elif image_url:
        # URL mode - store URL directly
        image_path = image_url
    else:
        return jsonify({"message": "Either image file or URL is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO carousel_images (title, image_path, alt_text, display_order, is_active)
            VALUES (%s, %s, %s, %s, 1)
            """,
            (title, image_path, description, display_order),
        )
        connection.commit()
        return jsonify({"message": "Carousel image saved successfully."}), 201
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.put("/api/carousel-images/<int:image_id>")
def update_carousel_image(image_id: int):
    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or request.form.get("altText") or "").strip()
    file = request.files.get("image")
    image_url = (request.form.get("imageUrl") or "").strip()
    try:
        display_order = int(request.form.get("displayOrder", 0))
    except (TypeError, ValueError):
        display_order = 0

    if not title:
        return jsonify({"message": "Title is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT image_path FROM carousel_images WHERE id = %s", (image_id,))
        row = cursor.fetchone()

        if row is None:
            return jsonify({"message": "Carousel image not found."}), 404

        existing_image_path = row[0]
        next_image_path = existing_image_path

        if file and file.filename != "":
            if not allowed_file(file.filename):
                return jsonify({"message": "Only png, jpg, jpeg, webp and gif files are allowed."}), 400

            filename = secure_filename(file.filename)
            unique_name = f"{uuid4().hex}_{filename}"
            file.save(UPLOAD_DIR / unique_name)
            next_image_path = unique_name
        elif image_url:
            next_image_path = image_url

        cursor.execute(
            """
            UPDATE carousel_images
            SET title = %s, image_path = %s, alt_text = %s, display_order = %s
            WHERE id = %s
            """,
            (title, next_image_path, description, display_order, image_id),
        )
        connection.commit()

        if next_image_path != existing_image_path and not existing_image_path.startswith(("http://", "https://")):
            old_file = UPLOAD_DIR / existing_image_path
            if old_file.exists():
                old_file.unlink()

        return jsonify({"message": "Carousel image updated successfully."})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.delete("/api/carousel-images/<int:image_id>")
def delete_carousel_image(image_id: int):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT image_path FROM carousel_images WHERE id = %s", (image_id,))
        row = cursor.fetchone()
        if row is None:
            return jsonify({"message": "Carousel image not found."}), 404

        cursor.execute("DELETE FROM carousel_images WHERE id = %s", (image_id,))
        connection.commit()

        # Only delete local file if it's not a URL
        image_path = row[0]
        if not image_path.startswith(('http://', 'https://')):
            file_path = UPLOAD_DIR / image_path
            if file_path.exists():
                file_path.unlink()

        return jsonify({"message": "Carousel image deleted."})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.get("/api/products")
def get_products():
    connection = None
    cursor = None
    trending_param = request.args.get("trending", "").strip().lower()
    active_only = request.args.get("active", "1").strip().lower() in {"1", "true", "yes", "on"}

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
            SELECT id, title, description, price, original_price, category, badge, cover_image,
                   gallery_images, colors, warranty_options, highlights, rating, is_trending,
                   is_active, display_order, created_at
            FROM products
            WHERE 1 = 1
        """

        if active_only:
            query += " AND is_active = 1"
        
        # Handle trending filter: trending=1 or trending=true for trending only
        # trending=0 or trending=false for non-trending only
        if trending_param in {"1", "true", "yes", "on"}:
            query += " AND is_trending = 1"
        elif trending_param in {"0", "false", "no", "off"}:
            query += " AND is_trending = 0"
        # If trending_param is empty string or not specified, return all products

        query += " ORDER BY display_order ASC, id DESC"

        cursor.execute(query)
        rows = cursor.fetchall()
        return jsonify([serialize_product_row(row) for row in rows])
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.get("/api/products/<int:product_id>")
def get_product(product_id: int):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT id, title, description, price, original_price, category, badge, cover_image,
                   gallery_images, colors, warranty_options, highlights, rating, is_trending,
                   is_active, display_order, created_at
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return jsonify({"message": "Product not found."}), 404

        return jsonify(serialize_product_row(row))
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.post("/api/products")
def create_product():
    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or "").strip()
    category = (request.form.get("category") or "").strip()
    badge = (request.form.get("badge") or "").strip()
    cover_image_url = (request.form.get("coverImageUrl") or request.form.get("coverImage") or "").strip()
    cover_image_file = request.files.get("coverImageFile") or request.files.get("coverImage")
    gallery_images = parse_list_field(request.form.get("galleryImages"))
    colors = parse_list_field(request.form.get("colors"))
    warranty_options = parse_list_field(request.form.get("warrantyOptions"))
    highlights = parse_list_field(request.form.get("highlights"))
    price = parse_float_field(request.form.get("price"))
    original_price = request.form.get("originalPrice")
    rating = parse_float_field(request.form.get("rating"), 5.0)
    display_order = int(request.form.get("displayOrder", 0) or 0)
    is_trending = parse_bool_field(request.form.get("isTrending"), True)
    is_active = parse_bool_field(request.form.get("isActive"), True)

    if not title:
        return jsonify({"message": "Title is required."}), 400
    if not description:
        return jsonify({"message": "Description is required."}), 400

    if cover_image_file and getattr(cover_image_file, "filename", ""):
        if not allowed_file(cover_image_file.filename):
            return jsonify({"message": "Only png, jpg, jpeg, webp and gif files are allowed."}), 400

        filename = secure_filename(cover_image_file.filename)
        unique_name = f"{uuid4().hex}_{filename}"
        cover_image_file.save(UPLOAD_DIR / unique_name)
        cover_image_value = unique_name
    elif cover_image_url:
        cover_image_value = cover_image_url
    else:
        return jsonify({"message": "A cover image is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO products (
                title, description, price, original_price, category, badge, cover_image,
                gallery_images, colors, warranty_options, highlights, rating,
                is_trending, is_active, display_order
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                title,
                description,
                price,
                parse_float_field(original_price) if original_price not in {None, ""} else None,
                category,
                badge,
                cover_image_value,
                json.dumps(gallery_images),
                json.dumps(colors),
                json.dumps(warranty_options),
                json.dumps(highlights),
                rating,
                int(is_trending),
                int(is_active),
                display_order,
            ),
        )
        connection.commit()
        return jsonify({"message": "Product saved successfully."}), 201
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.put("/api/products/<int:product_id>")
def update_product(product_id: int):
    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or "").strip()
    category = (request.form.get("category") or "").strip()
    badge = (request.form.get("badge") or "").strip()
    cover_image_url = (request.form.get("coverImageUrl") or request.form.get("coverImage") or "").strip()
    cover_image_file = request.files.get("coverImageFile") or request.files.get("coverImage")
    gallery_images = parse_list_field(request.form.get("galleryImages"))
    colors = parse_list_field(request.form.get("colors"))
    warranty_options = parse_list_field(request.form.get("warrantyOptions"))
    highlights = parse_list_field(request.form.get("highlights"))
    price = parse_float_field(request.form.get("price"))
    original_price = request.form.get("originalPrice")
    rating = parse_float_field(request.form.get("rating"), 5.0)
    display_order = int(request.form.get("displayOrder", 0) or 0)
    is_trending = parse_bool_field(request.form.get("isTrending"), True)
    is_active = parse_bool_field(request.form.get("isActive"), True)

    if not title:
        return jsonify({"message": "Title is required."}), 400
    if not description:
        return jsonify({"message": "Description is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT cover_image FROM products WHERE id = %s", (product_id,))
        row = cursor.fetchone()

        if row is None:
            return jsonify({"message": "Product not found."}), 404

        existing_cover_image = row[0]
        next_cover_image = existing_cover_image

        if cover_image_file and getattr(cover_image_file, "filename", ""):
            if not allowed_file(cover_image_file.filename):
                return jsonify({"message": "Only png, jpg, jpeg, webp and gif files are allowed."}), 400

            filename = secure_filename(cover_image_file.filename)
            unique_name = f"{uuid4().hex}_{filename}"
            cover_image_file.save(UPLOAD_DIR / unique_name)
            next_cover_image = unique_name
        elif cover_image_url:
            next_cover_image = cover_image_url

        cursor.execute(
            """
            UPDATE products
            SET title = %s, description = %s, price = %s, original_price = %s, category = %s,
                badge = %s, cover_image = %s, gallery_images = %s, colors = %s,
                warranty_options = %s, highlights = %s, rating = %s, is_trending = %s,
                is_active = %s, display_order = %s
            WHERE id = %s
            """,
            (
                title,
                description,
                price,
                parse_float_field(original_price) if original_price not in {None, ""} else None,
                category,
                badge,
                next_cover_image,
                json.dumps(gallery_images),
                json.dumps(colors),
                json.dumps(warranty_options),
                json.dumps(highlights),
                rating,
                int(is_trending),
                int(is_active),
                display_order,
                product_id,
            ),
        )
        connection.commit()

        if next_cover_image != existing_cover_image and existing_cover_image and not existing_cover_image.startswith(("http://", "https://")):
            old_file = UPLOAD_DIR / existing_cover_image
            if old_file.exists():
                old_file.unlink()

        return jsonify({"message": "Product updated successfully."})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.delete("/api/products/<int:product_id>")
def delete_product(product_id: int):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT cover_image FROM products WHERE id = %s", (product_id,))
        row = cursor.fetchone()

        if row is None:
            return jsonify({"message": "Product not found."}), 404

        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        connection.commit()

        cover_image = row[0]
        if cover_image and not cover_image.startswith(("http://", "https://")):
            file_path = UPLOAD_DIR / cover_image
            if file_path.exists():
                file_path.unlink()

        return jsonify({"message": "Product deleted successfully."})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.post("/api/orders")
def create_order():
    payload = request.get_json(silent=True) or {}
    customer_name = (payload.get("customerName") or "").strip()
    customer_email = (payload.get("customerEmail") or "").strip().lower()
    customer_phone = (payload.get("customerPhone") or "").strip()
    shipping_address = (payload.get("shippingAddress") or "").strip()
    city = (payload.get("city") or "").strip()
    notes = (payload.get("notes") or "").strip()
    payment_method = normalize_payment_method(payload.get("paymentMethod") or "COD")
    user_uid = (payload.get("userUid") or "").strip() or None
    items = payload.get("items") or []
    subtotal = parse_float_field(payload.get("subtotal"), 0.0)
    shipping_fee = parse_float_field(payload.get("shippingFee"), 0.0)
    total = parse_float_field(payload.get("total"), 0.0)

    if not customer_name:
        return jsonify({"message": "Customer name is required."}), 400
    if not customer_email:
        return jsonify({"message": "Customer email is required."}), 400
    if not customer_phone:
        return jsonify({"message": "Customer phone is required."}), 400
    if not shipping_address:
        return jsonify({"message": "Shipping address is required."}), 400
    if not city:
        return jsonify({"message": "City is required."}), 400
    if payment_method not in get_enabled_payment_methods():
        return jsonify({"message": "Selected payment method is not available right now."}), 400
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"message": "At least one order item is required."}), 400

    normalized_items = []
    for item in items:
        if not isinstance(item, dict):
            continue
        quantity = max(1, parse_int_field(item.get("quantity"), 1))
        price = parse_float_field(item.get("price"), 0.0)
        normalized_items.append(
            {
                "productId": item.get("productId"),
                "title": item.get("title") or "Untitled Product",
                "price": price,
                "quantity": quantity,
                "selectedColor": item.get("selectedColor") or "",
                "selectedWarranty": item.get("selectedWarranty") or "",
                "coverImage": item.get("coverImage") or "",
            }
        )

    if len(normalized_items) == 0:
        return jsonify({"message": "Order contains invalid items."}), 400

    server_subtotal = sum((item["price"] * item["quantity"]) for item in normalized_items)
    if subtotal <= 0:
        subtotal = server_subtotal
    if total <= 0:
        total = subtotal + shipping_fee

    order_number = f"ORD-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid4().hex[:5].upper()}"
    payment_details = get_payment_details(payment_method)

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO customer_orders (
                order_number, customer_name, customer_email, customer_phone,
                shipping_address, city, notes, payment_method, status,
                subtotal, shipping_fee, total, items_json, user_uid
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s, %s, %s)
            """,
            (
                order_number,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                city,
                notes,
                payment_method,
                subtotal,
                shipping_fee,
                total,
                json.dumps(normalized_items),
                user_uid,
            ),
        )
        connection.commit()

        return (
            jsonify(
                {
                    "message": "Order placed successfully.",
                    "orderId": cursor.lastrowid,
                    "orderNumber": order_number,
                    "paymentDetails": payment_details,
                }
            ),
            201,
        )
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.get("/api/orders")
def get_orders():
    connection = None
    cursor = None
    status = (request.args.get("status") or "").strip().lower()
    user_email = (request.args.get("userEmail") or "").strip().lower()
    user_uid = (request.args.get("userUid") or "").strip()
    order_number = (request.args.get("orderNumber") or "").strip()
    order_id = parse_int_field(request.args.get("orderId"), 0)

    query = """
        SELECT id, order_number, customer_name, customer_email, customer_phone,
               shipping_address, city, notes, payment_method, status,
               subtotal, shipping_fee, total, items_json, user_uid, created_at, updated_at
        FROM customer_orders
        WHERE 1 = 1
    """
    params = []

    if status in {"pending", "completed", "cancelled"}:
        query += " AND status = %s"
        params.append(status)

    if user_email:
        query += " AND customer_email = %s"
        params.append(user_email)

    if user_uid:
        query += " AND user_uid = %s"
        params.append(user_uid)

    if order_number:
        query += " AND order_number LIKE %s"
        params.append(f"%{order_number}%")

    if order_id > 0:
        query += " AND id = %s"
        params.append(order_id)

    query += " ORDER BY created_at DESC, id DESC"

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return jsonify([serialize_order_row(row) for row in rows])
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.delete("/api/orders/history")
def clear_order_history():
    connection = None
    cursor = None
    user_email = (request.args.get("userEmail") or "").strip().lower()
    user_uid = (request.args.get("userUid") or "").strip()

    if not user_email and not user_uid:
        return jsonify({"message": "userEmail or userUid is required."}), 400

    query = "DELETE FROM customer_orders WHERE 1 = 1"
    params = []

    if user_email:
        query += " AND customer_email = %s"
        params.append(user_email)

    if user_uid:
        query += " AND user_uid = %s"
        params.append(user_uid)

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(query, tuple(params))
        deleted_count = cursor.rowcount
        connection.commit()
        return jsonify({"message": "Order history cleared successfully.", "deletedCount": deleted_count})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.put("/api/orders/<int:order_id>/status")
def update_order_status(order_id: int):
    payload = request.get_json(silent=True) or {}
    status = (payload.get("status") or "").strip().lower()
    if status not in {"pending", "completed", "cancelled"}:
        return jsonify({"message": "Invalid order status."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("UPDATE customer_orders SET status = %s WHERE id = %s", (status, order_id))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Order not found."}), 404

        return jsonify({"message": "Order status updated successfully."})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.get("/api/orders/<int:order_id>/download")
def download_order(order_id: int):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT id, order_number, customer_name, customer_email, customer_phone,
                   shipping_address, city, notes, payment_method, status,
                   subtotal, shipping_fee, total, items_json, user_uid, created_at, updated_at
                 FROM customer_orders
            WHERE id = %s
            """,
            (order_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return jsonify({"message": "Order not found."}), 404

        order = serialize_order_row(row)
        lines = [
            "AURONIC STORE ORDER SUMMARY",
            "=" * 40,
            f"Order Number: {order['orderNumber']}",
            f"Status: {order['status'].upper()}",
            f"Created At: {order['createdAt']}",
            "",
            "CUSTOMER DETAILS",
            "-" * 40,
            f"Name: {order['customerName']}",
            f"Email: {order['customerEmail']}",
            f"Phone: {order['customerPhone']}",
            f"Address: {order['shippingAddress']}",
            f"City: {order['city']}",
            f"Notes: {order['notes'] or 'N/A'}",
            "",
            "ORDER ITEMS",
            "-" * 40,
        ]

        for index, item in enumerate(order["items"], start=1):
            lines.extend(
                [
                    f"{index}. {item.get('title', 'Product')}",
                    f"   Quantity: {item.get('quantity', 1)}",
                    f"   Price: Rs. {float(item.get('price', 0)):.2f}",
                    f"   Color: {item.get('selectedColor') or 'N/A'}",
                    f"   Warranty: {item.get('selectedWarranty') or 'N/A'}",
                ]
            )

        lines.extend(
            [
                "",
                "PAYMENT",
                "-" * 40,
                f"Payment Method: {order['paymentMethod']}",
                f"Subtotal: Rs. {order['subtotal']:.2f}",
                f"Shipping Fee: Rs. {order['shippingFee']:.2f}",
                f"Total: Rs. {order['total']:.2f}",
            ]
        )

        output = "\n".join(lines)
        response = Response(output, mimetype="text/plain")
        response.headers["Content-Disposition"] = f"attachment; filename=order-{order['orderNumber']}.txt"
        return response
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.get("/api/orders/analytics")
def orders_analytics():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT status, total, created_at
            FROM customer_orders
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

        total_orders = len(rows)
        total_revenue = 0.0
        revenue_lost = 0.0
        pending_count = 0
        completed_count = 0
        cancelled_count = 0
        monthly_map = {}
        monthly_loss_map = {}
        monthly_status_map = {}

        for status, total, created_at in rows:
            value = float(total or 0)
            status_text = (status or "pending").lower()

            if status_text == "completed":
                completed_count += 1
                total_revenue += value
            elif status_text == "cancelled":
                cancelled_count += 1
                revenue_lost += value
            else:
                pending_count += 1

            if created_at:
                key = created_at.strftime("%Y-%m")
                if key not in monthly_map:
                    monthly_map[key] = 0.0
                if key not in monthly_loss_map:
                    monthly_loss_map[key] = 0.0
                if key not in monthly_status_map:
                    monthly_status_map[key] = {"completed": 0, "pending": 0, "cancelled": 0}

                monthly_map[key] += value

                if status_text == "completed":
                    monthly_status_map[key]["completed"] += 1
                elif status_text == "cancelled":
                    monthly_status_map[key]["cancelled"] += 1
                    monthly_loss_map[key] += value
                else:
                    monthly_status_map[key]["pending"] += 1

        monthly_revenue = [
            {"month": key, "revenue": round(value, 2), "loss": round(monthly_loss_map.get(key, 0.0), 2)}
            for key, value in sorted(monthly_map.items())[-6:]
        ]

        monthly_orders = [
            {
                "month": key,
                "completed": value["completed"],
                "pending": value["pending"],
                "cancelled": value["cancelled"],
            }
            for key, value in sorted(monthly_status_map.items())[-6:]
        ]

        success_rate = (completed_count / total_orders * 100.0) if total_orders else 0.0
        avg_order_value = (total_revenue / completed_count) if completed_count else 0.0

        return jsonify(
            {
                "totalOrders": total_orders,
                "completedOrders": completed_count,
                "pendingOrders": pending_count,
                "cancelledOrders": cancelled_count,
                "totalRevenue": round(total_revenue, 2),
                "revenueLost": round(revenue_lost, 2),
                "successRate": round(success_rate, 2),
                "avgOrderValue": round(avg_order_value, 2),
                "monthlyRevenue": monthly_revenue,
                "monthlyOrders": monthly_orders,
            }
        )
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


@app.delete("/api/orders/user-history")
def clear_user_order_history():
    """Delete orders only from user's view (used for clearing user history on website)"""
    connection = None
    cursor = None
    user_email = (request.args.get("userEmail") or "").strip().lower()
    user_uid = (request.args.get("userUid") or "").strip()

    if not user_email and not user_uid:
        return jsonify({"message": "userEmail or userUid is required."}), 400

    query = "DELETE FROM customer_orders WHERE 1 = 1"
    params = []

    if user_email:
        query += " AND customer_email = %s"
        params.append(user_email)

    if user_uid:
        query += " AND user_uid = %s"
        params.append(user_uid)

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(query, tuple(params))
        deleted_count = cursor.rowcount
        connection.commit()
        return jsonify({"message": "Order history cleared successfully.", "deletedCount": deleted_count})
    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()

# ================= BLOGS API (FIXED) ================= #

@app.get("/api/blogs")
def get_blogs():
    """Fetch all active blogs (FIXED camelCase)"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, title, description, content, image_url, created_at 
            FROM blogs 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        blogs = []
        for row in rows:
            blogs.append({
                "id": row[0],
                "title": row[1],
                "description": row[2] or "",
                "content": row[3],
                "imageUrl": row[4] or "",   # ✅ FIX
                "createdAt": row[5].isoformat() if row[5] else None  # ✅ FIX
            })

        return jsonify(blogs)

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.get("/api/blogs/<int:blog_id>")
def get_blog(blog_id: int):
    """Fetch single blog (FIXED)"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, title, description, content, image_url, created_at 
            FROM blogs 
            WHERE id = %s AND is_active = 1
        """, (blog_id,))

        row = cursor.fetchone()

        if not row:
            return jsonify({"message": "Blog not found."}), 404

        blog = {
            "id": row[0],
            "title": row[1],
            "description": row[2] or "",
            "content": row[3],
            "imageUrl": row[4] or "",
            "createdAt": row[5].isoformat() if row[5] else None
        }

        return jsonify(blog)

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post("/api/blogs")
def create_blog():
    """Create blog (already correct)"""
    payload = request.get_json(silent=True) or {}

    title = (payload.get("title") or "").strip()
    description = (payload.get("description") or "").strip()
    content = (payload.get("content") or "").strip()
    image_url = (payload.get("imageUrl") or "").strip()

    if not title:
        return jsonify({"message": "Title is required."}), 400
    if not content:
        return jsonify({"message": "Content is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO blogs (title, description, content, image_url, is_active)
            VALUES (%s, %s, %s, %s, 1)
        """, (title, description, content, image_url))

        connection.commit()

        return jsonify({"message": "Blog created successfully."}), 201

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.put("/api/blogs/<int:blog_id>")
def update_blog(blog_id: int):
    """Update blog (already correct)"""
    payload = request.get_json(silent=True) or {}

    title = (payload.get("title") or "").strip()
    description = (payload.get("description") or "").strip()
    content = (payload.get("content") or "").strip()
    image_url = (payload.get("imageUrl") or "").strip()

    if not title:
        return jsonify({"message": "Title is required."}), 400
    if not content:
        return jsonify({"message": "Content is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE blogs 
            SET title = %s, description = %s, content = %s, image_url = %s 
            WHERE id = %s
        """, (title, description, content, image_url, blog_id))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Blog not found."}), 404

        return jsonify({"message": "Blog updated successfully."})

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.delete("/api/blogs/<int:blog_id>")
def delete_blog(blog_id: int):
    """Delete blog"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("DELETE FROM blogs WHERE id = %s", (blog_id,))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Blog not found."}), 404

        return jsonify({"message": "Blog deleted successfully."})

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post('/api/contacts')
def create_contact():
    payload = request.get_json(silent=True) or {}
    name = (payload.get('name') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    phone = (payload.get('phone') or '').strip()
    subject = (payload.get('subject') or '').strip()
    message = (payload.get('message') or '').strip()

    if not name:
        return jsonify({'message': 'Name is required.'}), 400
    if not email:
        return jsonify({'message': 'Email is required.'}), 400
    if not message:
        return jsonify({'message': 'Message is required.'}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO contacts (name, email, phone, subject, message)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (name, email, phone, subject, message),
        )
        connection.commit()
        return jsonify({'message': 'Contact saved successfully.'}), 201
    except Error as exc:
        return jsonify({'message': 'Database error', 'error': str(exc)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.get('/api/contacts')
def list_contacts():
    """List contact queries for admin"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id, name, email, phone, subject, message, is_read, created_at FROM contacts ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()
        contacts = []
        for row in rows:
            contacts.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3] or '',
                'subject': row[4] or '',
                'message': row[5] or '',
                'isRead': bool(row[6]),
                'createdAt': row[7].isoformat() if row[7] else None,
            })
        return jsonify(contacts)
    except Error as exc:
        return jsonify({'message': 'Database error', 'error': str(exc)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.put('/api/contacts/<int:contact_id>/status')
def update_contact_status(contact_id: int):
    connection = None
    cursor = None
    try:
        payload = request.get_json(silent=True) or {}
        is_read = payload.get('isRead', False)
        
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            'UPDATE contacts SET is_read = %s WHERE id = %s',
            (1 if is_read else 0, contact_id)
        )
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({'message': 'Contact not found.'}), 404
        return jsonify({'message': 'Contact status updated successfully.'})
    except Error as exc:
        return jsonify({'message': 'Database error', 'error': str(exc)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.delete('/api/contacts/<int:contact_id>')
def delete_contact(contact_id: int):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('DELETE FROM contacts WHERE id = %s', (contact_id,))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({'message': 'Contact not found.'}), 404
        return jsonify({'message': 'Contact deleted successfully.'})
    except Error as exc:
        return jsonify({'message': 'Database error', 'error': str(exc)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/chatbot", methods=["POST"])
def chatbot_endpoint():
    """
    Chatbot API endpoint
    Handles user queries and returns AI-powered responses
    """
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Validate if query is related to Auronic e-commerce
        if not chatbot.validate_topic(user_message):
            response = "I'm here to help with Auronic e-commerce questions! Please ask about products, orders, shipping, returns, or any other store-related queries."
        else:
            # Get chatbot response
            response = chatbot.get_response(user_message)
        
        return jsonify({
            "message": response,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    ensure_table()
    app.run(debug=True, host="0.0.0.0", port=5000)
