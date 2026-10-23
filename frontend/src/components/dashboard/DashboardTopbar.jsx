import { LogOut, Printer } from "lucide-react";

export default function DashboardTopbar({ title, subtitle, onLogout, children }) {
  return (
    <header className="sticky top-0 z-40 pt-5 pb-3 px-6 bg-paper/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto glass flex items-center justify-between px-5 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-accent text-paper shrink-0">
            <Printer size={16} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink truncate">{title}</p>
            {subtitle && <p className="text-xs text-ink-faint truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {children}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors px-3 py-2"
          >
            <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
