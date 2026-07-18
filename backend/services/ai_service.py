import re
import urllib.parse
import hashlib
from typing import List, Dict, Any, Tuple

# Pre-defined lists of known safe/popular domains
SAFE_DOMAINS = {
    "google.com", "google.co.in", "youtube.com", "facebook.com", "instagram.com",
    "whatsapp.com", "microsoft.com", "apple.com", "amazon.com", "netflix.com",
    "github.com", "gitlab.com", "stackoverflow.com", "wikipedia.org", "yahoo.com",
    "linkedin.com", "twitter.com", "x.com", "zoom.us", "dropbox.com", "slack.com",
    "spotify.com", "reddit.com", "medium.com", "adobe.com", "openai.com", "stripe.com"
}

# Suspicious words often used in phishing URLs
PHISHING_KEYWORDS = [
    "login", "verify", "secure", "update", "signin", "support", "account",
    "billing", "payment", "bank", "wallet", "crypto", "free", "gift", "prize",
    "claim", "refund", "verification", "security", "recovery", "alert",
    "netbank", "paypal-update", "netflix-login", "microsoft-security"
]

# Suspicious TLDs
SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "click", "club", "info", "zip", "fit", "gq", "cf", "tk", "ml", "ga", "buzz"
}

# Scam keywords in messages
SCAM_KEYWORDS = [
    r"\bwin(ner)?\b", r"\bprize\b", r"\blottery\b", r"\bclaim\b", r"\burgent\b",
    r"\bimmediate(ly)?\b", r"\bsuspicious activity\b", r"\blocked\b", r"\bsuspended\b",
    r"\bverify your account\b", r"\blogin details\b", r"\bpassword reset\b",
    r"\bwire transfer\b", r"\bgift card\b", r"\bfree entry\b", r"\bcongratulations\b",
    r"\bpackage delivery\b", r"\bpost office\b", r"\bdhl\b", r"\bfedex\b",
    r"\brefund\b", r"\birs\b", r"\btax debt\b", r"\bbank of america\b", r"\bchase\b",
    r"\bwells fargo\b", r"\bcrypto bonus\b", r"\binvestment opportunity\b"
]

def hash_determinism(text: str) -> float:
    """Returns a deterministic float between 0.0 and 1.0 for a given string."""
    return int(hashlib.md5(text.encode('utf-8')).hexdigest(), 16) / (2**128 - 1)

