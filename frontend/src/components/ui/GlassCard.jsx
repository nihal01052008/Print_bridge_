import clsx from "clsx";

export default function GlassCard({ as: Component = "div", strong = false, hover = false, className, children, ...props }) {
  return (
    <Component
      className={clsx(
        strong ? "glass-strong" : "glass",
        hover && "transition-transform duration-300 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
