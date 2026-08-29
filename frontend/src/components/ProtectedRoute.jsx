import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Replaces auth_check.php - pages that did `require_once 'auth_check.php';`
// (Dashboard.php, startquiz.php, recentphage.php, get_quiz_questions.php)
// wrap their route with this component instead.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/account" replace />;

  return children;
}
