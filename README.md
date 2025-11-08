<h1 align="center">Sentient</h1>

<p align="center">
  Sentient is a lightweight web interface that visualizes data exported from <strong>HDD Sentinel</strong>.<br>
  It's built with <strong>FastAPI + React (Vite)</strong> and themed to look like a classic green-phosphor CRT terminal.
</p>



<p align="center">
  <img src="https://i.imgur.com/uP00kSp.gif" width="100%" alt="Sentient WebUI - Desktop View" />
</p>

---

<!-- Desktop Section -->
<h2 align="center">🖥️ Desktop Preview</h2>

<p align="center">
  <img src="https://i.imgur.com/q05Ecgw.jpeg" width="90%" alt="Sentient WebUI - Desktop View" />
</p>

<!-- Tablet & Mobile Section -->
<h2 align="center">📱 Tablet and Mobile Preview</h2>

<p align="center">
  <img src="https://i.imgur.com/El6zqoQ.jpeg" width="50%" style="margin-right: 10px;" alt="Sentient WebUI - Tablet View" />
  <img src="https://i.imgur.com/sruPsem.png" width="31.4%" alt="Sentient WebUI - Mobile View" />
</p>

---

<h2 align="center">🧩 Features</h2>

<p align="center">
  • Real-time drive <strong>usage</strong>, <strong>status</strong>, <strong>health</strong>, and <strong>temperature</strong>.<br>
  • <strong>SMART</strong> data reports and historical temperature and health <strong>charts</strong>.<br>
  • <strong>Color-coded animated warnings</strong> for health, temperature, and storage usage.<br>
  • Persistent <strong>renaming</strong> and <strong>hiding</strong> of drives.<br>
  • <strong>Full Windows Storage Spaces support</strong> (used and available pool <strong>space</strong> and <strong>drives</strong> included).<br>
  • Self-contained backend + frontend — installs dependencies and runs with <strong>two Python scripts</strong>.<br>
  • Supports <strong>HDDs</strong> and <strong>SSDs</strong>.<br>
  • Displays <strong>last WebUI update</strong> and <strong>last HDD Sentinel data export</strong>.<br>
  • Smooth animations and transitions.
</p>



---

<h2 align="center">💾 Drive Cards</h2>

<p style="text-align: left; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <strong>Sentient</strong> displays drives in the form of <strong>Drive Cards</strong>.  
  There are four types of cards, each showing custom information depending on their role:
  <br /><br />
  (1) <strong>System Drive Card</strong> – Displays a badge and is always first. Two buttons expand a SMART report and/or a 24-hour temperature and health history graph with an animated tooltip.<br />
  (2) <strong>Simple Cards</strong> – Show standard information. Two buttons expand a SMART report and/or a temperature and health 24-hour history graph with an animated tooltip.<br />
  (3) <strong>Storage Pool Drives</strong> – Include a custom badge and show space usage. A button at the bottom of the card reveals a list of drives inside the pool (a storage pool does not have health or temperature history).<br />
  (4) <strong>Pooled Drive Cards</strong> – Same as the Simple Cards, minus the drive letter (pooled drives do not get drive letters allocated by Windows).
</p>

<h3 align="center">System Drive and Simple Cards</h3>

<p align="center">
  <img src="https://i.imgur.com/ZJmOGBA.png" width="38%" style="margin-right: 10px;" alt="Sentient WebUI - System Drive Card" />
  <img src="https://i.imgur.com/kT9ZPxV.png" width="43.6%" alt="Sentient WebUI - Simple Drive Card" />
</p>

<h3 align="center">Storage Pool and Pooled Drive Cards</h3>

<p align="center">
  <img src="https://i.imgur.com/CKvKqif.png" width="53.8%" style="margin-right: 10px;" alt="Sentient WebUI - Storage Pool Card" />
  <img src="https://i.imgur.com/kwqY6bz.png" width="38%" alt="Sentient WebUI - Pooled Drive Card" />
</p>

---

<h3 align="center">🎨 Color-Coded Warnings</h3>

<h3 align="center">💚 Health Thresholds</h3>

<div align="center">

<table>
  <tr>
    <th>Condition</th>
    <th>Health %</th>
    <th>Color</th>
    <th>Behavior</th>
  </tr>
  <tr>
    <td>🟩 <strong>Good</strong></td>
    <td><code>≥ 100%</code></td>
    <td>Green <code>#00ff80</code></td>
    <td>Static</td>
  </tr>
  <tr>
    <td>🟨 <strong>Warning</strong></td>
    <td><code>80%–99%</code></td>
    <td>Yellow <code>#ffff66</code></td>
    <td>Soft yellow pulsing glow</td>
  </tr>
  <tr>
    <td>🟥 <strong>Critical</strong></td>
    <td><code>&lt; 80%</code></td>
    <td>Red <code>#ff4040</code></td>
    <td>Soft red pulsing glow</td>
  </tr>
