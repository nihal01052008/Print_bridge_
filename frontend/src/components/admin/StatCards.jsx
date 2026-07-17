import GlassCard from "../ui/GlassCard.jsx";
import Counter from "../ui/Counter.jsx";

export default function StatCards({ stats }) {
  const cards = [
    { label: "Total shops", value: stats.totalShops },
    { label: "Active shops", value: stats.activeShops },
    { label: "Total orders", value: stats.totalOrders },
    { label: "Orders today", value: stats.ordersToday },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <GlassCard key={c.label} className="p-5">
          <p className="font-display text-3xl text-ink">
            <Counter to={c.value} duration={900} />
          </p>
          <p className="text-sm text-ink-faint mt-1">{c.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}
