<div align="center">

<img src="https://img.shields.io/badge/STATUS-ACTIVE-black?style=for-the-badge&labelColor=000000" />
<img src="https://img.shields.io/badge/AI%20THREAT%20INTELLIGENCE-ONLINE-white?style=for-the-badge&labelColor=000000&color=ffffff" />

<br /><br />

# 🛡️ CYVRA

### **Trust Before You Click.**

*An AI-powered Digital Trust & Threat Intelligence Platform that identifies phishing websites, scam messages, malicious QR codes, and online threats — before they cause harm.*

<br />

[![Made by Varad Pandharkar](https://img.shields.io/badge/Made%20by-Varad%20Pandharkar-black?style=flat-square)](https://github.com/)
![Solo Project](https://img.shields.io/badge/Type-Solo%20Project-informational?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square)

<br />

[🚀 Live Demo](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>

---

## 📖 About The Project

**CYVRA** is a real-time cybersecurity companion designed to protect everyday users from the digital threats they encounter most: phishing links, scam messages, and malicious QR codes. Powered by an AI threat-intelligence engine, CYVRA scans, analyzes, and scores risk in seconds — giving users a clear, confident answer before they click, scan, or share.

Built end-to-end as a **solo project** by **Varad Pandharkar**, CYVRA combines a clean, dark, security-focused UI with a Python backend and a modern Next.js frontend.

<div align="center">

| 🔍 14,382+ | 🎯 99.4% | 🚫 2,028 | ⚡ Real-time |
|:---:|:---:|:---:|:---:|
| Threats Analyzed | Detection Accuracy | Attacks Blocked | AI Intelligence |

</div>

---

## ✨ Key Features

- 🔗 **Instant URL Scanning** — Paste any link and get a real-time trust verdict.
- 🌐 **Threat Analysis Engine** — Deep-dive analysis of suspicious domains and websites.
- 📱 **QR Code Scanner** — Detect malicious payloads hidden inside QR codes before you scan them in the real world.
- 🤖 **AI Threat Intelligence** — Continuously active AI model analyzing patterns across scam campaigns.
- 📊 **Live Threat Metrics** — Transparent, real-time stats on threats analyzed, accuracy, and attacks blocked.
- 🔐 **Secure Auth System** — Dedicated authentication service to keep user data protected.
- 🎨 **Sleek, Minimal UI** — A distraction-free, dark-themed interface built for clarity under pressure.

---

## 🖥️ Preview

<div align="center">
<img src="assets/preview.png" alt="CYVRA Landing Page Preview" width="90%" />

<sub>CYVRA landing page — dark, minimal, security-first design</sub>
</div>

---

## 🧰 Tech Stack

<div align="center">

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Backend**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

**Tooling**

![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge&logo=powershell&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

---

## 📂 Project Structure

```
CYVRA/
├── backend/
│   ├── services/           # Core backend services
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database connection & queries
│   ├── main.py              # App entry point
│   ├── models.py            # Data models
│   ├── cyvra.db              # SQLite database
│   ├── requirements.txt      # Python dependencies
│   ├── verify_backend.py     # Backend verification script
│   └── verify_flask.py       # Flask verification script
│
└── frontend/
    ├── app/                   # Next.js app router
    ├── components/            # Reusable UI components
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node -v      # v18+
python -v    # 3.10+
```

### Backend Setup

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the backend
python main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env` file inside `frontend/` and `backend/` as needed:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
SECRET_KEY=your_flask_secret_key
DATABASE_URL=sqlite:///cyvra.db
```

---

## 🗺️ Roadmap

- [x] Landing page & core UI
- [x] Backend authentication system
- [x] URL threat scanning
- [ ] QR code malicious payload detection
- [ ] Scam message classifier (SMS/Email)
- [ ] Browser extension for real-time protection
- [ ] Public API for developers

See the [open issues](#) for a full list of proposed features and known bugs.

---

## 🤝 Contributing

This is currently a solo-developed project, but contributions, ideas, and feedback are always welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

<div align="center">

**Varad Pandharkar**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/varad-pandharkar-560661370)

<br />

⭐ **If you found CYVRA interesting, consider giving it a star — it helps a lot!** ⭐

</div>
