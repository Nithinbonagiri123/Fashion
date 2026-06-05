"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import { getGarmentImage } from "@/lib/imageMap";
import { incrementLike } from "@/lib/supabase";

interface GarmentCardProps {
  garment: Garment;
  index: number;
  onOpen: (garment: Garment) => void;
  onLikeUpdate: (id: string, newCount: number) => void;
}

const heights = [
  "aspect-[3/4]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[3/4]",
];

export default function GarmentCard({
  garment,
  index,
  onOpen,
  onLikeUpdate,
}: GarmentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(garment.like_count);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const lastTapRef = useRef(0);
  const reduce = useReducedMotion();

  const imgUrl = getGarmentImage(garment.id);
  const aspectClass = heights[index % heights.length];

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);

    const newCount = await incrementLike(garment.id);
    setLikeCount(newCount);
    onLikeUpdate(garment.id, newCount);
  }, [liked, garment.id, onLikeUpdate]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike();
    }
    lastTapRef.current = now;
  }, [handleLike]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        delay: Math.min((index % 8) * 0.05, 0.4),
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="group relative break-inside-avoid mb-4 sm:mb-5"
    >
      <div
        className={`relative ${aspectClass} overflow-hidden bg-[#F5F0EA] cursor-pointer`}
        onClick={handleDoubleTap}
      >
        {!imgLoaded && <div className="skeleton absolute inset-0" />}

        <motion.img
          src={imgUrl}
          alt={garment.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          whileHover={reduce ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute inset-0 w-full h-full object-cover ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(garment);
          }}
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-black/75 backdrop-blur-sm text-white text-center py-3 text-[10px] tracking-[0.25em] uppercase z-10"
        >
          View Details
        </button>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpen(garment)}
        >
          <h3 className="text-[13px] font-medium leading-snug text-[#1A1A1A] truncate">
            {garment.name}
          </h3>
          <p className="text-[10px] text-[#8A8280] tracking-wide mt-0.5">
            {garment.fabric_info}
          </p>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          whileTap={{ scale: 0.85 }}
          className="flex items-center gap-1.5 shrink-0 pt-0.5 group/like"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-[#C4BAB0] group-hover/like:text-red-400"
              }`}
            />
          </motion.div>
          <motion.span
            key={likeCount}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] text-[#8A8280] tabular-nums"
          >
            {likeCount}
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
