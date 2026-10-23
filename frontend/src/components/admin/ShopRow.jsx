import { useState } from "react";
import { Trash2, Loader2, MapPin } from "lucide-react";
import clsx from "clsx";
import GlassCard from "../ui/GlassCard.jsx";

export default function ShopRow({ shop, orders = [], onToggleActive, onDelete }) {
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    try {
      await onToggleActive(shop);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${shop.name}? Its order history will be kept, but the shop login will be deleted.`)) return;
    setBusy(true);
    try {
      await onDelete(shop);
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-ink">{shop.name}</p>
            <span
              className={clsx(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                shop.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-ink/10 text-ink-faint"
              )}
            >
              {shop.isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <p className="text-sm text-ink-faint mt-1">/upload/{shop.slug}</p>
          {shop.address && (
            <p className="text-xs text-ink-faint mt-1 flex items-center gap-1">
              <MapPin size={11} /> {shop.address}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{shop.totalOrders ?? 0}</span> orders
          </p>
          <button
            onClick={handleToggle}
            disabled={busy}
            className="text-xs font-medium text-accent hover:text-ink transition-colors disabled:opacity-50"
          >
            {shop.isActive ? "Suspend" : "Reactivate"}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-ink-faint hover:text-rose-600 transition-colors disabled:opacity-50"
            aria-label={`Remove ${shop.name}`}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Minimized Scrollable Dedicated Shop Uploads Queue */}
      <div className="mt-1 border-t border-ink/5 pt-3 w-full">
        <p className="text-[10px] font-semibold text-ink-soft mb-2 tracking-wide uppercase">Dedicated Shop Uploads Queue:</p>
        {orders.length === 0 ? (
          <p className="text-xs text-ink-faint italic py-2">No uploads for this shop yet.</p>
        ) : (
          <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            {orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between text-xs bg-paper-dim/60 p-2.5 rounded-xl gap-2 border border-ink/5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-ink">{order.customerName}</span>
                    <span className="text-ink-faint">·</span>
                    <span className="font-display tracking-wider text-ink-soft text-[10px]">{order.orderCode}</span>
                  </div>
                  <div className="text-ink-faint text-[10px] mt-0.5 truncate" title={order.files.map(f => f.originalName).join(", ")}>
                    Files: {order.files.map(f => f.originalName).join(", ")}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-ink-faint text-[10px]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-accent-dim text-accent">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
