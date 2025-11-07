# Sentinel WebUI v0.1.0

A lightweight web interface that visualizes data exported from **HDD Sentinel**.  
Built with **FastAPI + React (Vite)** and themed like a classic green-phosphor CRT terminal.

---

## 🧩 Features

- Real-time drive status, health %, and temperature  
- SMART data table and historical charts  
- Rename / hide drives (persistent)  
- Full Windows Storage Spaces support  
- Self-contained backend + frontend — runs from a single command  
- Works locally or remotely through Tailscale / LAN  

---

## ⚙️ Installation

### 1️⃣ Clone & enter the project
```bash
git clone https://github.com/yourusername/sentinel_web.git
cd sentinel_web
```

### 2️⃣ Create a virtual environment and install dependencies
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 3️⃣ (Developers only) Build the frontend
```bash
cd frontend
npm ci
npm run build
cd ..
```

---

## ▶️ Usage

1. Start the FastAPI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

2. Open your browser:
```
http://localhost:8000
```
or (over Tailscale)
```
http://<your-tailscale-ip>:8000
```

---

## 📁 Connecting HDD Sentinel

1. In HDD Sentinel, open  
   **Configuration → Advanced Options → Automatic Save/Load → XML file**
2. Set the save path to:
   ```
   <path to this project>\latest_xml\latest.xml
   ```
3. Enable *Auto-save status to XML file* every few minutes.  
   Sentinel WebUI will read that file and update the dashboard automatically.

---

## 🧠 Project Structure
```
sentinel_web/
├── frontend/          # React UI (Vite)
│   └── dist/          # Built frontend served by FastAPI
├── latest_xml/        # HDD Sentinel XML export folder
├── main.py            # FastAPI backend
├── requirements.txt
└── README.md
```

---

## 🧩 License
MIT License © 2025 Andrei Zamfir
