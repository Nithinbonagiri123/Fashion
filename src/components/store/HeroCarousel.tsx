"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[85vh] sm:h-[90vh] md:h-[95vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].collection}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content — bottom left, like Lashkaraa */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 w-full pb-16 sm:pb-20 md:pb-28">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              >
                {/* Collection name — huge serif text */}
                <h1
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] text-white font-light leading-[0.85] tracking-wide"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {slides[current].collection}
                </h1>

                {/* CTA button */}
                <a href="/#lookbook">
                  <button className="mt-6 sm:mt-8 px-10 sm:px-14 py-3.5 sm:py-4 bg-white text-black text-[11px] sm:text-xs tracking-[0.25em] uppercase hover:bg-black hover:text-white border-2 border-white transition-all duration-500">
                    {slides[current].cta}
                  </button>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots at bottom center */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-500 ${
              i === current
                ? "w-8 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
