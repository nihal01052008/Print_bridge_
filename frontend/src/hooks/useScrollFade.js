import { useEffect, useRef } from "react";

/** Attach to any element; adds `.is-visible` to trigger the `.fade-in-up` CSS transition. */
export function useScrollFade(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.unobserve(node);
      }
    }, optionsRef.current);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
