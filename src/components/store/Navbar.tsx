"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";

const navLinks = [
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Accessories", href: "/accessories" },
  { label: "Bridal", href: "/bridal" },
  { label: "Discover", href: "/discover" },
  { label: "Sale", href: "/sale" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname() ?? "/";

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 30));

  const height = useTransform(scrollY, [0, 120], [64, 52]);
  const backdropFilter = useTransform(
    scrollY,
    [0, 80],
    ["blur(0px) saturate(1)", "blur(14px) saturate(1.4)"]
  );
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(11, 17, 32, 1)", "rgba(11, 17, 32, 0.78)"]
  );

  return (
    <motion.header
      style={{ backdropFilter }}
      className="sticky top-0 z-40 w-full"
    >
      <motion.div
        style={{ backgroundColor }}
        className="w-full"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <motion.div
            style={{ height }}
            className="flex items-center justify-between"
          >
            <Link href="/" className="shrink-0">
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white text-lg sm:text-xl tracking-[0.3em] font-normal inline-block"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                VASTRA VIRASAT
              </motion.span>
            </Link>

            <LayoutGroup id="nav">
              <nav
                className="hidden lg:flex items-center gap-6 xl:gap-8"
                onMouseLeave={() => setHovered(null)}
              >
                {navLinks.map((link, i) => {
                  const active = pathname === link.href || pathname.startsWith(link.href + "/");
                  const isHighlight = hovered ? hovered === link.label : active;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }}
                      onMouseEnter={() => setHovered(link.label)}
                      className="relative"
                    >
                      <Link
                        href={link.href}
                        className={`relative block text-[11px] tracking-[0.18em] uppercase py-1.5 transition-colors duration-300 ${
                          isHighlight
                            ? "text-[#D4A537]"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                      {isHighlight && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute left-0 right-0 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#D4A537] to-transparent"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      {isHighlight && (
                        <motion.span
                          layoutId="nav-active-glow"
                          className="absolute -inset-x-2 -inset-y-1 -z-10 rounded-md bg-[#D4A537]/[0.06]"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </LayoutGroup>

            <div className="flex items-center gap-3 sm:gap-4">
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

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="md:hidden text-white/70 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/admin"
                  className="text-white/70 hover:text-white transition-colors block"
                >
                  <User className="w-5 h-5" />
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="lg:hidden text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "x" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/10 bg-[#0B1120]"
            >
              <nav className="px-6 py-3">
                {navLinks.map((link, i) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 py-3 text-sm tracking-[0.15em] uppercase border-b border-white/5 last:border-0 transition-colors ${
                          active ? "text-[#D4A537]" : "text-white/80"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="mobile-nav-active"
                            className="w-1 h-4 bg-[#D4A537] rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {scrolled && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.5 }}
          transition={{ duration: 0.4 }}
          className="h-px bg-gradient-to-r from-transparent via-[#D4A537]/40 to-transparent origin-center"
        />
      )}
    </motion.header>
  );
}
