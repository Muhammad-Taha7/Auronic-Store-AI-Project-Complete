# System Integration Checklist & Testing Guide

## ✅ Pre-Launch Verification

### Database Setup
- [ ] XAMPP MySQL is running on port 3306
- [ ] Database `auronic_store` created
- [ ] Table `carousel_images` created with proper schema
- [ ] Test connection: `mysql -u root -p auronic_store`

### Backend Flask API
- [ ] Python 3.8+ installed
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Flask app starts: `python app.py`
- [ ] API accessible at `http://localhost:5000`
- [ ] Health endpoint works: `http://localhost:5000/api/health`
- [ ] CORS enabled for all routes

### Frontend React App
- [ ] Node.js and npm installed
- [ ] Dependencies installed: `npm install`
- [ ] Dev server starts: `npm run dev`
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] No build errors in console

### Folder Structure
- [ ] `Backend/uploads/` folder exists
- [ ] Folder is writable for image uploads
- [ ] `.gitignore` excludes uploads if needed

## 🧪 Feature Testing

### 1. Authentication Flow
- [ ] Navigate to `/login`
- [ ] Enter email and password
- [ ] Successfully creates account
- [ ] Login with valid credentials works
- [ ] Google OAuth button appears
- [ ] Logout removes user session

### 2. Navbar Integration
- [ ] User avatar shows after login
- [ ] Avatar dropdown displays user info
- [ ] Logout button in dropdown works
- [ ] Cart icon displays on navbar
- [ ] Cart badge shows "0"
- [ ] Cart icon clickable opens drawer

### 3. Admin Portal
- [ ] Navigate to `/admin/login`
- [ ] Login with: Username `Taha`, Password `password.11`
- [ ] Redirects to admin dashboard
- [ ] Dashboard loads carousel stats
- [ ] Sidebar shows only 2 options:
  - Dashboard
  - Add Carousel Images
- [ ] Theme is Black/White with #007400 accents

### 4. Carousel Management
- [ ] Navigate to `/admin/carousel-images`
- [ ] Form appears with fields:
  - Title
  - Alt Text
  - Display Order
  - Image upload
- [ ] Image preview works
- [ ] Upload with all fields works
- [ ] Image appears in "Existing Slides"
- [ ] Delete button removes slide

### 5. Homepage Carousel
- [ ] Navigate to `/`
- [ ] Carousel displays uploaded images
- [ ] Auto-rotates every 5 seconds
- [ ] Slide indicators appear
- [ ] Click indicator changes slide
- [ ] Slide title displays correctly

### 6. Dashboard Statistics
- [ ] Total Slides count updates
- [ ] Active Slides count matches database
- [ ] Last Updated timestamp correct
- [ ] Recent slides list shows latest uploads
- [ ] Delete from dashboard works

## 🔌 API Testing

### Test with cURL or Postman

#### Get All Images
```bash
curl http://localhost:5000/api/carousel-images
```
Expected: JSON array of carousel images

#### Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status": "ok", "time": "ISO-timestamp"}`

#### Upload Image
```bash
curl -X POST http://localhost:5000/api/carousel-images \
  -F "title=Summer Collection" \
  -F "altText=Beautiful summer fashion" \
  -F "displayOrder=1" \
  -F "image=@/path/to/image.jpg"
```
Expected: `{"message": "Carousel image saved successfully."}`

#### Delete Image
```bash
curl -X DELETE http://localhost:5000/api/carousel-images/1
```
Expected: `{"message": "Carousel image deleted."}`

## 🎨 Theme Verification

Verify color scheme throughout app:
- [ ] Black (#000000) - Primary backgrounds
- [ ] White (#FFFFFF) - Secondary backgrounds
- [ ] #007400 - Green accent buttons
- [ ] Admin dashboard uses these colors consistently
- [ ] Login pages follow theme
- [ ] Hover states visible

## 📱 Responsive Design

### Mobile View (< 768px)
- [ ] Navbar collapses to hamburger menu
- [ ] Cart drawer slides in from right
- [ ] Login page stacks properly
- [ ] Carousel displays full width
- [ ] Dashboard grid responsive

### Tablet View (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] All features accessible
- [ ] No overflow or cut-off elements

### Desktop View (> 1024px)
- [ ] Sidebar fully visible
- [ ] Grid layouts optimal
- [ ] Multi-column content displays

## 🚨 Error Handling

- [ ] Invalid MySQL credentials show error
- [ ] Failed API requests show message
- [ ] File upload errors display (size, format)
- [ ] Network disconnection handled gracefully
- [ ] 404 pages shown for invalid routes

## ⚡ Performance

- [ ] Page loads < 3 seconds
- [ ] Dashboard stats load quickly
- [ ] Image uploads feel responsive
- [ ] Carousel transition smooth
- [ ] No console errors

## 🔒 Security

- [ ] Admin session token stored securely
- [ ] Firebase credentials not exposed
- [ ] CORS properly configured
- [ ] File uploads sanitized
- [ ] SQL injection not possible (parameterized queries)

## 📋 Final Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Responsive on all devices
- [ ] Theme colors consistent
- [ ] Database syncing properly
- [ ] Frontend-Backend communication working
- [ ] Ready for production

## 🎬 Launch Command Sequence

### Terminal 1 - MySQL
```bash
# Start XAMPP
# OR on command line:
mysql --user=root --password auronic_store
```

### Terminal 2 - Backend
```bash
cd Backend
python app.py
```

### Terminal 3 - Frontend
```bash
cd FrontEnd
npm run dev
```

### Then
- Open `http://localhost:5173` in browser
- Test all features
- Check admin portal
- Upload carousel images
- Verify homepage carousel

---

**Status**: Ready for testing  
**Date**: May 5, 2026  
**Theme**: Black, White & #007400
