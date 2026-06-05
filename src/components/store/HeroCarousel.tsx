"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1800&h=1200&fit=crop",
    collection: "Rosalie",
    cta: "Shop Now",
  },
  {
    image: "https://images.unsplash.com/photo-1609748340878-f98837ade498?w=1800&h=1200&fit=crop",
    collection: "Heritage",
    cta: "Explore",
  },
  {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1800&h=1200&fit=crop",
    collection: "Ethereal",
    cta: "Discover",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 0.7]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[85vh] sm:h-[90vh] md:h-[95vh] overflow-hidden bg-black"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <motion.div
            style={reduce ? undefined : { y: imageY, scale: imageScale }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={slides[current].image}
              alt={slides[current].collection}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            style={{ opacity: reduce ? 0.3 : overlayOpacity }}
            className="absolute inset-0 bg-black"
          />

          <motion.div
            style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
            className="absolute inset-0 flex items-end"
          >
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 w-full pb-16 sm:pb-20 md:pb-28">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.p
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#D4A537] mb-4 sm:mb-6"
                >
                  Collection &mdash; SS&apos;26
                </motion.p>

                <h1
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] text-white font-light leading-[0.85] tracking-wide overflow-hidden"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <motion.span
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {slides[current].collection}
                  </motion.span>
                </h1>

                <motion.a
                  href="/#lookbook"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block mt-6 sm:mt-8"
                >
                  <button className="relative px-10 sm:px-14 py-3.5 sm:py-4 bg-white text-black text-[11px] sm:text-xs tracking-[0.25em] uppercase border-2 border-white overflow-hidden group">
                    <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                      {slides[current].cta}
                    </span>
                    <motion.span
                      className="absolute inset-0 bg-black"
                      initial={{ y: "100%" }}
                      whileHover={{ y: "0%" }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </button>
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrent(i)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              width: i === current ? 32 : 6,
              backgroundColor:
                i === current ? "rgb(255,255,255)" : "rgba(255,255,255,0.4)",
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-20 right-6 sm:right-10 hidden md:flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase rotate-90 origin-center mb-6">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [0, 1, 0], originY: [0, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-white/40 origin-top"
        />
      </motion.div>
    </section>
  );
}
