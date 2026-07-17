import { FileText } from "lucide-react";
import GlassCard from "../ui/GlassCard.jsx";
import StatusBadge from "../dashboard/StatusBadge.jsx";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminOrderRow({ order }) {
  return (
    <GlassCard className="p-4 flex items-center gap-4">
      <div className="grid place-items-center w-9 h-9 rounded-xl bg-accent-dim text-accent shrink-0">
        <FileText size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">
          <span className="font-medium">{order.customerName}</span> → {order.shop?.name || "Unknown shop"}
        </p>
        <p className="text-xs text-ink-faint">
          {order.orderCode} · {timeAgo(order.createdAt)}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </GlassCard>
  );
}
