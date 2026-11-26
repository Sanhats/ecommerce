"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, className, id }: { children: React.ReactNode; className: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: .12, rootMargin: "0px 0px -40px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={ref} id={id} className={`scroll-reveal ${className}${visible ? " is-visible" : ""}`}>{children}</section>;
}