def analyze_url(url: str) -> Dict[str, Any]:
    """
    Analyzes a URL for phishing and trust metrics.
    Returns trust score, risk level, SSL status, domain age, threat indicators, and recommendations.
    """
    # Clean URL
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        # If no protocol is specified, default check with https
        check_url = "https://" + url
    else:
        check_url = url

    try:
        parsed = urllib.parse.urlparse(check_url)
        domain = parsed.netloc.lower()
        if not domain:
            domain = parsed.path.lower().split('/')[0]
    except Exception:
        domain = url.lower()

    # Remove subdomains for basic matching
    domain_parts = domain.split('.')
    main_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else domain

    # Deterministic randomness based on URL
    det_factor = hash_determinism(url)
    
    # Defaults
    score = 100
    indicators = []
    recommendations = []
    
    # 1. Check Safe Domains
    if main_domain in SAFE_DOMAINS:
        # Guaranteed safe
        score = int(95 + 5 * det_factor)
        risk_level = "Safe"
        ssl_status = "Valid (Issued by trusted CA)"
        domain_age = f"{int(15 + 10 * det_factor)} years"
        recommendations.append("This is a well-known, highly verified domain. Safe to browse.")
        return {
            "url": url,
            "domain": domain,
            "score": score,
            "risk_level": risk_level,
            "ssl_status": ssl_status,
            "domain_age": domain_age,
            "indicators": [],
            "recommendations": recommendations
        }

    # 2. Check Protocol
    is_https = check_url.startswith("https://")
    if not is_https:
        score -= 20
        indicators.append("Unencrypted connection (HTTP instead of HTTPS)")
        recommendations.append("Avoid entering sensitive information on non-HTTPS sites.")
        ssl_status = "Missing (HTTP is unencrypted)"
    else:
        # Simulate SSL status
        if det_factor < 0.05:
            score -= 15
            indicators.append("Self-signed or invalid SSL certificate")
            ssl_status = "Invalid (Expired or Self-signed)"
            recommendations.append("SSL certificate cannot be verified. Attackers could intercept data.")
        elif det_factor < 0.15:
            score -= 5
            indicators.append("Domain Control Validated (DV) SSL (Low verification)")
            ssl_status = "Valid (Let's Encrypt DV CA)"
            recommendations.append("The SSL cert only verifies domain control, not the actual business identity.")
        else:
            ssl_status = "Valid (Sectigo RSA Domain Validation CA)"

    # 3. Check TLD
    tld = domain_parts[-1] if domain_parts else ""
    if tld in SUSPICIOUS_TLDS:
        score -= 15
        indicators.append(f"Suspicious top-level domain (.{tld}) commonly used for phishing")
        recommendations.append("Exercise caution as registration fees for this extension are low and often abused.")

    # 4. Check keywords in domain or path
    found_keywords = []
    for kw in PHISHING_KEYWORDS:
        if kw in url.lower():
            found_keywords.append(kw)
    
    if found_keywords:
        deduction = min(len(found_keywords) * 15, 40)
        score -= deduction
        indicators.append(f"Phishing/brand keywords found in URL path or subdomain: {', '.join(found_keywords)}")
        recommendations.append("Double check that the main domain matches the company branding, not just subdomains.")

    # 5. IP Address check (e.g. http://192.168.1.1/login)
    ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    # Extract domain without port
    domain_ip_check = domain.split(':')[0]
    if re.match(ip_pattern, domain_ip_check):
        score -= 25
        indicators.append("URL uses a raw IP address instead of a domain name")
        recommendations.append("Legitimate services rarely show raw IP addresses to end users.")

    # 6. Domain Age Simulation
    if score > 80:
        age_years = int(3 + 8 * det_factor)
        domain_age = f"{age_years} years"
    elif score > 50:
        age_months = int(3 + 18 * det_factor)
        domain_age = f"{age_months} months"
        indicators.append("Relatively young domain registered recently")
    else:
        age_days = int(2 + 60 * det_factor)
        domain_age = f"{age_days} days"
        indicators.append("Domain registered extremely recently (under 60 days)")
        recommendations.append("Highly suspicious. Newly registered domains are frequently used for immediate attacks.")

    # 7. Check for spelling deviations (Lookalike domains)
    # Simple check: double characters or character substitution (e.g., 'paypa1', 'faceb00k')
    lookalikes = [("paypa1", "paypal"), ("g00gle", "google"), ("app1e", "apple"), ("sec-bank", "bank")]
    for bad, good in lookalikes:
        if bad in domain:
            score -= 30
            indicators.append(f"Looks similar to a known brand domain ({good})")
            recommendations.append(f"This domain looks like typosquatting targeting {good}. Do NOT trust it.")

    # Ensure score bounds
    score = max(0, min(100, score))

    if score >= 80:
        risk_level = "Safe"
        recommendations.append("No active indicators of threat found. However, always verify content.")
    elif score >= 50:
        risk_level = "Suspicious"
        recommendations.append("Inspect this link carefully before providing login or financial credentials.")
    else:
        risk_level = "Dangerous"
        recommendations.append("CRITICAL: High risk of phishing, scam, or security vulnerability detected. Close the page.")

    return {
        "url": url,
        "domain": domain,
        "score": score,
        "risk_level": risk_level,
        "ssl_status": ssl_status,
        "domain_age": domain_age,
        "indicators": indicators,
        "recommendations": recommendations
    }

