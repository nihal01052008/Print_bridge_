import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

export default function LoginForm({ title, subtitle, icon: Icon, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-8">
        {Icon && (
          <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-dim text-accent grid place-items-center">
            <Icon size={22} />
          </div>
        )}
        <h1 className="mt-4 font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-faint">{subtitle}</p>}
      </div>

      <GlassCard as="form" onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-soft" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full glass rounded-2xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
            placeholder="you@shop.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-soft" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full glass rounded-2xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <AlertCircle size={16} className="text-stamp shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full mt-2">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              <LogIn size={16} /> Sign in
            </>
          )}
        </Button>
      </GlassCard>
    </motion.div>
  );
}
