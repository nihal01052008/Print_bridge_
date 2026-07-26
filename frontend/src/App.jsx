import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import PageLoader from "./components/layout/PageLoader.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const CustomerUpload = lazy(() => import("./pages/CustomerUpload.jsx"));
const ShopDashboard = lazy(() => import("./pages/ShopDashboard.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<CustomerUpload />} />
          <Route path="/upload/:shopSlug" element={<CustomerUpload />} />
          <Route
            path="/shop/dashboard"
            element={
              <ProtectedRoute role="shop">
                <ShopDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