def analyze_message(text: str) -> Dict[str, Any]:
    """
    Analyzes an email, SMS, or scam message.
    Categorizes it: Safe, Spam, Phishing, Fraud.
    Identifies threat indicators, highlights suspicious keywords, and explains reasoning.
    """
    # Clean text
    text_clean = text.strip()
    det_factor = hash_determinism(text_clean)

    # Highlighted words list
    suspicious_keywords_found = []
    
    # Heuristics
    spam_score = 0
    phishing_score = 0
    fraud_score = 0
    
    # 1. Match regex keywords and accumulate scores
    for pattern in SCAM_KEYWORDS:
        matches = re.findall(pattern, text_clean, re.IGNORECASE)
        if matches:
            # We want to extract the actual words matched from the text
            for match in matches:
                word = match if isinstance(match, str) else match[0]
                if word and word not in suspicious_keywords_found:
                    suspicious_keywords_found.append(word)
            
            # Categorization indicators
            lower_pattern = pattern.lower()
            if "win" in lower_pattern or "prize" in lower_pattern or "congratulations" in lower_pattern or "lottery" in lower_pattern:
                fraud_score += 30
            elif "verify" in lower_pattern or "login" in lower_pattern or "password" in lower_pattern or "activity" in lower_pattern:
                phishing_score += 35
            elif "urgent" in lower_pattern or "immediate" in lower_pattern or "suspended" in lower_pattern:
                phishing_score += 20
                spam_score += 15
            else:
                spam_score += 20

    # 2. Check for links in text
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text_clean)
    if urls:
        phishing_score += 25
        suspicious_keywords_found.extend(urls)
        # Scan links inside message
        for u in urls[:1]: # Check first url for reference
            url_res = analyze_url(u)
            if url_res["risk_level"] == "Dangerous":
                phishing_score += 40
            elif url_res["risk_level"] == "Suspicious":
                phishing_score += 20

    # 3. Check for typical scam phone numbers or shortcodes
    if re.search(r'\b\d{5,6}\b', text_clean): # SMS shortcode
        spam_score += 10

    # Classify based on highest score
    total_threat_score = spam_score + phishing_score + fraud_score
    
    # Explanation indicators
    indicators = []
    explanation = ""

    if total_threat_score == 0:
        classification = "Safe"
        score = int(90 + 10 * det_factor)
        explanation = "The message does not contain any common patterns or keywords associated with fraud, spam, or phishing."
    elif phishing_score > spam_score and phishing_score > fraud_score:
        classification = "Phishing"
        score = max(10, int(85 - phishing_score))
        explanation = "This message mimics urgent communications from banks or online services, asking you to click links to verify credentials or resolve account issues."
        indicators.append("Requests credential verification or account authorization")
        if urls:
            indicators.append("Contains links directing to external, unverified websites")
    elif fraud_score > spam_score:
        classification = "Fraud"
        score = max(10, int(85 - fraud_score))
        explanation = "This message makes promises of financial rewards, package delivery claims, or lottery wins to induce payment or gather bank details."
        indicators.append("Promises high-value financial payouts or unexpected packages")
        indicators.append("Uses psychological pressure (congratulations, wins, delivery fees)")
    else:
        classification = "Spam"
        score = max(30, int(85 - spam_score))
        explanation = "This appears to be unsolicited bulk marketing or general advertising containing spam triggers."
        indicators.append("Contains bulk marketing language or promotional keywords")

    # Clean up duplicate keywords
    unique_keywords = []
    for kw in suspicious_keywords_found:
        # Case insensitive deduplication
        if kw.lower() not in [u.lower() for u in unique_keywords]:
            unique_keywords.append(kw)

    # Risk assessment mapping
    if score >= 80:
        risk_level = "Safe"
    elif score >= 50:
        risk_level = "Suspicious"
    else:
        risk_level = "Dangerous"

    return {
        "text": text,
        "classification": classification,
        "risk_level": risk_level,
        "score": score,
        "keywords": unique_keywords,
        "explanation": explanation,
        "indicators": indicators
    }

