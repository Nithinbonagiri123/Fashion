"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";

export default function DiscoverStory() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal direction="up" distance={20}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] mb-4">
            The Vision
          </p>
          <h2
            className="text-2xl sm:text-3xl tracking-wide text-[#1A1A1A] mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Fashion That Listens
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mb-8 origin-center"
          />
        </Reveal>

        <Reveal direction="up" delay={0.1} distance={20}>
          <p className="text-[#6B6462] leading-relaxed mb-6">
            Vastra Virasat is not a typical fashion store. We are a curated
            lookbook of 60 handcrafted Indian garments — each one a story of
            artistry, patience, and tradition.
          </p>
        </Reveal>
        <Reveal direction="up" delay={0.2} distance={20}>
          <p className="text-[#6B6462] leading-relaxed mb-6">
            Instead of guessing what to stock, we let you decide. Browse our
            collection, double-tap the pieces you love, and we craft what gets
            the most demand. Your vote directly shapes what our artisans create
            next.
          </p>
        </Reveal>
        <Reveal direction="up" delay={0.3} distance={20}>
          <p className="text-[#6B6462] leading-relaxed">
            Every saree, lehenga, kurta, and piece of jewelry in this
            collection was made by hand — by weavers, embroiderers, and
            craftspeople whose families have practised these arts for
            generations. When you show love for a piece, you are not just
            voting — you are keeping a craft alive.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
