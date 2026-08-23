<div align="center">

<!-- Animated wave banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:C8102E,100:0B0D10&height=220&section=header&text=PcPoint&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Online%20Computer%20%26%20Hardware%20Marketplace&descAlignY=58&descSize=20" width="100%"/>

<!-- Typing animation tagline -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&size=24&duration=3000&pause=800&color=C8102E&center=true&vCenter=true&width=650&lines=Laptops+%7C+Components+%7C+Custom+Gaming+PCs;Built+with+the+MERN+Stack;Islandwide+Delivery+%7C+Real+Support" alt="Typing SVG" />
</a>

<br/>

<!-- Badges -->
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<br/>

![GitHub repo size](https://img.shields.io/github/repo-size/your-username/pcpoint?style=flat-square&color=C8102E)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/pcpoint?style=flat-square&color=C8102E)
![GitHub issues](https://img.shields.io/github/issues/your-username/pcpoint?style=flat-square&color=C8102E)
![GitHub stars](https://img.shields.io/github/stars/your-username/pcpoint?style=flat-square&color=C8102E)
![License](https://img.shields.io/badge/license-MIT-C8102E?style=flat-square)

</div>

---

## 🖥️ About PcPoint

**PcPoint** is a full-stack e-commerce web application for an online computer & hardware marketplace in Sri Lanka. Customers can browse laptops, desktops, custom-built gaming PCs, and components — and even build their own PC using an interactive part picker that generates a downloadable PDF quotation.

> Built as part of the **ICT2142 – E-Business Systems** module, following an agile weekly development log from planning through deployment.

<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=16&duration=2500&pause=500&color=9298A0&center=true&vCenter=true&width=600&lines=%24+npm+run+dev;%E2%9C%93+Server+running+on+port+5000;%E2%9C%93+Connected+to+MongoDB;%E2%9C%93+Ready+to+build+your+PC" alt="terminal typing" />
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🛍️ Customer
- Browse & search products by category, brand, price
- Product detail pages with specs and reviews
- Cart, checkout, and order tracking
- **Interactive PC Build tool** → live price → PDF quotation
- Account with order history

</td>
<td width="50%" valign="top">

### 🛠️ Admin
- Product & category CRUD
- Stock/inventory management
- Order status management
- Build-parts catalogue management
- Quotation tracking dashboard

</td>
</tr>
</table>

---

## 🧱 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Payments** | PayHere |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |

</div>

---

## 📁 Project Structure

```
pcpoint/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard...
│   │   ├── pages/          # Home, Category, Product, Cart, BuildQuote...
│   │   ├── context/        # AuthContext, CartContext
│   │   └── services/       # api.js (Axios instance)
├── server/                 # Express backend
│   ├── models/              # User, Product, Category, Order, BuildPart, Quotation
│   ├── routes/               # authRoutes, productRoutes, orderRoutes, quotationRoutes
│   ├── controllers/
│   └── middleware/          # auth.js (JWT verify)
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/pcpoint.git
cd pcpoint

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Set up environment variables
cp .env.example .env
# Add your MONGO_URI, JWT_SECRET, PORT

# Run the backend
cd ../server && npm run dev

# Run the frontend
cd ../client && npm run dev
```

<div align="center">

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)
&nbsp;
![Powered by Node](https://img.shields.io/badge/Powered%20by-Node.js-339933?style=flat-square&logo=node.js)
&nbsp;
![Database MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)

</div>

---

## 🗺️ Entity Relationship Diagram

The database schema (Users, Products, Orders, Categories, Reviews, BuildParts, Quotations) is documented in [`/docs/PcPoint_ER_Diagram.drawio`](./docs/PcPoint_ER_Diagram.drawio) — open with [draw.io](https://app.diagrams.net).

---

## 📅 Development Log

This project follows a weekly development diary, tracked from Week 01 (planning & requirements) onward. See [`/docs`](./docs) for weekly reports, wireframes, and architecture diagrams.

- ✅ Week 01 — Business description, requirement analysis, system architecture
- ✅ Week 02 — Wireframing, ER diagram, database schema, version control setup
- ⬜ Week 03 — *(in progress)*

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

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&size=18&duration=2500&pause=1000&color=C8102E&center=true&vCenter=true&width=500&lines=Thanks+for+visiting+PcPoint!;Happy+Building+%F0%9F%96%A5%EF%B8%8F" alt="footer typing" />

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0D10,100:C8102E&height=120&section=footer" width="100%"/>

</div>