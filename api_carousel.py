"""
Carousel API - ہوم پیج کی بڑی تصاویر
"""
from flask import Blueprint, jsonify, request
from mysql.connector import Error
from pathlib import Path
from uuid import uuid4
from werkzeug.utils import secure_filename
from app_config import get_db_connection, UPLOAD_DIR, ALLOWED_EXTENSIONS

carousel_bp = Blueprint('carousel', __name__, url_prefix='/api/carousel-images')


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def serialize_row(row):
    image_path = row[2]
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


@carousel_bp.get("")
def get_carousel_images():
    """تمام کیروسیل کی تصاویر حاصل کریں"""
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


@carousel_bp.post("")
def create_carousel_image():
    """نئی کیروسیل تصویر شامل کریں"""
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

    if file and file.filename != "":
        if not allowed_file(file.filename):
            return jsonify({"message": "Only png, jpg, jpeg, webp and gif files are allowed."}), 400

        filename = secure_filename(file.filename)
        unique_name = f"{uuid4().hex}_{filename}"
        file.save(UPLOAD_DIR / unique_name)
        image_path = unique_name
    elif image_url:
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


@carousel_bp.put("/<int:image_id>")
def update_carousel_image(image_id: int):
    """کیروسیل تصویر میں تبدیلی کریں"""
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


@carousel_bp.delete("/<int:image_id>")
def delete_carousel_image(image_id: int):
    """کیروسیل تصویر حذف کریں"""
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
