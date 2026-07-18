import sqlite3
import datetime
import os

DB_FILE = "cyvra.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # This allows dictionary-like access to rows
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # 2. Scans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        input_data TEXT NOT NULL,
        result_data TEXT NOT NULL,
        score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)
    
    # 3. Chat Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)
    
    # 4. Security Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS security_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

# Seeding initial alerts
def seed_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if security_alerts are already seeded
    cursor.execute("SELECT COUNT(*) as count FROM security_alerts")
    row = cursor.fetchone()
    
    if row["count"] == 0:
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        alerts = [
            ("Phishing Campaign Targeting Banking Portals", 
             "A coordinated phishing campaign using lookalike .xyz and .click domains has been detected targeting online banking customers. Avoid clicking login links from SMS alerts.", 
             "high", now_str),
            ("Suspicious QR Codes Placed in Public Spaces", 
             "Attackers are replacing legitimate parking meter and retail QR codes with malicious stickers linking to credential harvester pages.", 
             "medium", now_str),
            ("SMTP Relaying Abuse for Fraud SMS", 
             "Security researchers report high-frequency spam campaigns abusing unsecured SMTP relay servers. Check email headers carefully.", 
             "low", now_str),
            ("Critical SSL Validation Bypass Campaign", 
             "Malicious domains are using temporary LetsEncrypt DV certs to pass basic security checks before setting up redirect hops to phishing nodes.", 
             "high", now_str)
        ]
        cursor.executemany("""
        INSERT INTO security_alerts (title, description, severity, timestamp)
        VALUES (?, ?, ?, ?)
        """, alerts)
        conn.commit()
        
    conn.close()

# Initialize on module import
init_db()
seed_alerts()
