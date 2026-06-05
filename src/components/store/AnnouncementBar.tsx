"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#0B1120] text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase overflow-hidden"
        >
          <div className="flex items-center h-8 sm:h-9">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-10 sm:gap-16 px-4">
              <span>50% Off Select Styles</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>Free Shipping on All Orders Above &#8377;2,499</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>Sale Upto 50% Off</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>Free Shipping on All Orders Above &#8377;2,499</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>50% Off Select Styles</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>Sale Upto 50% Off</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>Free Shipping on All Orders Above &#8377;2,499</span>
              <span className="text-[#D4A537]">&bull;</span>
              <span>50% Off Select Styles</span>
            </div>
          </div>
          <motion.button
            onClick={() => setVisible(false)}
            whileHover={{ rotate: 90, scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
