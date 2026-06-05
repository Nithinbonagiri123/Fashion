"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B1120] text-white relative overflow-hidden">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-px bg-gradient-to-r from-transparent via-[#D4A537]/60 to-transparent origin-left"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12" step={0.1}>
          <StaggerItem className="sm:col-span-2 md:col-span-1">
            <h3
              className="text-xl tracking-[0.2em] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              VASTRA VIRASAT
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              A curated lookbook of handcrafted Indian garments. Each piece is a
              story of human patience and artistry.
            </p>
          </StaggerItem>

          <StaggerItem>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              {["Women", "Men", "Accessories", "Bridal", "Sale"].map((label) => (
                <li key={label}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 4, color: "#ffffff" }}
                    transition={{ duration: 0.2 }}
                    className={`inline-block transition-colors ${
                      label === "Sale" ? "text-[#D4A537]" : ""
                    }`}
                  >
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Help
            </h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              {["Shipping Info", "Returns & Exchanges", "Size Guide", "Contact Us"].map(
                (label) => (
                  <li key={label}>
                    <motion.span
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {label}
                    </motion.span>
                  </li>
                )
              )}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Get 10% Off
            </h4>
            <p className="text-white/40 text-sm mb-4">
              Subscribe for new arrivals and exclusive offers.
            </p>
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[#D4A537]"
              >
                Welcome to the family.
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
                />
                <motion.button
                  type="submit"
                  whileHover={{ backgroundColor: "#D4A537", color: "#000" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white text-[#0B1120] px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase"
                >
                  Join
                </motion.button>
              </form>
            )}
          </StaggerItem>
        </Stagger>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-[10px] text-white/20 tracking-wide">
            &copy; 2026 Vastra Virasat. All rights reserved.
          </p>
          <p className="text-[10px] text-white/20 tracking-wide">
            Handcrafted with love across India
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
