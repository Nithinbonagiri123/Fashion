"use client";

import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import { getGarmentImageLarge } from "@/lib/imageMap";

interface DetailOverlayProps {
  garment: Garment;
  onClose: () => void;
}

export default function DetailOverlay({
  garment,
  onClose,
}: DetailOverlayProps) {
  const imgUrl = getGarmentImageLarge(garment.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Glassmorphism card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          background: "rgba(11, 17, 32, 0.85)",
          backdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image */}
          <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[500px]">
            <img
              src={imgUrl}
              alt={garment.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-10 flex flex-col justify-center text-white">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4A537]/70 mb-4">
              {garment.fabric_info}
            </p>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl leading-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {garment.name}
            </h2>

            <div className="w-10 h-px bg-gradient-to-r from-[#D4A537] to-transparent mb-6" />

            <p className="text-white/60 leading-relaxed text-sm sm:text-base mb-8">
              {garment.description}
            </p>

            <div className="flex items-center gap-2 text-white/40">
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
              <span className="text-sm">
                {garment.like_count.toLocaleString()} people love this
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
