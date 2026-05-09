"""
Products API - پروڈکٹس کو حاصل اور منظم کرنا
"""
import json
from flask import Blueprint, jsonify, request
from mysql.connector import Error
from uuid import uuid4
from werkzeug.utils import secure_filename
from app_config import get_db_connection, UPLOAD_DIR, ALLOWED_EXTENSIONS

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


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


def parse_float_field(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_bool_field(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


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


@products_bp.get("")
def get_products():
    """تمام پروڈکٹس حاصل کریں"""
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
        
        if trending_param in {"1", "true", "yes", "on"}:
            query += " AND is_trending = 1"
        elif trending_param in {"0", "false", "no", "off"}:
            query += " AND is_trending = 0"

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


@products_bp.get("/<int:product_id>")
def get_product(product_id: int):
    """ایک پروڈکٹ کی تفصیل"""
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


@products_bp.post("")
def create_product():
    """نیا پروڈکٹ شامل کریں"""
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


@products_bp.put("/<int:product_id>")
def update_product(product_id: int):
    """پروڈکٹ میں تبدیلی کریں"""
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


@products_bp.delete("/<int:product_id>")
def delete_product(product_id: int):
    """پروڈکٹ حذف کریں"""
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
