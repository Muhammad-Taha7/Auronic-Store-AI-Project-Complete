from mysql.connector import connect, Error

try:
    conn = connect(host='localhost', user='root', password='', database='auronic_store')
    cursor = conn.cursor()
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")
    cursor.execute("SET sql_mode='NO_AUTO_VALUE_ON_ZERO'")
    
    # Check what columns exist in products table
    try:
        cursor.execute("SELECT * FROM products LIMIT 0")
        cols = [desc[0] for desc in cursor.description]
        print('Existing columns:', cols)
        cursor.fetchall()  # Clear any unread results
    except Exception as e:
        print('Products table does not exist or error:', str(e))
    
    # Drop and recreate
    cursor.execute('DROP TABLE IF EXISTS products')
    conn.commit()
    
    cursor.execute('''
        CREATE TABLE products (
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
    ''')
    conn.commit()
    print('Products table recreated successfully')
    
    # Add some sample products
    products = [
        ('Premium Wireless Headphones', 'High-quality sound with noise cancellation', 9999.00, 12999.00, 'Electronics', 'NEW', '["color1.jpg", "color2.jpg"]', '["Black", "White", "Silver"]', '["1 Year Warranty", "2 Year Warranty"]', '["Active Noise Cancellation", "40 Hour Battery", "Bluetooth 5.0"]', 4.8, 1),
        ('Laptop Stand', 'Ergonomic aluminum laptop stand for better posture', 3999.00, 5999.00, 'Accessories', 'HOT', '["stand1.jpg"]', '["Silver"]', '[]', '["Adjustable Height", "Portable", "Supports up to 15 inch"]', 4.5, 1),
    ]
    
    cursor.executemany('''
        INSERT INTO products (title, description, price, original_price, category, badge, gallery_images, colors, warranty_options, highlights, rating, is_trending)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''', products)
    conn.commit()
    print(f'Added {cursor.rowcount} sample products')
    
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    cursor.close()
    conn.close()
except Error as e:
    print(f'Error: {e}')
