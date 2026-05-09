"""
Chatbot API - کیوٹ سے سوال کریں
"""
from datetime import datetime
from flask import Blueprint, jsonify, request
from chatbot import chatbot

chatbot_bp = Blueprint('chatbot_api', __name__, url_prefix='/api/chatbot')


@chatbot_bp.post("")
def chatbot_endpoint():
    """
    کیوٹ سے سوال کریں
    Message: صارف کا سوال
    """
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # چیک کریں کہ سوال Auronic سے متعلق ہے یا نہیں؟
        if not chatbot.validate_topic(user_message):
            response = "میں Auronic ای کامرس سے متعلق سوالات میں مدد دے سکتا ہوں۔ براہ کرم پروڈکٹس، آرڈرز، ڈیلیوری، رٹرن یا دیگر سٹور سے متعلق سوالات پوچھیں۔"
        else:
            # کیوٹ کا جواب حاصل کریں
            response = chatbot.get_response(user_message)
        
        return jsonify({
            "message": response,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
