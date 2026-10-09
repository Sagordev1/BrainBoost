<div align="center">

# 🧠 BrainBoost

### Where Curiosity Meets Excellence

**An online quiz management platform to practice, test your knowledge, and track your learning progress.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 📌 Project Overview

**BrainBoost** is a full-stack web application for online quizzes and knowledge assessment. Users can create an account, explore quiz content, attempt timed multiple-choice quizzes, review their results, and monitor their activity from a personal dashboard. An administrative area provides tools for managing quiz settings and questions.

The project is built with a **React + Vite frontend** and a **Node.js + Express backend**, with **MongoDB** used for data storage.

## ✨ Key Features

- 🔐 **User authentication** with account registration and login.
- 🧠 **Online MCQ quizzes** for testing knowledge.
- ⏱️ **Timed quiz attempts** with submission when the timer expires.
- 📊 **Results and score review** after quiz completion.
- 👤 **Personal dashboard** for reviewing quiz activity.
- 🛡️ **Protected pages** for authenticated users.
- ⚙️ **Admin panel** for managing quiz settings and question data.
- 📱 **Responsive interface** for a range of screen sizes.
- ✉️ **Contact form** for sending messages.

> Note: Features such as a global leaderboard, advanced analytics, Google OAuth, and multiple question formats may be part of future development and are not claimed as completed features here.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Building reusable UI components |
| Vite 5 | Frontend development server and production build |
| React Router DOM | Client-side routing |
| Axios | HTTP requests from the frontend |
| CSS | Styling and responsive layouts |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and server-side routes |
| MongoDB | Application data storage |
| Mongoose | MongoDB object modeling |
| JSON Web Token (JWT) | Token-based authentication |
| bcryptjs | Password hashing |
| cookie-parser | Reading cookie values in the backend |
| CORS | Controlling cross-origin API access |
| dotenv | Loading environment variables |
| Nodemon | Restarting the backend during development |
| Git & GitHub | Version control and source code hosting |
| Vercel | Frontend deployment configuration |

## 📦 Main Dependencies

### Frontend

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `vite` *(development dependency)*
- `@vitejs/plugin-react` *(development dependency)*

### Backend

- `express`
- `mongoose`
- `bcryptjs`
- `jsonwebtoken`
- `cookie-parser`
- `cors`
- `dotenv`
- `nodemon` *(development dependency)*

The exact package versions are recorded in `frontend/package.json` and `backend/package.json`.

## 🗂️ Project Structure

```text
BrainBoost/
├── frontend/
│   ├── public/                 # Static assets, if present
│   ├── src/
│   │   ├── api.js              # API configuration
│   │   ├── components/         # Shared UI components and route guards
│   │   ├── context/            # Authentication context
│   │   ├── pages/              # Application pages
│   │   ├── App.jsx              # Routes and app layout
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Frontend entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── backend/
│   ├── config/                 # Database configuration
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API endpoints
│   ├── scripts/                # Utility scripts, if present
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── server.js               # Backend entry point
└── README.md
```

## 🚀 Run the Project Locally

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)
- [MongoDB](https://www.mongodb.com/) local installation or a MongoDB Atlas database
- Git (optional, for cloning the repository)

### 1. Clone the repository

```bash
git clone https://github.com/SagorOST/BrainBoost.git
cd BrainBoost
```

### 2. Configure the backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory by copying `.env.example`. On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure your own values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/brainboost
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_JWT_SECRET=replace_with_another_long_random_secret
ADMIN_PASSWORD_HASH=replace_with_a_valid_bcrypt_hash
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

- If you use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.
- Use strong, unique secret values. Do not share or commit your `.env` file.
- Configure the admin password hash according to the project's backend setup instructions.

Start the backend:

```bash
npm run dev
```

The API server should run on `http://localhost:5000` unless you set a different port.

### 3. Configure and start the frontend

Open a **second terminal** and run:

```bash
cd BrainBoost/frontend
npm install
npm run dev
```

Vite will print the local development URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

### 4. Create a production build

From the `frontend` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔗 Project Links

- **GitHub Repository:** https://github.com/SagorOST/BrainBoost
- **Live Demo:** Add your deployed frontend URL here.
- **Backend API:** Add your deployed backend URL here.

> The repository includes Vercel configuration for the frontend. Replace the demo placeholders above with the actual deployment URLs once they are confirmed.

## 🔒 Environment Variables & Security

- Keep real credentials in `backend/.env`.
- Never commit database passwords, JWT secrets, or admin credentials.
- Use `.env.example` only for placeholder values.
- For production, configure HTTPS, secure cookie settings, CORS origins, and deployment environment variables appropriately.

## 🛣️ Future Improvements

- Add a public leaderboard and richer performance analytics.
- Support True/False and short-answer questions.
- Improve quiz discovery with search, filters, and pagination.
- Add stronger role-based workflows for students, teachers, and administrators.
- Add automated tests and improve production monitoring.

## 👨‍💻 Contributors

- **Sagor Dev**
- **Anto Deb Shuvo**

## 🎓 Academic Project

Developed as a Web Programming Lab project for the Department of Computer Science & Engineering, Metropolitan University, Sylhet.

---

<div align="center">

**BrainBoost — Learn, Practice, Improve. 🚀**

</div>
