import { Link } from "react-router-dom";
import { BellRing, BarChart3, Search } from "lucide-react";
import FadeIn from "../ui/FadeIn.jsx";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

const perks = [
  { icon: BellRing, text: "Display your shop's unique QR code at your counter for direct client uploads." },
  { icon: Search, text: "Receive orders on your dashboard in seconds, complete with print settings." },
  { icon: BarChart3, text: "Search, filter, and track all incoming walk-in print jobs in real time." },
];

export default function ForShops() {
  return (
    <section id="for-shops" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <GlassCard strong className="p-10 lg:p-14 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <FadeIn>
              <span className="text-xs font-medium text-accent uppercase tracking-wide">For print shops</span>
              <h2 className="mt-3 font-display text-3xl lg:text-4xl tracking-tight text-ink">
                Run your counter without the walk-up chaos
              </h2>
            </FadeIn>
            <div className="mt-8 space-y-4">
              {perks.map((perk, i) => (
                <FadeIn key={perk.text} delay={i * 100} className="flex items-start gap-3">
                  <div className="grid place-items-center w-9 h-9 rounded-lg bg-accent-dim text-accent shrink-0 mt-0.5">
                    <perk.icon size={16} />
                  </div>
                  <p className="text-ink-soft leading-relaxed">{perk.text}</p>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={200}>
            <Button as={Link} to="/shop/dashboard" variant="primary" size="hero" className="whitespace-nowrap">
              Open shop dashboard
            </Button>
          </FadeIn>
        </GlassCard>
      </div>
    </section>
  );
}
