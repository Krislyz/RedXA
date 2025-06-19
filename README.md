# RedXA

**RedXA** is a Windows desktop application that delivers real-time Israeli Red Alert (Tzofar) missile warnings directly to your VR headset via **XSOverlay**.

---

## 🛠 Features

- Pulls live alert data from **Pikud HaOref**.
- Filters alerts for **user-selected primary cities**.
- Integrates with **XSOverlay** to deliver VR notifications.
- Plays customizable alert sounds (default, red alert, or user-uploaded).
- Minimizes to system tray with background polling.
- Saves primary city configuration .
- Electron-based with modular frontend/backend separation.

---

## 📥 Installation

1. Go to the [latest release page](https://github.com/krislyz/RedXA/releases/latest).
2. Download the appropriate `RedXA_v1.0.exe`
3. Run the installer and follow on-screen instructions
4. Choose your cities and alert.

- **PLEASE BE WARNED, IT IS VERY LOUD!**

---

## 🔧 Build The Project (Advanced)

1. Clone the repo:
   ```bash
   git clone https://github.com/krislyz/RedXA.git
   cd RedXA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the app:
   ```bash
   npx electron-builder
   ```

---

## ⚠ License

This project is released under the **RedXA Source-Available License**.

**You may:**
- Use the app for **personal, non-commercial** use
- Modify the code **only to contribute back** to this repository

**You may not:**
- Use RedXA commercially
- Redistribute modified or unmodified versions
- Re-license or fork the project publicly

**Only the original author (Krislyz) may re-license this software.**

See the [LICENSE](./LICENSE) file for full terms.

---

## 📦 Tech Stack

- **Electron** for native app shell and tray control
- **HTML/CSS/JavaScript** for the UI
- **TomSelect** for multi-city selection dropdowns
- **Node.js** for local filesystem and notification handling
- **WebSocket** for XSOverlay communication

---

## 🧠 Architecture

- `main.js` — Electron app setup, tray handling, window lifecycle
- `preload.js` — Secure bridge between UI and backend
- `renderer.js` — UI logic, alert polling, user interactions
- `config.json` — Stores user-selected primary cities
- `sounds/` — Contains bundled or user-selected alert sounds

---

## 📫 Contact

For issues, contributions, or licensing inquiries, contact:

**contact@krislyz.com**