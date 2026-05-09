from app_config import get_db_connection
import json

conn = get_db_connection()
cursor = conn.cursor()
cursor.execute('SELECT * FROM customer_orders ORDER BY created_at DESC')

orders = cursor.fetchall()

print('\n')
print('█' * 130)
print('  DATABASE ORDERS - COMPLETE VIEW'.center(130))
print('█' * 130)
print('')
print('Total Orders: {}'.format(len(orders)))
print('')

for idx, order in enumerate(orders, 1):
    print('┌' + '─' * 128 + '┐')
    order_id = order[0] if order[0] else 'N/A'
    order_num = order[1] if order[1] else 'N/A'
    status = str(order[9]) if order[9] else 'unknown'
    total = float(order[12]) if order[12] else 0
    print('│ #{} | ORDER: {} | STATUS: {} | TOTAL: Rs. {:,.0f}'.format(
        str(idx).ljust(2),
        str(order_num)[:25].ljust(25),
        status.upper()[:10].ljust(10),
        total
    ).ljust(129) + '│')
    print('├' + '─' * 128 + '┤')
    print('│ CUSTOMER: {:<40} EMAIL: {:<40} │'.format(
        order[2][:40], 
        order[3][:40]
    ))
    print('│ PHONE: {:<40} ADDRESS: {:<40} │'.format(
        order[4][:40],
        (str(order[5]) + ', ' + str(order[6]))[:40]
    ))
    shipping = float(order[11]) if order[11] else 0
    subtotal = float(order[10]) if order[10] else 0
    print('│ PAYMENT: {:<20} SHIPPING: Rs. {:>10,.0f}   SUBTOTAL: Rs. {:>10,.0f} │'.format(
        order[8],
        shipping,
        subtotal
    ))
    print('│ DATE: {:<50} NOTES: {:<30} │'.format(
        str(order[15])[:50],
        (order[7] or 'N/A')[:30]
    ))
    
    if order[13]:
        items = json.loads(order[13])
        print('│ ITEMS ({} products):'.format(len(items)))
        for item in items:
            qty = item.get('quantity', 1)
            price = float(item.get('price', 0)) if item.get('price') else 0
            title = item.get('title', 'Unknown')[:60]
            print('│   • {} x {} @ Rs. {:,.0f}'.format(
                title,
                qty,
                price
            ))
    
    print('└' + '─' * 128 + '┘')
    print('')

# Summary Statistics
print('█' * 130)
print('  SUMMARY STATISTICS'.center(130))
print('█' * 130)
total_revenue = sum(float(o[12]) if o[12] else 0 for o in orders)
pending = sum(1 for o in orders if o[9] == 'pending')
completed = sum(1 for o in orders if o[9] == 'completed')
cancelled = sum(1 for o in orders if o[9] == 'cancelled')

print('Total Orders: {} | Pending: {} | Completed: {} | Cancelled: {}'.format(
    len(orders), pending, completed, cancelled
))
print('Total Revenue: Rs. {:,.0f}'.format(total_revenue))
print('Average Order Value: Rs. {:,.0f}'.format(total_revenue / len(orders) if orders else 0))
print('█' * 130)
print('')

cursor.close()
conn.close()
