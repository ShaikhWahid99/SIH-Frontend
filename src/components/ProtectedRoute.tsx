import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({
  children,
  requireOnboarded = true,
  requireQuiz = false
}: any) => {
  const { loading, user, isAuthenticated } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) return <Navigate to="/auth/login" replace />;

  if (requireOnboarded && !user.onboarded)
    return <Navigate to="/onboarding" replace />;

  if (requireQuiz && !user.quizCompleted)
    return <Navigate to="/quiz" replace />;

  return children;
};

export default ProtectedRoute;
