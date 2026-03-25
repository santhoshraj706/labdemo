# 💰 Finance Tracker - MERN Stack

A powerful and intuitive Full-Stack Finance Tracker application built with the **MERN** (MongoDB, Express, React, Node.js) stack. Manage your expenses, set budgets, and track your financial goals with ease.

![GitHub repo size](https://img.shields.io/github/repo-size/santhoshraj706/labdemo)
![GitHub stars](https://img.shields.io/github/stars/santhoshraj706/labdemo?style=social)

---

## 🚀 Features

- **Authentication**: Secure Login and Registration using JWT (JSON Web Tokens) and Bcrypt.
- **Dashboard**: Visual representation of your finances with Chart.js.
- **Expense Tracking**: Add, edit, and delete expenses with categories.
- **Budget Management**: Set and monitor budgets for different categories.
- **Goal Setting**: Track your savings goals and progress.
- **Responsive UI**: Fully mobile-responsive design built with Bootstrap 5.

## 🛠️ Tech Stack

**Frontend:**
- React.js (v18)
- Bootstrap 5 & Bootstrap Icons
- Chart.js (for data visualization)
- React Router DOM (for navigation)
- Axios (for API calls)
- React Toastify (for notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (ODM)
- JSON Web Token (JWT) for Authentication
- Bcryptjs for Password Hashing
- Cors & Dotenv

---

## 💻 Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB Atlas account or local MongoDB instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/santhoshraj706/labdemo.git
   cd labdemo
   ```

2. **Install dependencies for both Client and Server:**
   ```bash
   npm run install-all
   ```

3. **Environment Variables Setup:**
   Create a `.env` file in the `server/` directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

---

## 🏃 Usage

To run both the frontend and backend concurrently in development mode:

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📂 Project Structure

```bash
finance-tracker/
├── client/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── index.js
├── server/          # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
├── .gitignore
├── package.json     # Main scripts (install-all, dev)
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

