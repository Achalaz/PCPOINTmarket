<div align="center">

<!-- Animated wave banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:C8102E,100:0B0D10&height=220&section=header&text=PCPoint&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Task%20Force%20Gear.%20Overclocked.&descAlignY=58&descSize=20" width="100%"/>

<!-- Typing animation tagline -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=Share+Tech+Mono&size=22&duration=3000&pause=800&color=C8102E&center=true&vCenter=true&width=700&lines=Laptops+%7C+GPUs+%7C+Monitors+%7C+Custom+PCs;Mouse+Wheel+Hero+Carousel+%7C+Live+Telemetry;React+%2B+Vite+%7C+Express+%7C+Node.js;Battlefield-grade+Components.+Zero+Latency." alt="Typing SVG" />
</a>

<br/>

<!-- Badges -->
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

<br/>

![GitHub repo size](https://img.shields.io/github/repo-size/Achalaz/PCPOINTmarket?style=flat-square&color=C8102E)
![GitHub last commit](https://img.shields.io/github/last-commit/Achalaz/PCPOINTmarket?style=flat-square&color=C8102E)
![GitHub issues](https://img.shields.io/github/issues/Achalaz/PCPOINTmarket?style=flat-square&color=C8102E)
![GitHub stars](https://img.shields.io/github/stars/Achalaz/PCPOINTmarket?style=flat-square&color=C8102E)
![License](https://img.shields.io/badge/license-MIT-C8102E?style=flat-square)

</div>

---

## 🖥️ About PCPoint

**PCPoint** is a dark-themed, military-aesthetic e-commerce web application for gaming computers, components, and peripherals. Built with a **React + Vite** frontend and an **Express + Node.js** backend, the homepage features a cinematic hero section with a mouse-wheel image carousel, live telemetry animations, a scrolling ticker, product cards, and a build configurator CTA.

> Built as part of the **ICT2142 – E-Business Systems** module, following an agile weekly development log from planning through deployment.

<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=Share+Tech+Mono&size=16&duration=2500&pause=500&color=9298A0&center=true&vCenter=true&width=600&lines=%24+npm+run+dev;%E2%9C%94+Vite+server+running+on+localhost%3A5173;%E2%9C%94+Express+server+running+on+port+3000;%E2%9C%94+SYSTEM+OVERCLOCKED+%2F%2F+STABLE" alt="terminal typing" />
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎮 Homepage UI
- Cinematic full-screen **Hero Section**
- 🖱️ **Mouse Wheel Carousel** — scroll over hero image to cycle 5 banner images with smooth fade-in animation
- Live **Operator Terminal** — telemetry panel with real-time fluctuating thermal, RPM & voltage values
- Scrolling **Ticker Banner** with promotional deals
- **Category Grid** — 4 categories with hover effects
- **Product Cards** — 4 featured products with add-to-cart
- **Build Configurator** CTA section with blueprint background
- **Field Logs** (reviews) section

</td>
<td width="50%" valign="top">

### 🛠️ Technical
- React component architecture (Navbar, Hero, Categories, Products, Configurator, Diagnostics, Logs, Footer)
- Vanilla CSS with custom properties (dark theme, crimson accents)
- `useRef` + `useEffect` for native wheel events (page scroll preserved)
- `useState` + `setInterval` for live telemetry simulation
- Static file serving via Express
- Google Fonts: **Share Tech Mono** + **Inter**
- Fully responsive (mobile, tablet, desktop)

</td>
</tr>
</table>

---

## 🧱 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Fonts** | Google Fonts (Share Tech Mono, Inter) |
| **Dev Server** | Vite (`localhost:5173`) |
| **API Server** | Express (`localhost:3000`) |

</div>

---

## 📁 Project Structure

```
PCPOINTmarket/
├── client/                      # React + Vite frontend
│   ├── public/                  # Static images (hero, GPU, laptop, monitor, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Fixed navigation bar
│   │   │   ├── Hero.jsx         # Hero section + mouse wheel image carousel
│   │   │   ├── Categories.jsx   # 4-column category grid
│   │   │   ├── Products.jsx     # Featured product cards
│   │   │   ├── Configurator.jsx # PC Build CTA section
│   │   │   ├── Diagnostics.jsx  # Live telemetry panel
│   │   │   ├── Logs.jsx         # Field logs / reviews
│   │   │   └── Footer.jsx       # Brands + Newsletter + Footer
│   │   ├── App.jsx              # Root component
│   │   ├── data.js              # Image paths, product & category data
│   │   ├── index.css            # Global dark-theme CSS
│   │   └── main.jsx             # Vite entry point
│   ├── index.html               # Root HTML with Google Fonts
│   └── package.json
├── public/                      # Legacy static assets (served by Express)
├── index.js                     # Express server (serves /public)
└── package.json
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Achalaz/PCPOINTmarket.git
cd PCPOINTmarket
```

### Option 1 — React Frontend (Vite dev server)
```bash
cd client
npm install
npm run dev
# Visit http://localhost:5173
```

### Option 2 — Legacy Express Server (plain HTML)
```bash
# From root directory
npm install
npm start
# Visit http://localhost:3000
```

<div align="center">

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)
&nbsp;
![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=flat-square&logo=vite)
&nbsp;
![Styled with CSS](https://img.shields.io/badge/Styled%20with-Vanilla%20CSS-1572B6?style=flat-square&logo=css3)

</div>

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Primary Background** | `#050507` |
| **Card Background** | `#121217` |
| **Crimson Accent** | `#ff0033` |
| **Neon Green** | `#00ff66` |
| **Border Color** | `#2a2a35` |
| **Font (Body)** | Inter (400, 600, 800, 900) |
| **Font (Tech/Mono)** | Share Tech Mono |

---

## 📅 Development Log

This project follows a weekly development diary tracked from Week 01 (planning & requirements) onward.

- ✅ Week 01 — Business description, requirement analysis, system architecture
- ✅ Week 02 — Wireframing, ER diagram, database schema, version control setup
- ✅ Week 03 — Homepage UI implementation (React + Vite), hero carousel, telemetry panel
- ⬜ Week 04 — *(upcoming)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork it, then:
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📜 License

This project is licensed under the **MIT License**.

<div align="center">

### ⭐ If you like this project, consider giving it a star!

<img src="https://readme-typing-svg.demolab.com?font=Share+Tech+Mono&size=18&duration=2500&pause=1000&color=C8102E&center=true&vCenter=true&width=500&lines=Thanks+for+visiting+PCPoint!;Task+Force+Gear.+Overclocked+%F0%9F%96%A5%EF%B8%8F" alt="footer typing" />

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0D10,100:C8102E&height=120&section=footer" width="100%"/>

</div>