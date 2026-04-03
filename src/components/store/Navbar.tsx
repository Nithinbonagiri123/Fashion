"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";

const navLinks = [
  { label: "Women", href: "/#" },
  { label: "Men", href: "/#" },
  { label: "Accessories", href: "/#" },
  { label: "Bridal", href: "/#" },
  { label: "Discover", href: "/#how-it-works" },
  { label: "Sale", href: "/#", highlight: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1120]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left: Brand */}
          <Link href="/" className="shrink-0">
            <span
              className="text-white text-lg sm:text-xl tracking-[0.3em] font-normal"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              VASTRA VIRASAT
            </span>
          </Link>

          {/* Center: Nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-[11px] tracking-[0.18em] uppercase transition-colors ${
                  link.highlight
                    ? "text-[#D4A537] hover:text-[#F5E6B8]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Search + Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search bar (desktop) */}
            <div className="hidden md:flex items-center bg-white/10 rounded-sm overflow-hidden">
              <input
                type="text"
                placeholder="Try searching for..."
                className="bg-transparent text-white text-[11px] placeholder:text-white/30 px-3 py-1.5 w-40 lg:w-48 focus:outline-none"
              />
              <button className="px-2.5 text-white/50 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile search */}
            <button className="md:hidden text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* User */}
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button className="text-white/70 hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </button>

            {/* Mobile menu */}
            <button
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#0B1120]"
          >
            <nav className="px-6 py-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm tracking-[0.15em] uppercase border-b border-white/5 last:border-0 ${
                    link.highlight ? "text-[#D4A537]" : "text-white/80"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
