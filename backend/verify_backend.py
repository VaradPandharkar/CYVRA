import sys
from services import ai_service

def test_url_scanning():
    print("Testing URL scan logic...")
    
    # Test safe domain
    safe_res = ai_service.analyze_url("https://google.com")
    assert safe_res["risk_level"] == "Safe", f"Expected Safe for google.com, got {safe_res['risk_level']}"
    assert safe_res["score"] >= 80, f"Expected high score, got {safe_res['score']}"
    
    # Test HTTP link
    http_res = ai_service.analyze_url("http://unknown-domain.xyz")
    assert http_res["risk_level"] in ["Suspicious", "Dangerous"], f"Expected Suspicious/Dangerous for http domain, got {http_res['risk_level']}"
    assert "Unencrypted connection" in http_res["indicators"] or http_res["ssl_status"] == "Missing (HTTP is unencrypted)"
    
    # Test lookalike phishing brand link
    bad_res = ai_service.analyze_url("http://paypa1-update-security-login.xyz")
    assert bad_res["risk_level"] == "Dangerous", f"Expected Dangerous for lookalike domain, got {bad_res['risk_level']}"
    assert bad_res["score"] < 50
    assert any("lookalike" in ind.lower() or "typosquatting" in rec.lower() for ind in bad_res["indicators"] for rec in bad_res["recommendations"])

    print("[OK] URL scanning tests passed!")

def test_message_scanning():
    print("Testing message scan logic...")
    
    # Test clean message
    safe_msg = ai_service.analyze_message("Hey, are we still meeting up for coffee tomorrow at 10 AM?")
    assert safe_msg["classification"] == "Safe"
    assert safe_msg["risk_level"] == "Safe"
    assert len(safe_msg["keywords"]) == 0
    
    # Test lottery win scam
    fraud_msg = ai_service.analyze_message("CONGRATULATIONS! You have won the national lottery of $1,000,000. Claim your prize immediately by calling us!")
    assert fraud_msg["classification"] == "Fraud"
    assert fraud_msg["risk_level"] == "Dangerous"
    assert "congratulations" in [k.lower() for k in fraud_msg["keywords"]]
    assert "prize" in [k.lower() for k in fraud_msg["keywords"]]
    
    # Test credential phishing sms
    phish_msg = ai_service.analyze_message("ALERT: Your Chase banking account has been suspended due to suspicious activity. Verify your account at https://chase-update-login.net")
    assert phish_msg["classification"] == "Phishing"
    assert phish_msg["risk_level"] == "Dangerous"
    assert "verify your account" in [k.lower() for k in phish_msg["keywords"]]
    assert "suspicious activity" in [k.lower() for k in phish_msg["keywords"]]

    print("[OK] Message scanning tests passed!")

def test_chatbot_commands():
    print("Testing Chatbot assistant response logic...")
    
    # Help command
    help_res = ai_service.chat_respond([], "/help")
    assert "scan-url" in help_res["response"]
    assert "scan-message" in help_res["response"]
    assert help_res["command_detected"] == "/help"
    
    # URL Scan command
    scan_url_res = ai_service.chat_respond([], "/scan-url https://google.com")
    assert scan_url_res["command_detected"] == "/scan-url"
    assert scan_url_res["structured_data"]["type"] == "url"
    assert scan_url_res["structured_data"]["result"]["risk_level"] == "Safe"
    
    # Message Scan command
    scan_msg_res = ai_service.chat_respond([], "/scan-message Urgent payment required!")
    assert scan_msg_res["command_detected"] == "/scan-message"
    assert scan_msg_res["structured_data"]["type"] == "message"
    assert scan_msg_res["structured_data"]["result"]["classification"] == "Phishing" # "urgent" is a phishing trigger

    # Custom conversation message
    chat_msg_res = ai_service.chat_respond([], "How do I protect my account?")
    assert "MFA" in chat_msg_res["response"] or "Multi-Factor Authentication" in chat_msg_res["response"]
    assert chat_msg_res["command_detected"] is None

    print("[OK] Chatbot tests passed!")

if __name__ == "__main__":
    try:
        test_url_scanning()
        test_message_scanning()
        test_chatbot_commands()
        print("[SUCCESS] ALL CORE BACKEND SECURITY CHECKS PASSED SUCCESSFULLY!")
        sys.exit(0)
    except AssertionError as e:
        print(f"[ERROR] ASSERTION ERROR: {e}")
        sys.exit(1)
