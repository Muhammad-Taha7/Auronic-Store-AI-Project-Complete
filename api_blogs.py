"""
Blogs API - بلاگ پوسٹس
"""
from flask import Blueprint, jsonify, request
from mysql.connector import Error
from app_config import get_db_connection

blogs_bp = Blueprint('blogs', __name__, url_prefix='/api/blogs')


@blogs_bp.get("")
def get_blogs():
    """تمام بلاگز حاصل کریں"""
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
                "imageUrl": row[4] or "",
                "createdAt": row[5].isoformat() if row[5] else None
            })

        return jsonify(blogs)

    except Error as exc:
        return jsonify({"message": "Database error", "error": str(exc)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@blogs_bp.get("/<int:blog_id>")
def get_blog(blog_id: int):
    """ایک بلاگ حاصل کریں"""
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


@blogs_bp.post("")
def create_blog():
    """نیا بلاگ لکھیں"""
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


@blogs_bp.put("/<int:blog_id>")
def update_blog(blog_id: int):
    """بلاگ میں تبدیلی کریں"""
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


@blogs_bp.delete("/<int:blog_id>")
def delete_blog(blog_id: int):
    """بلاگ حذف کریں"""
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
