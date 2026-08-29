import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import StartQuiz from "./pages/StartQuiz";
import RecentPhage from "./pages/RecentPhage";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/account" element={<Account />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startquiz"
        element={
          <ProtectedRoute>
            <StartQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recentphage"
        element={
          <ProtectedRoute>
            <RecentPhage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
