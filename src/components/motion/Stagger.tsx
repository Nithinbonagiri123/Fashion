"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  step?: number;
  className?: string;
  amount?: number;
  once?: boolean;
}

export function Stagger({
  children,
  delay = 0,
  step = 0.08,
  className,
  amount = 0.2,
  once = true,
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: step, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

export function StaggerItem({ children, className, distance = 24 }: StaggerItemProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
