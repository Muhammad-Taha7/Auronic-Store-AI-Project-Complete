# 🔧 Python Backend - مکمل وضاحت

## 📋 Backend کا مقصد
Auronic ای کامرس سٹور کے لیے **REST API** فراہم کرنا جو React Frontend کو ڈیٹا دیتا ہے۔

---

## 🏗️ Backend کی ساخت

```
Backend/
├── app.py           ← Flask سرور (Main)
├── chatbot.py       ← کیوٹ بات کرنے والا AI
├── requirements.txt ← Python dependencies
├── uploads/         ← تصاویر محفوظ کرنے کی جگہ
└── .env            ← Database connection info (ترتیبات)
```

---

## 🗄️ DATABASE - 4 اہم ٹیبلز

### 1️⃣ **carousel_images** - ہوم پیج کی بڑی تصاویر
```
id (PRIMARY KEY)
title              → تصویر کا نام
image_path         → تصویر کی فائل
alt_text          → تصویر کی تفصیل
display_order     → ترتیب (کون سی تصویر پہلے آئے)
is_active         → فعال ہے یا نہیں؟
created_at        → بنانے کا وقت
```

### 2️⃣ **products** - پروڈکٹس کا تمام ڈیٹا
```
id
title             → پروڈکٹ کا نام
description       → تفصیل
price             → موجودہ قیمت
original_price    → اصل قیمت (discount کے لیے)
category          → زمرہ (Electronics, Fashion وغیرہ)
badge             → ٹیگ ("Sale", "New", "Trending")
cover_image       → مرکزی تصویر
gallery_images    → مزید تصاویر (JSON array)
colors            → دستیاب رنگ (JSON)
warranty_options  → وارنٹی کے اختیارات
highlights        → خصوصیات
rating            → ستاروں کی تعداد (1-5)
is_trending       → Trending میں ہے؟
is_active         → فروخت میں ہے؟
display_order     → ہوم پیج پر ترتیب
```

### 3️⃣ **customer_orders** - کسٹمر کے آرڈرز
```
id
order_number      → "ORD-20250506-123456-ABC12" (منفرد نمبر)
customer_name     → کسٹمر کا نام
customer_email    → ای میل
customer_phone    → فون نمبر
shipping_address  → پتہ
city              → شہر
notes             → خصوصی نوٹ
payment_method    → "COD" یا "CARD"
status            → "pending" / "completed" / "cancelled"
subtotal          → کل (shipping سے پہلے)
shipping_fee      → ڈیلیوری کا خرچ
total             → آخری رقم
items_json        → پروڈکٹس کی تفصیلات (JSON)
user_uid          → Firebase سے user کی ID
created_at        → آرڈر کا وقت
updated_at        → آخری تبدیلی
```

### 4️⃣ **contacts** - کسٹمرز کے سوالات
```
id
name              → نام
email             → ای میل
phone             → فون
subject           → موضوع
message           → پیغام
is_read           → پڑھ لیا؟
created_at        → بھیجنے کا وقت
```

### 5️⃣ **blogs** - بلاگ پوسٹس
```
id
title             → بلاگ کا عنوان
description       → خلاصہ
content           → پوری تفصیل
image_url         → بلاگ کی تصویر
is_active         → شائع ہے؟
created_at        → بنانے کا وقت
```

---

## 🔌 API ENDPOINTS - کون سے کام کرتے ہیں

### 🖼️ **CAROUSEL (ہوم پیج کی بڑی تصاویر)**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/carousel-images` | تمام تصاویر حاصل کریں |
| POST | `/api/carousel-images` | نئی تصویر شامل کریں (Admin) |
| PUT | `/api/carousel-images/<id>` | تصویر میں تبدیلی (Admin) |
| DELETE | `/api/carousel-images/<id>` | تصویر حذف کریں (Admin) |

**مثال - تصاویر حاصل کریں:**
```javascript
fetch('http://localhost:5000/api/carousel-images')
  .then(res => res.json())
  .then(data => console.log(data))
// جواب: [{id: 1, title: "...", imageUrl: "...", ...}]
```

---

### 🛍️ **PRODUCTS (اشیاء)**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/products` | تمام اشیاء |
| GET | `/api/products?trending=1` | صرف Trending اشیاء |
| GET | `/api/products/<id>` | ایک شے کی تفصیل |
| POST | `/api/products` | نئی شے شامل کریں (Admin) |
| PUT | `/api/products/<id>` | شے میں تبدیلی (Admin) |
| DELETE | `/api/products/<id>` | شے حذف کریں (Admin) |

**مثال - اشیاء حاصل کریں:**
```javascript
// تمام اشیاء
fetch('http://localhost:5000/api/products')

// صرف Trending اشیاء
fetch('http://localhost:5000/api/products?trending=1')

// ایک خاص شے (ID = 5)
fetch('http://localhost:5000/api/products/5')
```

---

