"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const crafts = [
  {
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
    title: "The Weavers",
    desc: "Generations of families who speak in thread and loom. Each piece takes weeks — sometimes months — to complete.",
  },
  {
    img: "https://images.unsplash.com/photo-1609748340878-f98837ade498?w=600&h=800&fit=crop",
    title: "The Embroiderers",
    desc: "Hands that turn plain fabric into gardens, galaxies, and stories. Zardozi, chikankari, phulkari — each stitch has a name.",
  },
  {
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
    title: "The Jewelers",
    desc: "Gold, silver, and precious stones shaped into wearable heirlooms. Techniques passed down through centuries, unchanged.",
  },
];

function CraftCard({
  craft,
  index,
}: {
  craft: (typeof crafts)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="aspect-[3/4] overflow-hidden mb-4 relative">
        <motion.img
          src={craft.img}
          alt={craft.title}
          style={reduce ? undefined : { y: imgY, scale: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
        />
      </div>
      <motion.h3
        whileHover={{ x: 4 }}
        transition={{ duration: 0.3 }}
        className="text-lg tracking-wide text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {craft.title}
      </motion.h3>
      <p className="text-sm text-[#8A8280] leading-relaxed">{craft.desc}</p>
    </motion.div>
  );
}

export default function DiscoverCrafts() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {crafts.map((craft, i) => (
            <CraftCard key={craft.title} craft={craft} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
