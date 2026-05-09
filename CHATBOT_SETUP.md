# Auronic E-commerce Chatbot Setup Guide

## Overview
This guide explains how to set up and run the new AI-powered chatbot for your Auronic e-commerce system.

## Files Created/Modified

### Backend Files:
1. **`Backend/chatbot.py`** - NLP chatbot module using TF-IDF vectorization
2. **`Backend/requirements.txt`** - Updated with new Python dependencies
3. **`Backend/app.py`** - Added `/api/chatbot` endpoint

### Frontend Files:
1. **`src/Components/AuronicChatbot.jsx`** - React chatbot component
2. **`src/Components/AuronicChatbot.css`** - Modern glassmorphism styling
3. **`src/App.jsx`** - Integrated chatbot component

---

## Installation Steps

### 1. Install Python Dependencies

```bash
cd Frontend/Backend
pip install -r requirements.txt
```

**New packages added:**
- `nltk` - Natural Language Toolkit
- `scikit-learn` - Machine learning library for NLP
- `numpy` - Numerical computing
- `requests` - HTTP library

### 2. Start the Backend Server

```bash
cd Frontend/Backend
python app.py
```

The Flask server will run on `http://localhost:5000`

### 3. Start the Frontend Development Server

```bash
cd Frontend
npm install
npm run dev
```

The React app will run on `http://localhost:5173` (or your configured port)

---

## Features

### Chatbot Capabilities
The chatbot can answer questions about:

✅ **Product Inquiries**
- Product availability
- Pricing and specifications
- Category information

✅ **Shipping & Delivery**
- Shipping times and methods
- Delivery areas
- Real-time order tracking

✅ **Orders & Payments**
- How to place orders
- Payment methods accepted
- Order process

✅ **Returns & Refunds**
- Return policy
- Refund procedures
- Return timeframes

✅ **General FAQs**
- Discounts and promotions
- Customer support
- General store information

### Design Features
- **Glassmorphism UI** - Modern, frosted glass effect with backdrop blur
- **Bottom-right positioning** - Fixed position on all pages
- **Responsive Design** - Works on desktop and mobile
- **Real-time messaging** - Smooth animations and typing indicators
- **Quick Questions** - Suggested popular questions for new users
- **Message timestamps** - Shows when each message was sent

---

## How the Chatbot Works

### 1. Message Processing
User input → TF-IDF vectorization → Cosine similarity matching

### 2. Knowledge Base
The chatbot has a comprehensive knowledge base of ~30 predefined questions covering:
- Product inquiries
- Shipping information
- Order processing
- Returns and refunds
- Payment methods
- Discounts and promotions

### 3. Response Generation
- Matches user input to the most similar question in the knowledge base
- Returns appropriate response if similarity > 30%
- Otherwise, redirects to customer support

### 4. Topic Validation
- Checks if user query is related to e-commerce
- If not related, prompts user to ask about store-related topics

---

## API Endpoint

### POST `/api/chatbot`

**Request:**
```json
{
  "message": "How long does shipping take?"
}
```

**Response:**
```json
{
  "message": "We offer fast and reliable shipping! Delivery typically takes 3-7 business days depending on your location...",
  "timestamp": "2024-05-06T10:30:00.000Z"
}
```

---

## Customization Guide

### 1. Add New Questions/Responses

Edit `Backend/chatbot.py` - Add to `self.knowledge_base`:

```python
"new_category": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
]
```

And add response in `self.responses`:

```python
"new_category": "Your response here..."
```

### 2. Modify Styling

Edit `src/Components/AuronicChatbot.css`:
- Change gradient colors (currently purple/blue)
- Adjust window size/position
- Modify animation timings
- Customize fonts and spacing

### 3. Change Colors

Primary gradient: `#667eea` (purple) and `#764ba2` (darker purple)

Replace these hex codes throughout the CSS to customize.

---

## Troubleshooting

### Issue: Chatbot not responding
**Solution:**
1. Ensure backend server is running on port 5000
2. Check browser console for network errors
3. Verify CORS is enabled in Flask (already configured)

### Issue: Module not found error
**Solution:**
```bash
pip install -r requirements.txt
# If issues persist, install individually:
pip install nltk scikit-learn numpy requests
```

### Issue: Port 5000 already in use
**Solution:**
Modify the Flask port in `Backend/app.py`:
```python
app.run(debug=True, host="0.0.0.0", port=5001)  # Change to 5001
```

And update API URL in `src/Components/AuronicChatbot.jsx`:
```javascript
fetch('http://localhost:5001/api/chatbot', ...)
```

---

## Performance Notes

- **First response may take 2-3 seconds** while TF-IDF models load
- **Subsequent responses are instant** (< 100ms)
- **Vectorization happens only once** at startup (optimized)

---

## Future Enhancements

You can extend the chatbot with:
- 🤖 Integration with ChatGPT/OpenAI API
- 💾 Database of FAQs for dynamic knowledge base
- 📊 Analytics on popular questions
- 🌐 Multi-language support
- 🔗 Integration with order system for tracking
- 🧠 Machine learning model training on real conversations

---

## Support

For issues or questions about the chatbot:
1. Check the troubleshooting section
2. Review the API endpoint documentation
3. Check browser console for errors
4. Check terminal logs for backend errors

---

**Created: May 2024**
**Component: Auronic E-commerce Chatbot v1.0**
