import clsx from "clsx";
import { Check } from "lucide-react";

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-7 h-7 rounded-full grid place-items-center text-xs font-medium transition-colors duration-300",
                  state === "done" && "bg-accent text-paper",
                  state === "active" && "bg-ink text-paper",
                  state === "upcoming" && "bg-ink/10 text-ink-faint"
                )}
              >
                {state === "done" ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={clsx(
                  "text-sm hidden sm:inline transition-colors duration-300",
                  state === "upcoming" ? "text-ink-faint" : "text-ink"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-ink/10 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
