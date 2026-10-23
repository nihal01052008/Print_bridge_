import clsx from "clsx";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-ink text-paper hover:bg-accent shadow-[0_8px_24px_rgba(28,28,30,0.18)] hover:shadow-[0_12px_32px_rgba(43,76,126,0.28)] hover:-translate-y-0.5",
  secondary: "glass text-ink hover:bg-white/70 hover:-translate-y-0.5",
  ghost: "text-ink-soft hover:text-ink",
};

const sizes = {
  hero: "h-[72px] px-9 rounded-[24px] text-base",
  md: "h-12 px-6 rounded-2xl text-sm",
  sm: "h-10 px-4 rounded-xl text-sm",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <Component className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Component>
  );
}
