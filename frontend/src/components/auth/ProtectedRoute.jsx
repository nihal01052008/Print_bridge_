import { useAuth } from "../../hooks/useAuth.js";
import PageLoader from "../layout/PageLoader.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user || (role && user.role !== role)) {
    return null;
  }

  return children;
}
