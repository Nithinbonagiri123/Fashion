"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface DiscoverHeroProps {
  image: string;
}

export default function DiscoverHero({ image }: DiscoverHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[50vh] sm:h-[60vh] overflow-hidden bg-black"
    >
      <motion.div
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src={image}
          alt="Discover"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="absolute inset-0 flex items-center justify-center text-center px-6"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] tracking-[0.4em] uppercase text-white/50 mb-3"
          >
            Our Story
          </motion.p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide overflow-hidden"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              Discover
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/50 text-sm sm:text-base mt-3 max-w-lg mx-auto"
          >
            A curated lookbook where your love shapes what gets crafted next.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
