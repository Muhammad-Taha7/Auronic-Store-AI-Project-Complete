from mysql.connector import connect, Error

try:
    conn = connect(host='localhost', user='root', password='', database='auronic_store')
    cursor = conn.cursor()
    
    # Create blogs table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            content LONGTEXT NOT NULL,
            image_url VARCHAR(255) DEFAULT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    print('Blogs table created successfully')
    
    cursor.close()
    conn.close()
except Error as e:
    print(f'Error: {e}')
