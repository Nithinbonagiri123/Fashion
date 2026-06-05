"use client";

import { motion } from "framer-motion";
import { Eye, Heart, Bell, ShoppingBag } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Reveal from "@/components/motion/Reveal";

const steps = [
  { icon: Eye, title: "Browse", desc: "Explore 60 handcrafted pieces in our curated lookbook" },
  { icon: Heart, title: "Vote", desc: "Double-tap or click the heart — your vote shapes what we stock" },
  { icon: Bell, title: "Get Notified", desc: "We'll tell you the moment your favourites are ready" },
  { icon: ShoppingBag, title: "Shop", desc: "Be first to own what you helped bring to life" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-[#F8F5F0] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12" direction="up">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] mb-2">
            The Vastra Virasat Way
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl tracking-wide text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mt-4 origin-center"
          />
        </Reveal>

        <Stagger
          className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          step={0.15}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent origin-left"
          />

          {steps.map((step, i) => (
            <StaggerItem key={step.title} className="text-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, borderColor: "#B8860B" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-14 h-14 mx-auto mb-3 rounded-full border border-[#E8E2DA] bg-[#F8F5F0] flex items-center justify-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <step.icon className="w-5 h-5 text-[#B8860B]" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#B8860B] mb-1">
                Step {i + 1}
              </p>
              <h3 className="font-medium text-sm text-[#1A1A1A] mb-1">
                {step.title}
              </h3>
              <p className="text-[11px] text-[#8A8280] leading-relaxed">
                {step.desc}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
