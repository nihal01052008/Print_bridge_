import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Shield, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import LoginForm from "../components/auth/LoginForm.jsx";
import DashboardTopbar from "../components/dashboard/DashboardTopbar.jsx";
import SearchBar from "../components/dashboard/SearchBar.jsx";
import StatCards from "../components/admin/StatCards.jsx";
import ShopRow from "../components/admin/ShopRow.jsx";
import CreateShopModal from "../components/admin/CreateShopModal.jsx";
import AdminOrderRow from "../components/admin/AdminOrderRow.jsx";
import Button from "../components/ui/Button.jsx";
import api from "../lib/api.js";

export default function AdminDashboard() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper">
        <Loader2 className="animate-spin text-ink-faint" size={24} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen grid place-items-center bg-paper px-6">
        <LoginForm
          title="Admin sign in"
          subtitle="Manage shops and monitor activity"
          icon={Shield}
          onSubmit={async (email, password) => {
            const loggedIn = await login(email, password);
            if (loggedIn.role !== "admin") {
              throw { response: { data: { message: "This login isn't registered as an admin." } } };
            }
          }}
        />
      </div>
    );
  }

  return <AdminDashboardContent onLogout={logout} />;
}

function AdminDashboardContent({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [shopSearch, setShopSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [loadingShops, setLoadingShops] = useState(true);

  const loadStats = useCallback(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.stats));
  }, []);

  const loadShops = useCallback(() => {
    setLoadingShops(true);
    api
      .get("/shops", { params: shopSearch ? { search: shopSearch } : {} })
      .then((res) => setShops(res.data.shops))
      .finally(() => setLoadingShops(false));
  }, [shopSearch]);

  const loadRecentOrders = useCallback(() => {
    api.get("/admin/orders/recent").then((res) => setRecentOrders(res.data.orders));
  }, []);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, [loadStats, loadRecentOrders]);

  useEffect(() => {
    const debounce = setTimeout(loadShops, shopSearch ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [loadShops, shopSearch]);

  async function handleCreateShop(form) {
    await api.post("/shops", form);
    loadShops();
    loadStats();
  }

  async function handleToggleActive(shop) {
    const res = await api.patch(`/shops/${shop._id}`, { isActive: !shop.isActive });
    setShops((prev) => prev.map((s) => (s._id === shop._id ? { ...s, ...res.data.shop } : s)));
    loadStats();
  }

  async function handleApproveShop(shop) {
    const res = await api.patch(`/shops/${shop._id}`, { isApproved: true });
    setShops((prev) => prev.map((s) => (s._id === shop._id ? { ...s, ...res.data.shop } : s)));
    loadStats();
  }

  async function handleDelete(shop) {
    await api.delete(`/shops/${shop._id}`);
    setShops((prev) => prev.filter((s) => s._id !== shop._id));
    loadStats();
  }

  const approvedShops = shops.filter((s) => s.isApproved !== false);
  const pendingShops = shops.filter((s) => s.isApproved === false);

  return (
    <div className="min-h-screen bg-paper">
      <DashboardTopbar title="PrintBridge Admin" subtitle="System overview" onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {stats ? (
          <StatCards stats={stats} />
        ) : (
          <div className="flex justify-center py-10 text-ink-faint">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Shops</h2>
            <div className="flex gap-3">
              <SearchBar value={shopSearch} onChange={setShopSearch} placeholder="Search shops" />
              <Button variant="primary" size="md" onClick={() => setModalOpen(true)} className="shrink-0">
                <Plus size={16} /> Add shop
              </Button>
            </div>
          </div>

          {/* Collapsible Application Requests */}
          {pendingShops.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[24px] p-5">
              <button
                onClick={() => setRequestsOpen(!requestsOpen)}
                className="flex items-center justify-between w-full text-left font-display text-lg text-ink focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Application Requests ({pendingShops.length})</span>
                </div>
                <span className="text-xs text-ink-faint underline">
                  {requestsOpen ? "Hide requests" : "View requests"}
                </span>
              </button>

              <AnimatePresence>
                {requestsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4 space-y-3"
                  >
                    <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                      {pendingShops.map((shop) => (
                        <div
                          key={shop._id}
                          className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-amber-500/20"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-ink">{shop.name}</p>
                            <p className="text-xs text-ink-faint mt-1">/upload/{shop.slug}</p>
                            <p className="text-xs text-ink-faint mt-0.5">Owner: {shop.email}</p>
                            {shop.phone && <p className="text-xs text-ink-faint">Phone: {shop.phone}</p>}
                            {shop.address && <p className="text-xs text-ink-faint">Address: {shop.address}</p>}
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveShop(shop)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4"
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(shop)}
                              className="text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="space-y-3">
            {loadingShops ? (
              <div className="flex justify-center py-12 text-ink-faint">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : approvedShops.length === 0 ? (
              <p className="text-center text-ink-faint py-12">No shops yet — add the first one.</p>
            ) : (
              approvedShops.map((shop) => {
                const shopOrders = recentOrders.filter(
                  (order) => (order.shop?._id || order.shop) === shop._id
                );
                return (
                  <ShopRow
                    key={shop._id}
                    shop={shop}
                    orders={shopOrders}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                );
              })
            )}
          </div>
        </section>
      </main>

      <CreateShopModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateShop} />
    </div>
  );
}
