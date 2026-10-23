import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import PageLoader from "../layout/PageLoader.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}