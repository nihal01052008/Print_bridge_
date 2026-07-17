import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, Store, Pause, Play } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useShopSocket } from "../hooks/useShopSocket.js";
import LoginForm from "../components/auth/LoginForm.jsx";
import DashboardTopbar from "../components/dashboard/DashboardTopbar.jsx";
import QRPanel from "../components/dashboard/QRPanel.jsx";
import StatsStrip from "../components/dashboard/StatsStrip.jsx";
import FilterTabs from "../components/dashboard/FilterTabs.jsx";
import SearchBar from "../components/dashboard/SearchBar.jsx";
import OrderCard from "../components/dashboard/OrderCard.jsx";
import Button from "../components/ui/Button.jsx";
import RegisterShopModal from "../components/auth/RegisterShopModal.jsx";
import api from "../lib/api.js";

export default function ShopDashboard() {
  const { user, loading, login, logout } = useAuth();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  async function handleRegisterShop(form) {
    await api.post("/shops/register", form);
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper">
        <Loader2 className="animate-spin text-ink-faint" size={24} />
      </div>
    );
  }

  if (!user || user.role !== "shop") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-paper px-6 py-12">
        <LoginForm
          title="Shop sign in"
          subtitle="Manage incoming print orders"
          icon={Store}
          onSubmit={async (email, password) => {
            const loggedIn = await login(email, password);
            if (loggedIn.role !== "shop") {
              throw { response: { data: { message: "This login isn't registered as a shop." } } };
            }
          }}
        />
        <div className="mt-6 text-center text-sm">
          <span className="text-ink-faint">Don't have a registered shop yet? </span>
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="font-medium text-accent hover:text-ink transition-colors underline"
          >
            Apply to register your shop
          </button>
        </div>
        <RegisterShopModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onRegister={handleRegisterShop}
        />
      </div>
    );
  }

  return <ShopDashboardContent onLogout={logout} />;
}

function ShopDashboardContent({ onLogout }) {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [togglingAccept, setTogglingAccept] = useState(false);

  useEffect(() => {
    api.get("/shops/me").then((res) => setShop(res.data.shop));
  }, []);

  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    const request = query.trim()
      ? api.get("/orders/shop/search", { params: { q: query.trim() } })
      : api.get("/orders/shop/mine", { params: statusFilter ? { status: statusFilter } : {} });

    request.then((res) => setOrders(res.data.orders)).finally(() => setOrdersLoading(false));
  }, [statusFilter, query]);

  useEffect(() => {
    const debounce = setTimeout(loadOrders, query ? 350 : 0);
    return () => clearTimeout(debounce);
  }, [loadOrders, query]);

  useShopSocket(shop?._id, {
    onNew: (order) => {
      setOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set(prev).add(order._id));
      setTimeout(() => {
        setNewOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(order._id);
          return next;
        });
      }, 3000);
    },
    onUpdated: (order) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    },
  });

  async function updateStatus(orderId, status) {
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.order : o)));
  }

  async function toggleAccepting() {
    if (!shop) return;
    setTogglingAccept(true);
    try {
      const res = await api.patch(`/shops/${shop._id}`, { isAcceptingOrders: !shop.isAcceptingOrders });
      setShop(res.data.shop);
    } finally {
      setTogglingAccept(false);
    }
  }

  const visibleOrders = statusFilter && !query ? orders.filter((o) => o.status === statusFilter) : orders;

  if (!shop) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper">
        <Loader2 className="animate-spin text-ink-faint" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <DashboardTopbar title={shop.name} subtitle="Shop dashboard" onLogout={onLogout}>
        <Button variant="secondary" size="sm" onClick={toggleAccepting} disabled={togglingAccept}>
          {shop.isAcceptingOrders ? <Pause size={14} /> : <Play size={14} />}
          <span className="hidden sm:inline">{shop.isAcceptingOrders ? "Pause orders" : "Resume orders"}</span>
        </Button>
      </DashboardTopbar>

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <StatsStrip orders={orders} />

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <div className="mt-4">
            <FilterTabs value={statusFilter} onChange={setStatusFilter} />
          </div>

          <div className="mt-6 space-y-3">
            {ordersLoading ? (
              <div className="flex justify-center py-16 text-ink-faint">
                <Loader2 className="animate-spin" size={22} />
              </div>
            ) : visibleOrders.length === 0 ? (
              <p className="text-center text-ink-faint py-16">No orders here yet.</p>
            ) : (
              <AnimatePresence initial={false}>
                {visibleOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onUpdateStatus={updateStatus}
                    isNew={newOrderIds.has(order._id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <QRPanel shop={shop} />
        </div>
      </main>
    </div>
  );
}
