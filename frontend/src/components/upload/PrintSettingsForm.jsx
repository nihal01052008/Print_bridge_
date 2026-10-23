import Segmented from "../ui/Segmented.jsx";
import { Minus, Plus } from "lucide-react";

const colorOptions = [
  { value: "bw", label: "Black & white" },
  { value: "color", label: "Color" },
];
const sidesOptions = [
  { value: "single", label: "Single-sided" },
  { value: "double", label: "Double-sided" },
];
const paperOptions = [
  { value: "A4", label: "A4" },
  { value: "A3", label: "A3" },
  { value: "Letter", label: "Letter" },
  { value: "Legal", label: "Legal" },
];

export default function PrintSettingsForm({ values, onChange }) {
  function set(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-ink-soft" htmlFor="customerName">
            Your name <span className="text-ink-faint font-normal">(optional)</span>
          </label>
          <input
            id="customerName"
            type="text"
            value={values.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="mt-2 w-full glass rounded-2xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-soft" htmlFor="customerPhone">
            Phone <span className="text-ink-faint font-normal">(optional)</span>
          </label>
          <input
            id="customerPhone"
            type="tel"
            value={values.customerPhone}
            onChange={(e) => set("customerPhone", e.target.value)}
            placeholder="For pickup updates"
            className="mt-2 w-full glass rounded-2xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink-soft mb-2">Copies</p>
        <div className="glass inline-flex items-center rounded-2xl p-1">
          <button
            type="button"
            onClick={() => set("copies", Math.max(1, values.copies - 1))}
            className="w-10 h-10 grid place-items-center rounded-xl text-ink-soft hover:text-ink transition-colors"
            aria-label="Decrease copies"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center font-medium text-ink">{values.copies}</span>
          <button
            type="button"
            onClick={() => set("copies", Math.min(99, values.copies + 1))}
            className="w-10 h-10 grid place-items-center rounded-xl text-ink-soft hover:text-ink transition-colors"
            aria-label="Increase copies"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink-soft mb-2">Color</p>
        <Segmented name="Color" options={colorOptions} value={values.colorMode} onChange={(v) => set("colorMode", v)} />
      </div>

      <div>
        <p className="text-sm font-medium text-ink-soft mb-2">Sides</p>
        <Segmented name="Sides" options={sidesOptions} value={values.sides} onChange={(v) => set("sides", v)} />
      </div>

      <div>
        <p className="text-sm font-medium text-ink-soft mb-2">Paper size</p>
        <Segmented name="Paper size" options={paperOptions} value={values.paperSize} onChange={(v) => set("paperSize", v)} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-soft" htmlFor="notes">
          Notes for the shop <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. staple pages, print on cardstock"
          className="mt-2 w-full glass rounded-2xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
        />
      </div>
    </div>
  );
}
