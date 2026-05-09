# Auronic Admin Portal - Backend Setup Guide

## Prerequisites
- Python 3.8+
- XAMPP (MySQL) - Running on port 3306
- pip (Python package manager)

## Setup Instructions

### 1. Create MySQL Database
Open XAMPP Control Panel and start MySQL, then:

```sql
CREATE DATABASE IF NOT EXISTS auronic_store;
USE auronic_store;

CREATE TABLE IF NOT EXISTS carousel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Or import the schema file:
```bash
mysql -u root auronic_store < Backend/schema.sql
```

### 2. Install Python Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 3. Create .env File (Optional, Backend uses defaults)

Create `Backend/.env`:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=auronic_store
MYSQL_PORT=3306
FLASK_ENV=development
FLASK_DEBUG=True
```

### 4. Run Flask Backend

```bash
cd Backend
python app.py
```

Backend will start on `http://localhost:5000`

## API Endpoints

### Get All Carousel Images
```
GET /api/carousel-images
```

### Create Carousel Image
```
POST /api/carousel-images
- Form Data:
  - title (required)
  - altText
  - displayOrder
  - image (file) or imageUrl
```

### Product APIs
```
GET /api/products
GET /api/products?trending=1
GET /api/products/{id}
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}
```

### Product Form Data
```
- title (required)
- description (required)
- price (required)
- originalPrice
- category
- badge
- rating
- displayOrder
- coverImageFile or coverImageUrl
- galleryImages (JSON array text or comma/newline list)
- colors (JSON array text or comma/newline list)
- warrantyOptions (JSON array text or comma/newline list)
- highlights (JSON array text or comma/newline list)
- isTrending
- isActive
```

### Delete Carousel Image
```
DELETE /api/carousel-images/{id}
```

### Health Check
```
GET /api/health
```

## Frontend Configuration

Frontend expects backend at `http://localhost:5000`

To change the API URL, update `FrontEnd/src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://your-backend-url:5000'
```

Or set environment variable:
```bash
VITE_API_BASE_URL=http://your-backend-url:5000 npm run dev
```

## Troubleshooting

### MySQL Connection Error
- Ensure XAMPP MySQL is running
- Check credentials in Backend/app.py
- Verify database exists: `auronic_store`

### Image Upload Error
- Ensure `Backend/uploads/` folder exists
- Check file permissions
- Verify file size < 8MB
- Allowed formats: png, jpg, jpeg, webp, gif

### CORS Error
- Backend CORS is enabled for all origins
- If issue persists, check Flask CORS configuration

## Theme Configuration

Admin Dashboard uses:
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Accent**: #007400 (Green)

All colors are customizable in the component files.
