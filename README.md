# Auronic Store - Admin Portal & Carousel System

A professional e-commerce admin portal with Firebase authentication and MySQL-backed carousel management system.

## 🎨 Design System

- **Primary Color**: Black (#000000)
- **Secondary Color**: White (#FFFFFF)  
- **Accent Color**: #007400 (Eco Green)

## 📁 Project Structure

```
Auronic Store/
├── Backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── schema.sql          # MySQL schema
│   ├── uploads/            # Carousel image storage
│   ├── SETUP.md           # Backend setup guide
│   └── .env.example       # Environment variables template
├── FrontEnd/
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Home.jsx              # Homepage with carousel
│   │   │   ├── Login.jsx             # Firebase auth login
│   │   │   ├── Admin/
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── AdminDashboard.jsx    # Main admin dashboard
│   │   │   │   └── AdminCarouselImages.jsx # Carousel manager
│   │   ├── Components/
│   │   │   ├── Carousel.jsx          # Carousel component
│   │   │   ├── Navbar.jsx            # Navigation
│   │   │   ├── UserMenu.jsx          # User profile dropdown
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── Auth/
│   │   │   ├── Firebase.js           # Firebase config
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── config/
│   │   │   └── api.js                # Backend API URL config
│   │   └── App.jsx                   # Main app routes
│   └── package.json
└── Database/
    └── (Empty - uses XAMPP MySQL)
```

## 🚀 Quick Start

### 1. Backend Setup

#### MySQL Database
```bash
# Start XAMPP MySQL Service
# Create database:
mysql -u root -e "CREATE DATABASE auronic_store;"

# Import schema:
mysql -u root auronic_store < Backend/schema.sql
```

#### Flask API
```bash
cd Backend
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd FrontEnd
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔐 Authentication

### User Registration & Login
- **Location**: `/login`
- **Method**: Firebase Email/Password or Google OAuth
- **Profile**: Shows user avatar/initials and logout dropdown in navbar

### Admin Portal
- **Location**: `/admin/login`
- **Credentials**: 
  - Username: `Taha`
  - Password: `password.11`
- **Theme**: Black and White with green accents (#007400)

## 🖼️ Carousel System

### Frontend - Homepage
- **File**: `FrontEnd/src/Pages/Home.jsx`
- **Component**: `Carousel.jsx`
- Fetches images from backend API
- Auto-rotates every 5 seconds
- Shows slide count indicator
- Displays slide title and description

### Admin Dashboard
- **File**: `AdminDashboard.jsx`
- Shows real-time carousel statistics:
  - Total slides
  - Active slides
  - Last update time
- Quick action buttons
- Recent slides display with delete functionality
- System status indicator

### Carousel Management
- **File**: `AdminCarouselImages.jsx`
- Upload carousel images with:
  - Title
  - Alt text
  - Display order
  - Image file
- Live preview
- Existing slides grid with delete option
- Direct MySQL integration

## 🔗 API Endpoints

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Get Carousel Images
```
GET /api/carousel-images
Response: Array of carousel image objects
```

#### Create Carousel Image
```
POST /api/carousel-images
Content-Type: multipart/form-data
Body:
  - title: string (required)
  - altText: string (optional)
  - displayOrder: number
  - image: file (required, png/jpg/jpeg/webp/gif)
```

#### Delete Carousel Image
```
DELETE /api/carousel-images/{id}
```

#### Health Check
```
GET /api/health
```

## 📊 Database Schema

### carousel_images Table
```sql
CREATE TABLE carousel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Feature Checklist

- ✅ Firebase Email/Password Authentication
- ✅ Google OAuth Login
- ✅ User Profile with Avatar/Initials
- ✅ Logout Dropdown Menu
- ✅ Cart Icon with Badge
- ✅ Admin Portal (Black/White/#007400 theme)
- ✅ Carousel Image Management
- ✅ MySQL Database Integration
- ✅ Live Carousel on Homepage
- ✅ Admin Dashboard with Stats
- ✅ Image Upload with Preview
- ✅ Responsive Design

## 🛠️ Technology Stack

### Frontend
- React 19
- React Router 7
- Tailwind CSS 4
- Firebase 12
- Vite

### Backend
- Python 3.8+
- Flask 3.0.3
- Flask-CORS 4.0.1
- mysql-connector-python 9.0.0

### Database
- MySQL (via XAMPP)

## 📝 Notes

- All images stored in `Backend/uploads/`
- Maximum file size: 8MB
- Allowed formats: PNG, JPG, JPEG, WebP, GIF
- Admin session auto-expires on logout
- Carousel auto-refreshes every 30 seconds in admin dashboard
- Homepage carousel rotates every 5 seconds

## 🔧 Troubleshooting

### CORS Errors
Backend CORS is enabled. If issues persist, ensure Flask is running and accessible.

### MySQL Connection Failed
- Verify XAMPP MySQL is running
- Check credentials in `Backend/app.py`
- Confirm `auronic_store` database exists

### Images Not Uploading
- Check `Backend/uploads/` folder exists and is writable
- Verify file size < 8MB
- Confirm file type is allowed

### Frontend API Errors
- Ensure backend is running on `http://localhost:5000`
- Update `FrontEnd/src/config/api.js` if backend URL changes

## 📧 Contact & Support

For issues or questions, refer to the individual SETUP.md files in Backend and Frontend directories.

---

**Version**: 1.0.0  
**Last Updated**: May 5, 2026  
**Theme**: Black, White & #007400
