import requests
import random
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Testing Flask REST endpoints...")
    
    # 1. Health check
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert "Active" in res.json()["status"]
    
    # 2. Signup
    test_email = f"user_{random.randint(1000, 9999)}@cyvra-test.com"
    test_pwd = "SecurePassword123"
    
    signup_res = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "email": test_email,
        "password": test_pwd
    })
    assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
    token = signup_res.json()["access_token"]
    assert token is not None
    
    # 3. Login
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": test_email,
        "password": test_pwd
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. Auth Me
    me_res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    
    # 5. Scan URL
    scan_url_res = requests.post(f"{BASE_URL}/api/scans/url", headers=headers, json={
        "url": "http://paypal-security-alert-update.xyz"
    })
    assert scan_url_res.status_code == 200
    res_data = scan_url_res.json()
    assert res_data["risk_level"] == "Dangerous"
    assert res_data["score"] < 50
    
    # 6. Scan Message
    scan_msg_res = requests.post(f"{BASE_URL}/api/scans/message", headers=headers, json={
        "text": "ALERT: Your account was suspended! Verify immediately at http://fake-login-link.net"
    })
    assert scan_msg_res.status_code == 200
    msg_data = scan_msg_res.json()
    assert msg_data["risk_level"] == "Dangerous"
    assert msg_data["details"]["classification"] == "Phishing"
    assert len(msg_data["details"]["keywords"]) > 0
    
    # 7. Scan QR Content
    scan_qr_res = requests.post(f"{BASE_URL}/api/scans/qr", headers=headers, json={
        "content": "https://google.com"
    })
    assert scan_qr_res.status_code == 200
    qr_data = scan_qr_res.json()
    assert qr_data["content_type"] == "url"
    assert qr_data["risk_level"] == "Safe"
    
    # 8. Get History
    history_res = requests.get(f"{BASE_URL}/api/scans/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 3, f"Expected at least 3 scans in history, got {len(history)}"
    
    # 9. Get Stats
    stats_res = requests.get(f"{BASE_URL}/api/scans/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["user"]["total_scans"] == 3
    assert stats["user"]["safe_scans"] == 1
    assert stats["user"]["dangerous_scans"] == 2
    assert "chart_timeline" in stats
    
    # 10. Get Alerts
    alerts_res = requests.get(f"{BASE_URL}/api/scans/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) == 4, f"Expected 4 seeded alerts, got {len(alerts)}"
    
    # 11. Send Chat message and commands
    chat_res = requests.post(f"{BASE_URL}/api/chat/message", headers=headers, json={
        "message": "Hi assistant, how do I avoid phishing?"
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "MFA" in chat_data["assistant_message"]["message"] or "Multi-Factor Authentication" in chat_data["assistant_message"]["message"]
    
    # Command check in chat: /scan-url
    cmd_res = requests.post(f"{BASE_URL}/api/chat/message", headers=headers, json={
        "message": "/scan-url https://youtube.com"
    })
    assert cmd_res.status_code == 200
    cmd_data = cmd_res.json()
    assert cmd_data["command_detected"] == "/scan-url"
    assert cmd_data["structured_data"]["result"]["risk_level"] == "Safe"
    
    # Get Chat History
    chat_history_res = requests.get(f"{BASE_URL}/api/chat/history", headers=headers)
    assert chat_history_res.status_code == 200
    chat_history = chat_history_res.json()
    assert len(chat_history) >= 4, f"Expected at least 4 messages in history, got {len(chat_history)}" # 2 user, 2 assistant
    
    print("[SUCCESS] ALL FLASK INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        test_api()
        sys.exit(0)
    except AssertionError as e:
        print(f"[ERROR] INTEGRATION TEST ASSERTION FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] INTEGRATION TEST EXCEPTION: {e}")
        sys.exit(1)
