import GlassCard from "../ui/GlassCard.jsx";

export default function StatsStrip({ orders }) {
  const today = new Date().toDateString();
  const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const printing = orders.filter((o) => o.status === "printing").length;
  const ready = orders.filter((o) => o.status === "ready").length;

  const stats = [
    { label: "Today", value: todayCount },
    { label: "Pending", value: pending },
    { label: "Printing", value: printing },
    { label: "Ready", value: ready },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <GlassCard key={s.label} className="px-4 py-3 text-center">
          <p className="font-display text-2xl text-ink">{s.value}</p>
          <p className="text-xs text-ink-faint mt-0.5">{s.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}
