"""
Orders API - آرڈرز کو منظم کرنا
"""
import json
from datetime import datetime
from flask import Blueprint, jsonify, request, Response
from mysql.connector import Error
from uuid import uuid4
from app_config import get_db_connection

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')


def parse_int_field(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def parse_float_field(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


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


@orders_bp.post("")
def create_order():
    """نیا آرڈر بنائیں"""
    payload = request.get_json(silent=True) or {}
    customer_name = (payload.get("customerName") or "").strip()
    customer_email = (payload.get("customerEmail") or "").strip().lower()
    customer_phone = (payload.get("customerPhone") or "").strip()
    shipping_address = (payload.get("shippingAddress") or "").strip()
    city = (payload.get("city") or "").strip()
    notes = (payload.get("notes") or "").strip()
    payment_method = (payload.get("paymentMethod") or "COD").strip().upper()
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
    if payment_method != "COD":
        return jsonify({"message": "Only Cash on Delivery is available right now."}), 400
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


@orders_bp.get("")
def get_orders():
    """تمام آرڈرز حاصل کریں"""
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


@orders_bp.delete("/history")
def clear_order_history():
    """آرڈر ہسٹری حذف کریں - ڈیزایبل کیا گیا (تمام آرڈرز محفوظ رہتے ہیں)"""
    # Orders are never deleted to maintain complete history in the portal
    return jsonify({"message": "Order history cannot be deleted. All orders are permanently saved for record-keeping."}), 403


@orders_bp.put("/<int:order_id>/status")
def update_order_status(order_id: int):
    """آرڈر کی حالت تبدیل کریں"""
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


@orders_bp.get("/<int:order_id>/download")
def download_order(order_id: int):
    """آرڈر کی رسید ڈاؤن لوڈ کریں"""
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


@orders_bp.get("/analytics")
def orders_analytics():
    """آرڈرز کے اعدادوشمار"""
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
