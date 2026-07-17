import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink/5 mt-32">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-ink">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-accent text-paper">
            <Printer size={14} strokeWidth={2.5} />
          </span>
          PrintBridge
        </Link>
        <p className="text-sm text-ink-faint text-center">
          Faster, paperless printing between customers and local print shops.
        </p>
        <div className="flex items-center gap-6 text-sm text-ink-faint">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <Link to="/shop/dashboard" className="hover:text-ink transition-colors">Shop login</Link>
          <Link to="/admin/dashboard" className="hover:text-ink transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
