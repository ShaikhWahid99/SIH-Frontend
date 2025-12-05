import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const TrainerProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { trainer, isTrainerAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isTrainerAuthenticated || !trainer) {
    return <Navigate to="/trainer-login" replace />;
  }

  return children;
};

export default TrainerProtectedRoute;