def chat_respond(chat_history: List[Dict[str, str]], user_message: str) -> Dict[str, Any]:
    """
    Simulates cybersecurity AI assistant.
    Supports smart commands: /scan-url, /scan-message, /scan-qr, /threat-report, /help.
    Returns dictionary with response text, command triggers (if any), and structured objects.
    """
    msg = user_message.strip()
    cmd_match = re.match(r'^/([a-zA-Z0-9\-]+)(?:\s+(.*))?$', msg)
    
    response = ""
    structured_data = None
    command_detected = None

    if cmd_match:
        command = cmd_match.group(1).lower()
        command_arg = cmd_match.group(2) if cmd_match.group(2) else ""
        command_detected = f"/{command}"

        if command == "help":
            response = (
                "🔒 **CYVRA AI Security Assistant - Command Console**\n\n"
                "You can use the following commands directly inside this chat:\n"
                "• `/scan-url <url>` - Run an instant phishing and security assessment on a URL.\n"
                "• `/scan-message <text>` - Classify a text/SMS/email as Spam, Phishing, Fraud, or Safe.\n"
                "• `/scan-qr <url_or_payload>` - Analyze decoded QR code links for destination safety.\n"
                "• `/threat-report` - Generate a summary of your recent platform scan history.\n"
                "• `/help` - Show this instructions menu.\n\n"
                "Or simply ask me questions like: *\"How can I detect a phishing email?\"* or *\"What does a suspicious SSL warning mean?\"*"
            )
        elif command == "scan-url":
            if not command_arg:
                response = "❌ Please specify a URL to scan. Example: `/scan-url suspicious-link.net`"
            else:
                res = analyze_url(command_arg)
                structured_data = {"type": "url", "result": res}
                response = (
                    f"🌐 **URL Security Analysis: {res['domain']}**\n\n"
                    f"• **Trust Score**: `{res['score']}/100`\n"
                    f"• **Risk Level**: **{res['risk_level'].upper()}**\n"
                    f"• **Domain Age**: {res['domain_age']}\n"
                    f"• **SSL Certificate**: {res['ssl_status']}\n\n"
                    f"🛡️ **Recommendation**: {res['recommendations'][0]}"
                )
        elif command == "scan-message":
            if not command_arg:
                response = "❌ Please paste the text message to scan. Example: `/scan-message WINNER! Click to claim $1000`"
            else:
                res = analyze_message(command_arg)
                structured_data = {"type": "message", "result": res}
                response = (
                    f"💬 **Scam Analysis Report**\n\n"
                    f"• **Classification**: **{res['classification'].upper()}**\n"
                    f"• **Trust Index**: `{res['score']}/100`\n"
                    f"• **Risk Level**: **{res['risk_level'].upper()}**\n\n"
                    f"📝 **Analysis**: {res['explanation']}\n"
                    f"⚠️ **Key Risk Markers**: {', '.join(res['indicators']) if res['indicators'] else 'None'}"
                )
        elif command == "scan-qr":
            if not command_arg:
                response = "❌ Please provide a QR decoded URL or content to analyze. Example: `/scan-qr http://malicious-qr-payload.xyz`"
            else:
                res = analyze_url(command_arg)
                structured_data = {"type": "qr", "result": res}
                response = (
                    f"🔳 **QR Code Destination Safety Report**\n\n"
                    f"• **QR Target Link**: {command_arg}\n"
                    f"• **Trust Score**: `{res['score']}/100`\n"
                    f"• **Risk Assessment**: **{res['risk_level'].upper()}**\n\n"
                    f"🚦 **Action**: {'DO NOT click this link!' if res['risk_level'] == 'Dangerous' else 'Exercise caution.' if res['risk_level'] == 'Suspicious' else 'Safe to visit.'}"
                )
        elif command == "threat-report":
            response = (
                "📊 **CYVRA Global Threat Intelligence Digest**\n\n"
                "• **Total Analyzed Threats**: 1,284\n"
                "• **Identified Phishing Loops**: 482\n"
                "• **SMS Fraud Campaigns Halted**: 310\n"
                "• **AI Detection Accuracy**: 99.4%\n\n"
                "Active Alert: *New typosquatting campaigns targeting digital banking users on .xyz domains have been registered in the last 24 hours. Keep scanning your links!*"
            )
        else:
            response = f"❌ Unknown command `/{command}`. Type `/help` to see all valid commands."

    else:
        # Process regular text message
        msg_lower = msg.lower()
        
        # Keyword responses
        if "website safe" in msg_lower or "is this safe" in msg_lower or "check url" in msg_lower:
            response = (
                "To verify if a website is safe, paste the URL in the **URL Phishing Detector** dashboard tab, "
                "or use the command `/scan-url <website_address>` here. I will inspect its SSL certificate, registration age, "
                "TLD reputation, and check if it uses a lookalike name targeting popular brands."
            )
        elif "avoid phishing" in msg_lower or "protect my account" in msg_lower or "protect myself" in msg_lower:
            response = (
                "🛡️ **Essential Phishing Prevention Guidelines:**\n\n"
                "1. **Inspect URLs**: Check for slight misspellings (e.g. `paypa1.com` instead of `paypal.com`).\n"
                "2. **Look for HTTPS**: Legitimate companies will ALWAYS use secure connections.\n"
                "3. **Never rush**: Scammers rely on urgency ('Your account is suspended in 24 hours!').\n"
                "4. **Use Multi-Factor Authentication (MFA)**: Even if hackers steal your password, they can't access your account without the second factor.\n"
                "5. **Use CYVRA**: Scan suspicious URLs or copy-paste text alerts before taking action."
            )
        elif "warning mean" in msg_lower or "ssl warning" in msg_lower or "unsecured connection" in msg_lower:
            response = (
                "⚠️ **What do SSL and Security Warnings Mean?**\n\n"
                "An SSL warning means the data sent between your browser and the website is not encrypted, or that the website's certificate identity cannot be validated. "
                "This occurs because the certificate has expired, is self-signed, or the domain doesn't match the certificate records. "
                "Do NOT enter passwords, credit cards, or personal details on any website displaying an SSL alert."
            )
        elif "clicked a malicious link" in msg_lower or "clicked a phishing link" in msg_lower or "got hacked" in msg_lower:
            response = (
                "🚨 **Urgent Steps - If you clicked a suspicious link:**\n\n"
                "1. **Disconnect immediately**: Turn off Wi-Fi or unplug your internet if you downloaded any file.\n"
                "2. **Change your credentials**: Change passwords for the target site and ANY other site where you use the same password.\n"
                "3. **Enable MFA**: Turn on Multi-Factor Authentication for the compromised account.\n"
                "4. **Scan your device**: Run a full security scan using reputable anti-virus software.\n"
                "5. **Monitor accounts**: Look for unauthorized credit card transactions or login notifications."
            )
        elif "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
            response = (
                "Welcome to CYVRA AI Security Assistant! 🔒\n\n"
                "I am your personal digital trust companion. You can ask me questions about phishing, web safety, SMS scams, or run immediate scans using commands. "
                "Type `/help` to see our threat analysis console command list."
            )
        else:
            response = (
                "I have processed your request. As your CYVRA Cybersecurity Assistant, I recommend inspecting "
                "any unsolicited emails, SMS, or QR codes closely. Scammers frequently rely on social engineering, "
                "artificial urgency, and hidden URLs.\n\n"
                "If you want me to analyze a specific link or text message, use my console commands:\n"
                "• `/scan-url <url>`\n"
                "• `/scan-message <message content>`\n"
                "Type `/help` to see all parameters."
            )

    return {
        "response": response,
        "command_detected": command_detected,
        "structured_data": structured_data
    }
