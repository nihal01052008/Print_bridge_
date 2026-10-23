import FadeIn from "../ui/FadeIn.jsx";
import Counter from "../ui/Counter.jsx";
import GlassCard from "../ui/GlassCard.jsx";

const stats = [
  { to: 120, suffix: "+", label: "Print shops connected" },
  { to: 40, suffix: "K+", label: "Files printed so far" },
  { to: 90, suffix: "s", label: "Average pickup wait", prefix: "~" },
];

export default function Stats() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <GlassCard strong className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink/10 p-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-6 sm:py-0">
                <p className="font-display text-4xl text-ink">
                  <Counter to={stat.to} suffix={stat.suffix} prefix={stat.prefix || ""} />
                </p>
                <p className="mt-2 text-sm text-ink-faint">{stat.label}</p>
              </div>
            ))}
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  );
}
