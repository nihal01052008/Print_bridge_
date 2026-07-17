import { FileStack, Radio, ShieldCheck, Smartphone } from "lucide-react";
import FadeIn from "../ui/FadeIn.jsx";
import GlassCard from "../ui/GlassCard.jsx";

const features = [
  {
    icon: Smartphone,
    title: "Any device",
    description: "Phone, tablet, or laptop — if it can open a file, it can send it to print.",
  },
  {
    icon: Radio,
    title: "Live status",
    description: "Watch your order move from received to printing to ready, in real time.",
  },
  {
    icon: FileStack,
    title: "Every format",
    description: "PDFs, Word docs, and images — set copies, color, and paper size before you send.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing left behind",
    description: "Files are cleared after pickup. No drive to forget, nothing lingering on a shop PC.",
  },
];

export default function Features() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="max-w-xl">
          <h2 className="font-display text-4xl tracking-tight text-ink">Built for the walk-in</h2>
          <p className="mt-4 text-ink-faint text-lg">
            Everything about printing except the printer, handled before you arrive.
          </p>
        </FadeIn>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 100}>
              <GlassCard hover className="p-7 h-full">
                <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-dim text-accent">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-faint leading-relaxed">{f.description}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
