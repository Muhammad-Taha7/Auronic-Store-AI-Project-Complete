from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from mysql.connector import Error, connect
from werkzeug.utils import secure_filename

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
        connection.commit()
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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
        "isActive": bool(row[5]),
        "createdAt": row[6].isoformat() if row[6] else None,
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
            ORDER BY id DESC
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
            (title, image_path, description, 0),
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
            SET title = %s, image_path = %s, alt_text = %s
            WHERE id = %s
            """,
            (title, next_image_path, description, image_id),
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


@app.get("/uploads/<path:filename>")
def uploaded_file(filename: str):
    return send_from_directory(UPLOAD_DIR, filename)


if __name__ == "__main__":
    ensure_table()
    app.run(debug=True, host="0.0.0.0", port=5000)