</table>

</div>

<h3 align="center">🌡️ Temperature Thresholds</h3>

<div align="center">

<table>
  <tr>
    <th>Condition</th>
    <th>Temp °C</th>
    <th>Color</th>
    <th>Behavior</th>
  </tr>
  <tr>
    <td>🟩 <strong>Normal</strong></td>
    <td><code>≤ 40°C</code></td>
    <td>Green <code>#00ff80</code></td>
    <td>Static</td>
  </tr>
  <tr>
    <td>🟨 <strong>Warm</strong></td>
    <td><code>&gt; 40°C &amp; ≤ 55°C</code></td>
    <td>Yellow <code>#ffff66</code></td>
    <td>Soft yellow pulsing glow</td>
  </tr>
  <tr>
    <td>🟥 <strong>Hot</strong></td>
    <td><code>&gt; 55°C</code></td>
    <td>Red <code>#ff4040</code></td>
    <td>Soft red pulsing glow</td>
  </tr>
</table>

</div>

<h3 align="center">💾 Usage Bar Thresholds</h3>

<div align="center">

<table>
  <tr>
    <th>Condition</th>
    <th>Used %</th>
    <th>Color</th>
    <th>Behavior</th>
  </tr>
  <tr>
    <td>🟩 <strong>Healthy Capacity</strong></td>
    <td><code>&lt; 70%</code></td>
    <td>Green <code>#00ff80</code></td>
    <td>Static</td>
  </tr>
  <tr>
    <td>🟨 <strong>Moderate</strong></td>
    <td><code>70%–89%</code></td>
    <td>Yellow <code>#ffff66</code></td>
    <td>Static</td>
  </tr>
  <tr>
    <td>🟥 <strong>Full / Risk</strong></td>
    <td><code>≥ 90%</code></td>
    <td>Red <code>#ff4040</code></td>
    <td>Static</td>
  </tr>
</table>

</div>



---

## 🙋‍♂️ What Is Sentient and Why Does It Exist?

### Short Backstory