### 📦 **ORDERS (آرڈرز)**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/orders` | تمام آرڈرز (Admin) |
| GET | `/api/orders?userEmail=ali@gmail.com` | کسی کے آرڈرز |
| POST | `/api/orders` | نیا آرڈر بنائیں |
| PUT | `/api/orders/<id>/status` | آرڈر کی حالت تبدیل کریں |
| DELETE | `/api/orders/history?userEmail=...` | آرڈر حذف کریں |
| GET | `/api/orders/<id>/download` | آرڈر کی رسید ڈاؤن لوڈ کریں |
| GET | `/api/orders/analytics` | فروخت کے اعدادوشمار |

**مثال - نیا آرڈر بنائیں:**
```javascript
const orderData = {
  customerName: "احمد علی",
  customerEmail: "ahmad@gmail.com",
  customerPhone: "03001234567",
  shippingAddress: "123 بروڈ سٹریٹ",
  city: "کراچی",
  paymentMethod: "COD",
  items: [
    {
      productId: 5,
      title: "موبائل فون",
      price: 50000,
      quantity: 1,
      selectedColor: "سیاہ",
      selectedWarranty: "2 سال"
    }
  ],
  subtotal: 50000,
  shippingFee: 500,
  total: 50500
};

fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})
.then(res => res.json())
.then(data => console.log(data))
// جواب: {message: "Order placed successfully.", orderId: 123, orderNumber: "ORD-..."}
```

---

### 📞 **CONTACTS (سوالات)**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/contacts` | تمام سوالات (Admin) |
| POST | `/api/contacts` | نیا سوال بھیجیں |
| DELETE | `/api/contacts/<id>` | سوال حذف کریں |

**مثال - سوال بھیجیں:**
```javascript
const message = {
  name: "علی",
  email: "ali@gmail.com",
  phone: "03001234567",
  subject: "شحنہ",
  message: "آپ کے پاس Samsung ہے؟"
};

fetch('http://localhost:5000/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(message)
})
```

---

### 📝 **BLOGS (بلاگ)**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/blogs` | تمام بلاگز |
| GET | `/api/blogs/<id>` | ایک بلاگ |
| POST | `/api/blogs` | نیا بلاگ لکھیں (Admin) |
| PUT | `/api/blogs/<id>` | بلاگ میں تبدیلی (Admin) |
| DELETE | `/api/blogs/<id>` | بلاگ حذف کریں (Admin) |

---

### 💬 **CHATBOT (کیوٹ بات کرنے والا)**

| Method | URL | کام |
|--------|-----|------|
| POST | `/api/chatbot` | کیوٹ سے سوال کریں |

**مثال - کیوٹ سے سوال:**
```javascript
const question = {
  message: "آپ کے پاس کیا پروڈکٹ ہیں؟"
};

fetch('http://localhost:5000/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(question)
})
.then(res => res.json())
.then(data => console.log(data.message))
// جواب: "Welcome to Auronic! We offer a diverse range of premium products..."
```

---

### ⚕️ **HEALTH CHECK**

| Method | URL | کام |
|--------|-----|------|
| GET | `/api/health` | کیا سرور چل رہا ہے؟ |

---

## 🤖 CHATBOT - کیسے کام کرتا ہے

**فائل:** `Backend/chatbot.py`

### کیوٹ کیا جانتا ہے؟

کیوٹ **13 زمرہ جات** میں جواب دیتا ہے:

1. **greeting** - "ہیلو", "السلام علیکم"
2. **products** - "آپ کے پاس کیا ہے؟"
3. **product_details** - "قیمت؟", "رنگ؟"
4. **search_product** - "میرے پاس Samsung ہے؟"
5. **shipping** - "ڈیلیوری کتنے دن میں؟"
6. **delivery_areas** - "کراچی میں ڈیلیور کرتے ہو؟"
7. **orders** - "آرڈر کیسے دوں؟"
8. **returns** - "واپسی کی پالیسی؟"
9. **payment** - "کیسے ادا کریں؟"
10. **discount** - "ڈسکاؤنٹ ہے؟"
11. **help** - "مدد کریں"
12. **thanks** - "شکریہ"
13. **quality** - "اصل تو ہے؟"

### کیسے جواب دیتا ہے؟

```python
class AuronicChatbot:
    def _get_best_match(self, user_input):
        # 1. استفسار میں کلیدی الفاظ تلاش کریں
        # 2. ہر زمرہ کے لیے سکور کا حساب لگائیں
        # 3. سب سے بہتر زمرہ تلاش کریں
        return best_match
    
    def get_response(self, user_input):
        # 1. بہترین زمرہ تلاش کریں
        # 2. اس زمرہ کا جواب بھیجیں
        return response

    def validate_topic(self, user_input):
        # کیا یہ سوال Auronic سے متعلق ہے؟
        # ہاں تو جواب دو، نہیں تو عام پیغام بھیج
        return True/False
```

---

## 🚀 سب کچھ کیسے کام کرتا ہے

### مثال 1: **پروڈکٹ دیکھنا**

