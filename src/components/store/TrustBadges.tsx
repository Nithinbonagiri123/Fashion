"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Sparkles } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const badges = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹2,499" },
  { icon: RotateCcw, title: "Easy Returns", desc: "14-day hassle-free" },
  { icon: Shield, title: "Secure Checkout", desc: "100% protected" },
  { icon: Sparkles, title: "Handcrafted", desc: "Artisan-made in India" },
];

export default function TrustBadges() {
  return (
    <section className="bg-[#F8F5F0] border-y border-[#E8E2DA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Stagger
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E8E2DA]"
          step={0.12}
        >
          {badges.map((b) => (
            <StaggerItem
              key={b.title}
              className="flex flex-col items-center text-center py-6 sm:py-8 px-3 group cursor-default"
            >
              <motion.div
                whileHover={{
                  rotate: [0, -10, 10, -5, 5, 0],
                  scale: 1.15,
                  color: "#D4A537",
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2"
              >
                <b.icon className="w-5 h-5 text-[#B8860B]" strokeWidth={1.5} />
              </motion.div>
              <p className="text-[10px] tracking-[0.15em] uppercase font-medium text-[#1A1A1A]">
                {b.title}
              </p>
              <p className="text-[9px] text-[#8A8280] tracking-wide mt-0.5">
                {b.desc}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
