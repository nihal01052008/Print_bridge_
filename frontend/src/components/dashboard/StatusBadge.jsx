import clsx from "clsx";
import { Clock, Printer, PackageCheck, CheckCircle2, XCircle, Eye } from "lucide-react";

const config = {
  pending: { label: "Pending", icon: Clock, className: "bg-stamp/15 text-stamp" },
  preview: { label: "Previewing", icon: Eye, className: "bg-amber-500/15 text-amber-600" },
  printing: { label: "Printing", icon: Printer, className: "bg-accent-dim text-accent" },
  ready: { label: "Ready", icon: PackageCheck, className: "bg-emerald-500/15 text-emerald-600" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-ink/10 text-ink-faint" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-rose-500/15 text-rose-600" },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.pending;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium", c.className)}>
      <c.icon size={12} />
      {c.label}
    </span>
  );
}
