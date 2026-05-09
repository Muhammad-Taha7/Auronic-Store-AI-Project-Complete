"""
Contacts API - کسٹمرز کے سوالات
"""
from flask import Blueprint, jsonify, request
from mysql.connector import Error
from app_config import get_db_connection

contacts_bp = Blueprint('contacts', __name__, url_prefix='/api/contacts')


@contacts_bp.post("")
def create_contact():
    """نیا رابطہ/سوال شامل کریں"""
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


@contacts_bp.get("")
def list_contacts():
    """تمام سوالات درج کریں (Admin)"""
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


@contacts_bp.put("/<int:contact_id>/status")
def update_contact_status(contact_id: int):
    """سوال کی حالت تبدیل کریں"""
    payload = request.get_json(silent=True) or {}
    is_read = payload.get('isRead', False)
    
    connection = None
    cursor = None
    try:
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


@contacts_bp.delete("/<int:contact_id>")
def delete_contact(contact_id: int):
    """سوال حذف کریں"""
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
