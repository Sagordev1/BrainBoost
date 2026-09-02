# BrainBoost — MERN Stack Version

Ei folder ta tomar original PHP + MySQL project (`brainboost/`) er MERN stack e convert kora version:
**M**ongoDB + **E**xpress + **R**eact + **N**ode.

A quiz-based interactive learning platform built with the MERN stack (React, Node.js, Express, MongoDB). 🔗 Live: brain-boost-nu.vercel.app

## Ki ki convert hoyeche (mapping)

| Purono PHP file | Notun jaiga |
|---|---|
| `db_connect.php`, MySQL tables | `backend/models/*.js` (Mongoose schemas, MongoDB) |
| `login.php`, `signup.php`, `logout.php`, `auth_check.php` | `backend/routes/authRoutes.js` + `backend/middleware/auth.js` (JWT cookie diye) |
| `update_profile.php` | `PUT /api/auth/profile` |
| `get_quiz_questions.php`, `save_quiz_result.php`, `check_exam_time.php` | `backend/routes/quizRoutes.js` |
| `save_contact.php` | `backend/routes/contactRoutes.js` |
| `admin.php`, `admin_config.php`, `save_chapter.php`, `save_exam_time.php`, `save_question.php`, `delete_question.php` | `backend/routes/adminRoutes.js` + `backend/middleware/adminAuth.js` |
| `index.html`, `about.php`, `account.php` + `Account.js`, `Dashboard.php`, `startquiz.php` + `startquiz.js`, `recentphage.php` + `Recentphage.js` | React pages, `frontend/src/pages/*.jsx` |
| Shob `.css` file | Shei nam-e `frontend/src/pages/*.css` e port kora hoyeche, prai hubohu shomoi |

Design (colors, layout, animation) ekdom age er moto rakha hoyeche — sudhu render engine ta PHP theke React hoyeche.

## Chalanor niyom (how to run)

### 1. MongoDB
Local e MongoDB install thakle `mongod` chalu koro, othoba [MongoDB Atlas](https://www.mongodb.com/atlas) e free cluster baniye connection string nao.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Ekhon `.env` file open kore:
- `MONGO_URI` e tomar MongoDB connection string dao
- `JWT_SECRET` ar `ADMIN_JWT_SECRET` e long random string dao (jekono kichu type korle hobe)
- Admin password set korar jonno:
  ```bash
  node scripts/hashAdminPassword.js "tomar_admin_password"
  ```
  Ei command ja print korbe, seta `.env` er `ADMIN_PASSWORD_HASH` e copy-paste koro.

Tarpor server chalao:
```bash
npm run dev
```
Server chalbe `http://localhost:5000` e.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App khulbe `http://localhost:5173` e.

### 4. Admin panel
`http://localhost:5173/admin` e giye tomar set kora password diye login koro. Ekhan theke exam time, active chapter, ar quiz question shob add/delete kora jabe.

## Notun jinish (MERN e ja improve hoyeche)

- **Session er bodole JWT cookie**: PHP `$_SESSION` er bodole ekhon `httpOnly` JWT cookie use hoy — REST API + React er jonno standard practice.
- **`.env` file**: DB password/JWT secret code er moddhe hardcode na kore `.env` e rakha hoyeche (tomar age`r `db_connect.php` te MySQL password sorasori code e lekha chilo — sheta security risk, tai MERN version e env variable use kora hoyeche).
- **Duplicate quiz attempt**: MongoDB compound unique index (`user + quizKey`) diye same behavior rakha hoyeche — ekbar quiz dile aar dewa jabe na.

## Note — ekta security point

Quiz question answer (`correctAnswer`) client-e pathano hoy jate JS diye grading kora jay — eta original PHP version e o emon-i chilo (`get_quiz_questions.php` shob shomoi correct answer pathato). Mane kew browser DevTools diye answer dekhe felte pare. Eta original project er design-i chilo, tai hubohu rakha hoyeche — chaile pore backend-e grading move kora jabe (ekta improvement hisebe).
