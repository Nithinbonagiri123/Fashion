"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

interface MagneticLinkProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function MagneticLink({
  children,
  strength = 0.25,
  className,
  onClick,
  href,
}: MagneticLinkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 18 });
  const y = useSpring(my, { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * strength);
    my.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} style={{ display: "inline-block" }}>
        {inner}
      </a>
    );
  }
  return inner;
}
