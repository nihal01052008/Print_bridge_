import clsx from "clsx";

export default function Segmented({ options, value, onChange, name }) {
  return (
    <div className="glass inline-flex p-1 rounded-2xl" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            value === opt.value ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
