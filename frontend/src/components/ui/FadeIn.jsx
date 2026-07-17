import { useScrollFade } from "../../hooks/useScrollFade.js";
import clsx from "clsx";

export default function FadeIn({ as: Component = "div", delay = 0, className, children, ...props }) {
  const ref = useScrollFade();
  return (
    <Component
      ref={ref}
      className={clsx("fade-in-up", className)}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  );
}
