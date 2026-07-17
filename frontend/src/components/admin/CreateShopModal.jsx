import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

const empty = { name: "", slug: "", email: "", password: "", phone: "", address: "" };

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateShopModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate(form);
      setForm(empty);
      setSlugTouched(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the shop. Check the details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm grid place-items-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard strong as="form" onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl text-ink">Add a shop</h2>
                <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Shop name" value={form.name} onChange={(v) => set("name", v)} required />
                <Field
                  label="URL slug"
                  value={form.slug}
                  onChange={(v) => {
                    setSlugTouched(true);
                    set("slug", slugify(v));
                  }}
                  required
                  hint={form.slug ? `/upload/${form.slug}` : undefined}
                />
                <Field label="Owner email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
                <Field label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} required />
                <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
                <Field label="Address" value={form.address} onChange={(v) => set("address", v)} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-ink-soft mt-4">
                  <AlertCircle size={16} className="text-stamp shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full mt-5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Create shop"}
              </Button>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = "text", required, hint }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-soft">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full glass rounded-2xl px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {hint && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
    </div>
  );
}
