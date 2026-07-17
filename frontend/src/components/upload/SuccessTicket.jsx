import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Clock, Printer, PackageCheck, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import api from "../../lib/api.js";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, className: "text-stamp" },
  preview: { label: "Previewing", icon: Eye, className: "text-amber-600 animate-pulse" },
  printing: { label: "Printing", icon: Printer, className: "text-accent animate-pulse" },
  ready: { label: "Ready for Pickup", icon: PackageCheck, className: "text-emerald-600 font-semibold" },
  completed: { label: "Completed", icon: CheckCircle2, className: "text-ink-faint" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "text-rose-600" },
};

export default function SuccessTicket({ order, shopName, onNewOrder }) {
  const [currentOrder, setCurrentOrder] = useState(order);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get(`/orders/lookup/${order.orderCode}`)
        .then((res) => {
          if (res.data.order) {
            setCurrentOrder(res.data.order);
          }
        })
        .catch((err) => console.error("Error polling order status:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [order.orderCode]);

  const statusInfo = STATUS_CONFIG[currentOrder.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-md mx-auto text-center"
    >
      <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-dim text-accent grid place-items-center">
        <CheckCircle2 size={26} />
      </div>
      <h2 className="mt-5 font-display text-3xl text-ink">Order sent</h2>
      <p className="mt-2 text-ink-faint">
        Show this code at <span className="text-ink font-medium">{shopName}</span> when you arrive.
      </p>

      <div className="glass-strong mt-8 p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-faint tracking-wide uppercase">Pickup ticket</span>
          <span className={`flex items-center gap-1.5 text-xs font-medium ${statusInfo.className}`}>
            <StatusIcon size={14} /> {statusInfo.label}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-dim text-accent">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              {order.files.length} file{order.files.length > 1 ? "s" : ""} · {order.printSettings.copies} {order.printSettings.copies > 1 ? "copies" : "copy"}
            </p>
            <p className="text-xs text-ink-faint">
              {order.printSettings.colorMode === "bw" ? "Black & white" : "Color"} · {order.printSettings.sides === "double" ? "Double-sided" : "Single-sided"}
            </p>
          </div>
        </div>

        <div
          className="my-6 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(28,28,30,0.18) 0 6px, transparent 6px 12px)",
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-faint">Pickup code</p>
            <p className="font-display text-3xl tracking-wider text-ink">{order.orderCode}</p>
          </div>
          <div className="bg-white p-2 rounded-xl shrink-0">
            <QRCodeSVG value={order.orderCode} size={72} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary" size="md" onClick={onNewOrder}>
          Send another file
        </Button>
        <Button as={Link} to="/" variant="primary" size="md">
          Back to home
        </Button>
      </div>
    </motion.div>
  );
}
