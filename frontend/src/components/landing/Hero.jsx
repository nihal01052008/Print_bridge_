import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, CheckCircle2, QrCode } from "lucide-react";
import Button from "../ui/Button.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero({ onScanClick }) {
  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      {/* Floating gradient blobs */}
      <div
        className="blob w-[420px] h-[420px] -top-32 -left-24"
        style={{ background: "radial-gradient(circle, var(--color-accent-soft), transparent 70%)" }}
      />
      <div
        className="blob w-[360px] h-[360px] top-20 right-0"
        style={{ background: "radial-gradient(circle, var(--color-stamp), transparent 70%)", animationDelay: "-6s" }}
      />
      <div
        className="blob w-[300px] h-[300px] bottom-0 left-1/3"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)", animationDelay: "-11s" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-medium text-ink-soft"
          >
            Now live across local print shops
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight text-ink mt-6"
          >
            Scan. Upload.
            <br />
            Print in Seconds.
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-lg text-ink-faint max-w-md leading-relaxed">
            Scan the QR code at your local partner shop to instantly send files directly to their print queue. No app, no account, no waiting in line.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button onClick={onScanClick} variant="primary" size="hero">
              Scan Shop QR
              <QrCode size={18} />
            </Button>
            <Button as={Link} to="/shop/dashboard" variant="secondary" size="hero">
              Open shop dashboard
              <ArrowRight size={18} />
            </Button>
          </motion.div>
        </div>

        {/* Signature element: a floating pickup-ticket card */}
        <motion.div variants={item} className="relative mx-auto lg:mx-0 w-full max-w-sm">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="glass-strong p-6 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-faint tracking-wide uppercase">Pickup ticket</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <CheckCircle2 size={14} /> Printing
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-dim text-accent">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Thesis_Final_v3.pdf</p>
                <p className="text-xs text-ink-faint">12 pages · Double-sided</p>
              </div>
            </div>

            {/* Perforated tear line, referencing an actual paper ticket */}
            <div
              className="my-6 h-px w-full"
              style={{
                backgroundImage: "repeating-linear-gradient(to right, rgba(28,28,30,0.18) 0 6px, transparent 6px 12px)",
              }}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-faint">Show this code at</p>
                <p className="text-sm font-medium text-ink">Campus Copy Corner</p>
              </div>
              <p className="font-display text-2xl tracking-wider text-ink">PB4X7Q9</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
