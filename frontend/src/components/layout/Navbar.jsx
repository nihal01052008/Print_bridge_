import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Printer } from "lucide-react";
import Button from "../ui/Button.jsx";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For shops", href: "#for-shops" },
];

export default function Navbar({ onScanClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () => {
    if (onScanClick) {
      onScanClick();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <nav
          className={`glass flex items-center justify-between px-5 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-ink">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-accent text-paper">
              <Printer size={16} strokeWidth={2.5} />
            </span>
            PrintBridge
          </Link>
 
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-ink-soft hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
 
          <div className="hidden md:flex items-center gap-3">
            <Link to="/shop/dashboard" className="text-sm text-ink-soft hover:text-ink transition-colors px-3">
              Shop login
            </Link>
            <Button onClick={handleGetStarted} variant="primary" size="sm">
              Scan Shop QR
            </Button>
          </div>
 
          <button
            className="md:hidden grid place-items-center w-9 h-9 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>
 
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden mx-6 mt-3"
          >
            <div className="glass-strong flex flex-col gap-1 p-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-2xl text-ink-soft hover:bg-white/60 hover:text-ink transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/shop/dashboard"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-ink-soft hover:bg-white/60 hover:text-ink transition-colors"
              >
                Shop login
              </Link>
              <Button
                onClick={() => {
                  setOpen(false);
                  handleGetStarted();
                }}
                variant="primary"
                size="md"
                className="mt-1"
              >
                Scan Shop QR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
