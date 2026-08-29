import axios from "axios";

// Every PHP file (login.php, save_quiz_result.php, etc.) becomes a route
// under this single Express API base URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send/receive the httpOnly auth cookie
});

export default api;