A few years ago, I got into self-hosting by building a media server. On Ubuntu, I used `smartctl` to monitor drives, and later discovered [Scrutiny](https://github.com/AnalogJ/scrutiny) — an amazing Docker-based SMART monitoring tool with a beautiful WebUI (kudos to the developer!).

Unfortunately, Scrutiny (and `smartctl`) can’t access drives pooled under Windows Storage Spaces.

That’s where **Sentient** comes in: not as a replacement for Scrutiny (which in no way could it be, by design), but as a simple XML-driven telemetry dashboard that lets me check drive health and temperature changes — even for drives inside a Windows Storage Spaces pool.

### What Does It Do?

**Sentient** ingests data exported on a schedule by the drive health and temperature monitoring tool **HDD Sentinel**, extracts telemetry data, and displays it in the WebUI.

### How Does It Work?

The structure is simple. HDD Sentinel can be configured to export an `.xml` file at set intervals containing detailed information about all connected storage devices.

That `.xml` file is then picked up by **Sentient**, parsed by a Python script, and exposed through a FastAPI backend.  
The frontend — built with React — consumes these API endpoints to generate an interactive dashboard where the data is presented clearly and visually.

So, in short:

| Layer | Technology | Purpose | Key File(s) |
|-------|-------------|----------|-------------|
| **Backend (API)** | **FastAPI (Python)** | Reads HDD Sentinel XML → parses data → exposes it via endpoints (e.g., `/drives`, `/history`) | `main.py` |
| **Frontend (WebUI)** | **React (JavaScript/JSX)** | Fetches data from FastAPI → displays cards, graphs, buttons, animations, etc. | `App.jsx`, `App.css`, plus components in `/src/` |

### Who Is It For?

Mostly for myself.

Very few people self-host services on Windows, and even fewer use Windows Storage Spaces for drive pooling (for good reasons).  
That said, plenty of people use HDD Sentinel — and some of them might wish it had a better web interface.  
It actually does have one, which I was surprised to discover, but it’s unfortunately almost unusable due to its complete lack of design.

---

## ⚙️ Installation

### 0️⃣ Prerequisites

1. **HDD Sentinel Pro or Enterprise** – required to schedule XML export. Trial and Standard versions [do not allow XML export](https://www.hdsentinel.com/store.php).  
2. **Python ≥ 3.10** – needed to run the FastAPI backend. Download from [python.org](https://python.org/downloads) or your OS package manager.  
3. **pip** – usually comes bundled with Python. If missing, run `python -m ensurepip` in PowerShell.  
4. **Git** – for cloning or updating the project repo. Get it from [git-scm.com](https://git-scm.com).  
5. **Node.js ≥ 18** – required for building and running the React frontend. Download from [nodejs.org](https://nodejs.org).  
6. **npm** – used to install frontend dependencies (`npm install`). Installed automatically with Node.js.  
7. Other dependencies are listed in `requirements.txt` and will be installed automatically (see below).

### 1️⃣ Clone and Enter the Project

```bash
git clone https://github.com/andreizet66/sentient
cd sentient
````

### 2️⃣ Ensure the `latest_xml` Folder Exists

If it’s missing, create it:

```bash
mkdir latest_xml
```

### 3️⃣ Schedule HDD Sentinel XML Export

1. In HDD Sentinel, open **Configuration → Advanced Options**

   <p align="left"><img src="https://i.imgur.com/Uy2ie6d.png" width="500" /></p>

2. In the **Configuration** window:

   * Set `Detection frequency` to the desired refresh interval. **Sentient** updates every 30 seconds, so anything higher works.
   * Check `Generate and update XML file`.
   * Click **Select**.

   <p align="left"><img src="https://i.imgur.com/Vwrn3Sf.png" width="500" /></p>

3. In the **Save As** window, navigate to your cloned `sentient` folder, choose the `latest_xml` directory, and save the file as `latest.xml`.

   <p align="left"><img src=https://i.imgur.com/rPK2KPp.png" width="500" /></p>

   * You **must** name the file `latest.xml`, or it will be ignored.
   * You **must** include the `.xml` extension — sometimes HDD Sentinel omits it.
   * You **must** place the file in the `latest_xml` folder — any other location will be ignored.

### 4️⃣ Run the Setup Script

```bash
python setup.py
```

This script checks that Python ≥ 3.10 is installed and installs all dependencies.

**Expected successful output:**

```
=== Sentient Setup ===
Installing dependencies from requirements.txt ...
Collecting fastapi<1.0.0,>=0.120.0
Collecting uvicorn<1.0.0,>=0.38.0
Collecting nodeenv>=1.9.0
...
Successfully installed click-8.1.7 fastapi-0.120.0 h11-0.14.0 nodeenv-1.9.0 starlette-0.37.2 uvicorn-0.38.0

Setup complete! You can now start Sentient with:
   python start.py
```

---

## ▶️ Usage

1. Start the app:

```bash
python start.py
```

**Expected output:**

```
Starting Sentient WebUI ...

INFO:     Started server process [12148]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8332 (Press CTRL+C to quit)
```

2. The WebUI is now available at [http://127.0.0.1:8332](http://127.0.0.1:8332).
   Keep the terminal window open while Sentient is running.

3. If port **8332** is already in use, edit `start.py` and change the port value:

```python
try:
    subprocess.check_call([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8332"])
except KeyboardInterrupt:
    print("\nStopped.")
```

4. To stop Sentient, press **CTRL + C**.

---

## 🍫 Planned Features

I don't have a fixed timeline for these, but they will likely arrive in the coming months:

* Themes
* Settings page
* Custom Drive Card order
* Option to disable color-coded warnings and/or animations
* Support for multiple Windows Storage Spaces pools (if requested)

---

## ❤️‍🩹 Known Limitations

Given that we’re working within Windows and relying solely on the data HDD Sentinel provides, there are a few limitations that currently **cannot be overcome**.

> These do not affect typical users with a single storage pool.

* A drive is listed as a **System Drive** only if its letter is `C:`.
* A drive is listed as a **Windows Storage Spaces Pool** only if that pool’s letter is `P:`.
* **Only one** Windows Storage Spaces Pool can exist; only the `P:` pool will be recognized.
* A drive is listed as part of a Windows Storage Pool **only if it has no drive letter**.
* Consequently, the pool card lists all drives without a letter, regardless of which pool they belong to — since HDD Sentinel does not expose that relationship.

---

## 🧠 Project Structure

```
sentient/
├── frontend/          # React UI (Vite)
│   └── dist/          # Built frontend served by FastAPI
├── latest_xml/        # HDD Sentinel XML export folder
├── main.py            # FastAPI backend
├── requirements.txt
└── README.md
```

## ❌ Disclaimer

I am not a software engineer by trade. This is my first app. Chat GPT was heavily used.

---

## 🧩 License

MIT License © 2025 Andrei Zamfir

```
---
```
