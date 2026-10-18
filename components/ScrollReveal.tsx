"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** delay dalam ms */
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  /** Arah kemunculan; default naik dari bawah. */
  variant?: "up" | "scale" | "left" | "right";
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  variant = "up",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Component = Tag as any;
  return (
    <Component
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${variant !== "up" ? `reveal-${variant}` : ""} ${shown ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
