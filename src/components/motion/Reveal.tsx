"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "ul" | "header" | "footer";
}

const offset = (d: Direction, dist: number) => {
  switch (d) {
    case "up": return { y: dist };
    case "down": return { y: -dist };
    case "left": return { x: dist };
    case "right": return { x: -dist };
    default: return {};
  }
};

export default function Reveal({
  children,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 0.8,
  once = true,
  amount = 0.2,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, ...offset(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduce ? 0.2 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
