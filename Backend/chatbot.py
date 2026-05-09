"""
Auronic E-commerce Chatbot Module - Semantic-enhanced
Uses sentence-transformers for semantic matching with a safe fallback.
"""

import re

class AuronicChatbot:
    def __init__(self):
        # Knowledge base with varied responses
        self.knowledge_base = {
            # Greetings
            "greeting": {
                "keywords": ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "sup"],
                "responses": [
                    "Hey there! 👋 Welcome to Auronic Support! I'm here to help you with anything about our products, orders, shipping, or payments. What can I do for you?",
                    "Hello! 😊 Welcome to Auronic! How can I assist you today?",
                    "Hi! 👋 Thanks for reaching out to Auronic. What would you like to know?"
                ]
            },
            # Products
            "products": {
                "keywords": ["product", "sell", "available", "category", "items", "shop", "range", "collection", "have you", "what do you"],
                "responses": [
                    "Welcome to Auronic! We offer a diverse range of premium products across multiple categories:\n\n📱 Electronics & Gadgets\n👟 Fashion & Accessories\n🏠 Home & Lifestyle\n💎 Premium Collections\n\nBrowse our Products section to explore everything, or let me know what you're looking for!",
                    "At Auronic, we have a carefully curated selection of quality products. We carry electronics, gadgets, fashion, accessories, and lifestyle items. Visit our Products page to see the full range!",
                    "We pride ourselves on offering a wide variety of products. Whether you're looking for tech, fashion, or home items, we've got you covered! What category interests you?"
                ]
            },
            # Price & Details
            "product_details": {
                "keywords": ["price", "cost", "specification", "detail", "color", "stock", "info", "how much", "what's the price", "variants"],
                "responses": [
                    "You can find detailed product information on each product page including:\n\n✓ Complete specifications\n✓ Available colors & sizes\n✓ Current pricing\n✓ Customer reviews\n✓ High-quality images\n\nVisit our Products section and click on any item to see all details!",
                    "Each product page shows you everything you need to know - price, specs, colors, sizes, reviews, and more. Use our search feature to find what you're looking for!",
                    "Product details including pricing, specifications, and availability are displayed on each product page. You can also filter by color, size, and price range to find exactly what you want!"
                ]
            },
            # Search
            "search_product": {
                "keywords": ["smartphone", "laptop", "headphone", "accessory", "brand", "find", "looking for", "search", "do you have"],
                "responses": [
                    "Great! We have a wide selection of products. Use our Search feature to find specific items, or browse by category. Our inventory includes popular brands and the latest products!",
                    "You can search for specific products using our search bar. We regularly update our inventory with new and trending items. What are you interested in?",
                    "We carry many popular brands and products. Use the search feature or browse categories to find what you need. Feel free to ask me for recommendations too!"
                ]
            },
            # Shipping
            "shipping": {
                "keywords": ["shipping", "delivery", "how long", "ship", "time", "days", "track", "when", "arrive", "express"],
                "responses": [
                    "📦 Our Shipping Information:\n\n⏱️ Standard Delivery: 3-7 business days\n🚚 Fast Shipping: 1-3 business days (select areas)\n📍 Free shipping on qualifying orders\n\n✓ Real-time tracking from your account\n✓ SMS/Email notifications\n✓ Secure packaging\n\nTrack your order anytime!",
                    "We offer reliable shipping with multiple options. Standard delivery takes 3-7 business days, and we also offer express delivery for faster service. You'll get tracking updates throughout the process!",
                    "Shipping is quick and reliable! Most orders arrive within 3-7 business days. You'll receive tracking information and can monitor your order status in real-time from your account."
                ]
            },
            # Delivery Areas
            "delivery_areas": {
                "keywords": ["deliver", "city", "area", "location", "where", "reach", "ship to", "international"],
                "responses": [
                    "🗺️ Delivery Coverage:\n\n✓ All major cities\n✓ Many regional areas\n✓ Express delivery in metros\n\nAt checkout, enter your city to see:\n- Available shipping options\n- Estimated delivery date\n- Shipping cost\n\nNot covered? Contact us!",
                    "We deliver across all major cities and many towns. The delivery options and timeframes depend on your location. You'll see all available options during checkout!",
                    "We have excellent coverage across the country. Enter your location at checkout to see our delivery options for your area. Most major cities have fast delivery available!"
                ]
            },
            # Orders
            "orders": {
                "keywords": ["order", "place", "buy", "checkout", "process", "how to order", "steps"],
                "responses": [
                    "🛒 Ordering at Auronic is Simple:\n\n1️⃣ Browse & add to cart\n2️⃣ Review cart\n3️⃣ Enter shipping details\n4️⃣ Choose payment method\n5️⃣ Place order\n6️⃣ Get confirmation\n\n✓ Guest checkout available\n✓ Save favorites\n✓ Track orders\n\nReady to order?",
                    "It's easy to order from Auronic! Just browse products, add them to your cart, proceed to checkout, provide your details, select a payment method, and confirm. You can order as a guest or create an account!",
                    "Placing an order is straightforward - browse, add to cart, checkout, and confirm! You'll receive instant confirmation and can track your order from your account."
                ]
            },
            # Returns
            "returns": {
                "keywords": ["return", "refund", "policy", "exchange", "satisfaction", "issue", "problem", "damaged", "not satisfied"],
                "responses": [
                    "✅ Our Return & Refund Policy:\n\n⏰ 30 days from delivery\n📋 Easy returns through your account\n💰 Full refund for eligible items\n🔄 Exchange options\n\nWe accept returns for:\n✓ Defective/damaged items\n✓ Wrong item received\n✓ Not as described\n\nStart a return in your account!",
                    "We stand behind our products! You can return items within 30 days of delivery if they're defective, wrong, or not as described. The process is simple - just go to your Orders section and initiate a return!",
                    "Not happy with your purchase? We offer hassle-free returns within 30 days. Whether it's damaged, wrong, or just not what you wanted, we'll help you return or exchange it!"
                ]
            },
            # Payment
            "payment": {
                "keywords": ["payment", "pay", "credit", "debit", "card", "cod", "cash", "secure", "method", "accept"],
                "responses": [
                    "💳 Payment Options:\n\n✓ Credit/Debit Cards\n✓ Cash on Delivery (COD)\n✓ Digital Wallets\n✓ Bank Transfers\n\n🔒 Security:\n✓ 256-bit SSL encryption\n✓ Secure gateway\n✓ Data protected\n\n✓ EMI available\n✓ Instant confirmation",
                    "We accept multiple payment methods including credit/debit cards, cash on delivery, and digital wallets. All payments are 100% secure with encryption and data protection!",
                    "Choose your preferred payment method at checkout - cards, COD, wallets, or bank transfer. Every transaction is secure and encrypted. Some items also offer interest-free EMI!"
                ]
            },
            # Discounts
            "discount": {
                "keywords": ["discount", "sale", "coupon", "promo", "offer", "deal", "code", "save", "special"],
                "responses": [
                    "🎉 Deals & Promotions:\n\n✓ Homepage for featured sales\n✓ Discounted Products section\n✓ Newsletter for exclusive offers\n✓ Flash sales on social media\n✓ Seasonal events\n\n💝 Programs:\n✓ Loyalty rewards\n✓ First-buy discounts\n✓ Bulk discounts\n✓ Referral bonuses",
                    "We have amazing deals! Check our homepage and Products section for current sales. Subscribe to our newsletter for exclusive offers and follow us for flash sales!",
                    "Looking for deals? We run regular promotions and seasonal sales. Sign up for our newsletter to get exclusive offers, and follow our social media for surprise flash sales!"
                ]
            },
            # Support
            "help": {
                "keywords": ["help", "support", "assist", "contact", "customer service", "need help", "issue", "problem"],
                "responses": [
                    "👋 I'm Here to Help!\n\nI can assist with:\n✓ Products & recommendations\n✓ Shipping & delivery\n✓ Order tracking\n✓ Returns & refunds\n✓ Payments\n\n📞 Need more help?\n• Chat support\n• Email us\n• Call hotline\n• Contact page",
                    "I'm happy to help! Whether you need information about products, shipping, orders, returns, or payments, I'm here. For complex issues, our support team is also available!",
                    "What do you need help with? I can answer questions about almost anything related to Auronic - products, orders, shipping, returns, or anything else!"
                ]
            },
            # Quality
            "quality": {
                "keywords": ["quality", "authentic", "genuine", "real", "original", "fake", "warranty"],
                "responses": [
                    "✅ Quality Guarantee:\n\n✓ 100% authentic products\n✓ Authorized distributors\n✓ Quality checked\n✓ Returns accepted\n✓ Warranty available\n\nYour satisfaction is guaranteed! If you're not happy, we'll refund or replace immediately!",
                    "All our products are 100% authentic and genuine. We source directly from authorized distributors and quality check everything before shipping. Your satisfaction is guaranteed!",
                    "We guarantee genuine, authentic products. Everything is verified before shipping. If you ever receive a defective or unsatisfactory item, we'll replace or refund it right away!"
                ]
            },
            # Thanks
            "thanks": {
                "keywords": ["thank", "thanks", "thank you", "appreciate", "grateful"],
                "responses": [
                    "You're welcome! 😊 If you have any other questions about Auronic, feel free to ask anytime!",
                    "My pleasure! Thanks for shopping with Auronic. We appreciate your business!",
                    "Always happy to help! 👋 Feel free to reach out if you need anything else!"
                ]
            },
        }

        # Try to enable semantic matching using sentence-transformers.
        # If unavailable, fall back to the existing rule-based matching.
        try:
            from sentence_transformers import SentenceTransformer

            self._st_model = SentenceTransformer('all-MiniLM-L6-v2')
            self.semantic_enabled = True

            # Prepare a representative text for each category and compute embeddings
            self._category_texts = {}
            for cat, data in self.knowledge_base.items():
                keywords = data.get('keywords', [])
                response_snip = (data.get('responses') or [''])[0]
                rep = ' '.join(keywords) + ' ' + response_snip
                self._category_texts[cat] = rep

            texts = [t for _, t in sorted(self._category_texts.items())]
            embeddings = self._st_model.encode(texts)

            # Map embeddings back to categories
            self._category_embeddings = {}
            for (cat, _), emb in zip(sorted(self._category_texts.items()), embeddings):
                self._category_embeddings[cat] = emb.tolist() if hasattr(emb, 'tolist') else emb

        except Exception:
            self.semantic_enabled = False

    def _normalize_text(self, text):
        """Normalize user text for more reliable matching."""
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _tokenize(self, text):
        """Split normalized text into tokens."""
        normalized = self._normalize_text(text)
        if not normalized:
            return []
        return [tok for tok in normalized.split(" ") if tok]

    def _keyword_score(self, user_text, keyword):
        """Score how strongly a keyword/phrase matches user text."""
        user_norm = self._normalize_text(user_text)
        kw_norm = self._normalize_text(keyword)
        if not user_norm or not kw_norm:
            return 0.0

        # Strong signal: full phrase exists
        if kw_norm in user_norm:
            return 1.0

        user_tokens = set(self._tokenize(user_norm))
        kw_tokens = [k for k in kw_norm.split(" ") if k]
        if not kw_tokens:
            return 0.0

        overlap = sum(1 for t in kw_tokens if t in user_tokens)
        if overlap == 0:
            return 0.0
        return overlap / len(kw_tokens)

    def _get_ranked_matches(self, user_input):
        """Return ranked categories with lexical confidence scores."""
        ranked = []
        for category, data in self.knowledge_base.items():
            keywords = data.get("keywords", [])
            if not keywords:
                continue

            scores = [self._keyword_score(user_input, kw) for kw in keywords]
            max_score = max(scores) if scores else 0.0
            coverage = sum(1 for s in scores if s >= 0.6) / max(1, len(scores))

            # Blend strong single-hit with overall category coverage
            final_score = (max_score * 0.8) + (coverage * 0.2)
            if final_score >= 0.35:
                ranked.append((category, final_score))

        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked

    def _extract_order_id(self, user_input):
        """Extract probable order id from text if present."""
        text = user_input or ""
        # Accept forms like ORD12345, #12345, 12345
        patterns = [
            r"\b(ord[-_\s]*\d{3,})\b",
            r"#(\d{3,})\b",
            r"\b(\d{5,})\b",
        ]
        for p in patterns:
            m = re.search(p, text, flags=re.IGNORECASE)
            if m:
                return m.group(1).upper()
        return None

    def _build_contextual_response(self, user_input):
        """Handle common complete-question intents with actionable responses."""
        text = self._normalize_text(user_input)

        if ("track" in text and "order" in text) or ("tracking" in text and "order" in text):
            order_id = self._extract_order_id(user_input)
            if order_id:
                return (
                    f"I can help with order tracking. Please open My Orders and search for Order #{order_id}. "
                    "You will see the current status, expected delivery date, and shipment updates there. "
                    "If the status has not updated for 24+ hours, contact support and share the order ID."
                )
            return (
                "I can help you track your order. Please share your Order ID (for example: ORD12345), "
                "then I can guide you with exact tracking steps."
            )

        if "shipping" in text and ("option" in text or "method" in text):
            return (
                "Auronic shipping options are:\n"
                "1) Standard Delivery: 3-7 business days\n"
                "2) Fast Delivery: 1-3 business days (selected areas)\n"
                "3) Free shipping on qualifying orders\n"
                "Exact charges and ETA are shown at checkout based on your city."
            )

        if "return" in text and ("policy" in text or "refund" in text or "exchange" in text):
            return (
                "Auronic return policy: returns are accepted within 30 days of delivery for eligible items. "
                "You can request return/exchange from My Orders. Refund is processed after item inspection. "
                "For damaged or wrong items, please submit request as soon as possible with photos."
            )

        if "payment" in text or "cod" in text or "card" in text:
            return (
                "Auronic supports Credit/Debit Cards, Cash on Delivery (where available), Digital Wallets, "
                "and Bank Transfer. Payment availability can vary by location and order value at checkout."
            )

        return None

    def _cosine_sim(self, a, b):
        """Compute cosine similarity between two vectors (lists)."""
        import math
        if a is None or b is None:
            return -1.0
        dot = 0.0
        na = 0.0
        nb = 0.0
        for x, y in zip(a, b):
            dot += x * y
            na += x * x
            nb += y * y
        if na == 0.0 or nb == 0.0:
            return -1.0
        return dot / (math.sqrt(na) * math.sqrt(nb))

    def _semantic_match(self, user_input):
        """Return best matching category using semantic embeddings."""
        try:
            vec = self._st_model.encode([user_input])[0]
            vec = vec.tolist() if hasattr(vec, 'tolist') else vec
            best_cat = None
            best_score = -1.0
            for cat, emb in self._category_embeddings.items():
                score = self._cosine_sim(vec, emb)
                if score > best_score:
                    best_score = score
                    best_cat = cat
            # require a minimum similarity to accept semantic match
            if best_score >= 0.45:
                return best_cat
            return None
        except Exception:
            return None

    def _get_best_match(self, user_input):
        """Find the best matching category for user input"""
        # If semantic matching possible, prefer it for paraphrased questions
        if getattr(self, 'semantic_enabled', False):
            sem = self._semantic_match(user_input)
            if sem:
                return sem

        ranked = self._get_ranked_matches(user_input)
        return ranked[0][0] if ranked else None

    def get_response(self, user_input):
        """Get chatbot response"""
        if not user_input.strip():
            return "Hello! How can I help you today? Ask me about products, shipping, orders, returns, payments, or anything else about Auronic!"
        try:
            contextual = self._build_contextual_response(user_input)
            if contextual:
                return contextual

            ranked = self._get_ranked_matches(user_input)

            # If user asked multiple things, respond with combined concise sections
            if len(ranked) >= 2 and ranked[0][1] >= 0.45 and ranked[1][1] >= 0.4:
                top_two = [ranked[0][0], ranked[1][0]]
                parts = []
                for cat in top_two:
                    responses = self.knowledge_base.get(cat, {}).get("responses", [])
                    if responses:
                        parts.append(f"{cat.replace('_', ' ').title()}: {responses[0]}")
                if parts:
                    return "\n\n".join(parts)

            best_match = self._get_best_match(user_input)
            if best_match:
                responses = self.knowledge_base[best_match].get("responses", [])
                if responses:
                    return responses[0]
            return (
                "I want to answer this correctly. Please share a little more detail (for example order ID, "
                "product name, or city), and I will give you an exact answer."
            )
        except Exception:
            return "I encountered a small issue. Please try asking again or contact our support team!"

    def validate_topic(self, user_input):
        """Check if input is related to Auronic"""
        # Semantic signal if available
        if getattr(self, 'semantic_enabled', False) and self._semantic_match(user_input):
            return True

        # Lexical ranking signal
        ranked = self._get_ranked_matches(user_input)
        if ranked and ranked[0][1] >= 0.35:
            return True

        # Fallback support for Roman Urdu / short user intents
        fallback_keywords = [
            'order', 'track', 'tracking', 'delivery', 'shipping', 'return', 'refund',
            'payment', 'price', 'product', 'cart', 'checkout', 'auronic', 'support',
            'madad', 'qeemat', 'wapsi', 'saman', 'parcel'
        ]
        user_lower = self._normalize_text(user_input)
        return any(k in user_lower for k in fallback_keywords)


# Initialize chatbot
chatbot = AuronicChatbot()