```
1. Frontend میں صارف ہوم پیج کھولتا ہے
2. React کوڈ بھیجتا ہے: GET /api/products
3. Flask سرور MySQL سے ڈیٹا حاصل کرتا ہے
4. تصاویر اور معلومات React کو بھیجتا ہے
5. صارف کو تصاویر اور قیمتیں نظر آتی ہیں ✅
```

### مثال 2: **آرڈر دینا**

```
1. صارف "خرید" بٹن دبتا ہے
2. React سرور کو بھیجتا ہے: POST /api/orders
3. Flask ڈیٹا بیس میں ریکارڈ بناتا ہے
4. آرڈر نمبر واپس کرتا ہے: "ORD-20250506-..."
5. صارف کو تصدیق میل آتی ہے ✅
```

### مثال 3: **کیوٹ سے سوال**

```
1. صارف کیوٹ میں لکھتا ہے: "ڈیلیوری کتنی ہے؟"
2. React بھیجتا ہے: POST /api/chatbot
3. chatbot.py میں:
   - "ڈیلیوری", "کتنی" کلیدی الفاظ تلاش کرتا ہے
   - "shipping" زمرہ کا سکور بہتر ہے
   - shipping کا جواب بھیجتا ہے
4. کیوٹ کا جواب نظر آتا ہے ✅
```

---

## 📁 اہم فائلوں کی تفصیل

### `app.py` - Main سرور
```python
# شروعات
from flask import Flask
from chatbot import chatbot
from mysql.connector import connect

app = Flask(__name__)

# تمام ڈیٹابیس ٹیبل بنائیں
ensure_table()

# سرور چلائیں
app.run(port=5000)
```

### `chatbot.py` - ذہین کیوٹ
```python
class AuronicChatbot:
    def __init__(self):
        # 13 زمرہ جات میں جوابات
        self.knowledge_base = {
            "greeting": {...},
            "products": {...},
            # وغیرہ
        }
    
    def get_response(self, user_input):
        # سب سے بہتر زمرہ تلاش کریں
        # اس کا جواب بھیجیں
        pass
```

### `requirements.txt` - ضروری پروگرام
```
Flask==3.0.3                 ← ویب سرور
Flask-Cors==4.0.1           ← Frontend کو کال دینے دیں
mysql-connector-python==9.0.0 ← ڈیٹابیس سے جڑنا
python-dotenv==1.0.1        ← .env فائل پڑھنا
```

---

## 🔐 حفاظت اور معلومات

### صارف کی معلومات
- ای میل lowercase میں محفوظ کی جاتی ہے (غلطیوں سے بچنے)
- فون نمبر صحیح تدوین کے ساتھ محفوظ
- پاس ورڈ **نہیں** رکھے جاتے (Firebase سے آتی ہے)

### فائلیں
- تصاویر `/uploads` فولڈر میں محفوظ ہوتی ہیں
- ہر فائل کو منفرد نام دیا جاتا ہے
- صرف PNG, JPG, JPEG, WEBP, GIF قبول

### ڈیٹابیس
- MySQL 3306 پورٹ پر چلتا ہے
- `.env` فائل میں credentials رکھے ہوتے ہیں
- ہر query محفوظ ہے (SQL injection سے)

---

## ⚠️ عام مسائل اور حل

### مسئلہ: "Cannot connect to database"
**حل:**
```bash
# .env فائل میں یہ شامل کریں:
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=auronic_store
MYSQL_PORT=3306
```

### مسئلہ: "CORS error"
**حل:** Flask میں CORS فعال ہے - کوئی مسئلہ نہیں

### مسئلہ: "تصاویر نہیں دکھ رہی"
**حل:** `/uploads` فولڈر بنائیں یا ہر تصویر کے لیے مکمل URL استعمال کریں

---

## 📊 Analytics - فروخت کے اعدادوشمار

Endpoint: `GET /api/orders/analytics`

جواب میں یہ معلومات:
```json
{
  "totalOrders": 45,           // کل آرڈرز
  "completedOrders": 40,       // مکمل شدہ
  "pendingOrders": 3,          // زیرِ التوا
  "cancelledOrders": 2,        // منسوخ شدہ
  "totalRevenue": 2250000,     // کل رقم
  "revenueLost": 100000,       // منسوخ شدہ سے خسارہ
  "successRate": 88.89,        // کامیابی کا فیصد
  "avgOrderValue": 56250,      // اوسط آرڈر
  "monthlyRevenue": [...],     // ہر ماہ کی رقم
  "monthlyOrders": [...]       // ہر ماہ کے آرڈرز
}
```

---

## 🎯 خلاصہ

| حصہ | کام |
|------|------|
| **Database** | تمام ڈیٹا محفوظ کرنا |
| **API** | Frontend کو ڈیٹا دینا |
| **Chatbot** | کسٹمرز کے سوالات کے جوابات |
| **File Upload** | تصاویر محفوظ کرنا |
| **Analytics** | فروخت کے اعدادوشمار |

یہ سب مل کر **Auronic سٹور** کو چلاتے ہیں! 🚀
