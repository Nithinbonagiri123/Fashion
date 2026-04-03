"use client";

import { motion } from "framer-motion";
import { Eye, Heart, Bell, ShoppingBag } from "lucide-react";

const steps = [
  { icon: Eye, title: "Browse", desc: "Explore 60 handcrafted pieces in our curated lookbook" },
  { icon: Heart, title: "Vote", desc: "Double-tap or click the heart \u2014 your vote shapes what we stock" },
  { icon: Bell, title: "Get Notified", desc: "We\u2019ll tell you the moment your favourites are ready" },
  { icon: ShoppingBag, title: "Shop", desc: "Be first to own what you helped bring to life" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-[#F8F5F0]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] mb-2">
            The Vastra Virasat Way
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl tracking-wide text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-[#E8E2DA] flex items-center justify-center">
                <step.icon className="w-5 h-5 text-[#B8860B]" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#B8860B] mb-1">
                Step {i + 1}
              </p>
              <h3 className="font-medium text-sm text-[#1A1A1A] mb-1">{step.title}</h3>
              <p className="text-[11px] text-[#8A8280] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
