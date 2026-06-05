"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  LayoutGroup,
} from "framer-motion";
import { TrendingUp, Clock, Flame, ChevronDown } from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import GarmentCard from "./GarmentCard";
import DetailOverlay from "./DetailOverlay";
import Reveal from "@/components/motion/Reveal";

interface CategoryPageProps {
  title: string;
  subtitle: string;
  heroImage: string;
  garments: Garment[];
}

function SkeletonCard({ tall }: { tall: boolean }) {
  return (
    <div className="break-inside-avoid mb-4 sm:mb-5">
      <div className={`skeleton ${tall ? "aspect-[2/3]" : "aspect-[3/4]"}`} />
      <div className="mt-2.5 space-y-1.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  );
}

type SortMode = "trending" | "newest" | "most_loved";

export default function CategoryPage({
  title,
  subtitle,
  heroImage,
  garments: initialGarments,
}: CategoryPageProps) {
  const [garments, setGarments] = useState(initialGarments);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [selectedSub, setSelectedSub] = useState("All");
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [showCount, setShowCount] = useState(16);

  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroContentY = useTransform(heroProgress, [0, 1], ["0%", "-30%"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const subcategories = [
    "All",
    ...Array.from(new Set(initialGarments.map((g) => g.subcategory))).sort(),
  ];

  const handleLikeUpdate = useCallback(
    (id: string, newCount: number) => {
      setGarments((prev) =>
        prev.map((g) => (g.id === id ? { ...g, like_count: newCount } : g))
      );
      if (selectedGarment?.id === id) {
        setSelectedGarment((p) => (p ? { ...p, like_count: newCount } : null));
      }
    },
    [selectedGarment]
  );

  const filtered = selectedSub === "All"
    ? garments
    : garments.filter((g) => g.subcategory === selectedSub);

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "trending" || sortMode === "most_loved")
      return b.like_count - a.like_count;
    return 0;
  });

  const visible = sorted.slice(0, showCount);
  const hasMore = showCount < sorted.length;

  return (
    <>
      <section
        ref={heroRef}
        className="relative h-[40vh] sm:h-[50vh] overflow-hidden bg-black"
      >
        <motion.div
          style={reduce ? undefined : { y: heroImageY, scale: heroImageScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={heroImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div
          style={reduce ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
          className="absolute inset-0 flex items-end"
        >
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 w-full pb-10 sm:pb-14">
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[10px] tracking-[0.4em] uppercase text-[#D4A537]/80 mb-3"
            >
              Collection
            </motion.p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide overflow-hidden"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                {title}
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/60 text-sm sm:text-base mt-2 max-w-lg tracking-wide"
            >
              {subtitle}
            </motion.p>
          </div>
        </motion.div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {subcategories.length > 2 && (
            <Reveal direction="up" distance={16} className="mb-8">
              <LayoutGroup id="subcategory">
                <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSub(sub);
                        setShowCount(16);
                      }}
                      className={`relative text-[11px] tracking-[0.15em] uppercase whitespace-nowrap pb-1.5 transition-colors ${
                        selectedSub === sub
                          ? "text-[#1A1A1A]"
                          : "text-[#8A8280] hover:text-[#1A1A1A]"
                      }`}
                    >
                      {sub}
                      {selectedSub === sub && (
                        <motion.span
                          layoutId="sub-underline"
                          className="absolute left-0 right-0 bottom-0 h-px bg-[#1A1A1A]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </Reveal>
          )}

          <Reveal direction="up" distance={16} className="mb-10">
            <LayoutGroup id="sort">
              <div className="flex items-center justify-center gap-6">
                {(
                  [
                    { key: "trending", label: "Trending", icon: Flame },
                    { key: "most_loved", label: "Most Loved", icon: TrendingUp },
                    { key: "newest", label: "Latest", icon: Clock },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortMode(key)}
                    className={`relative flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase pb-1.5 transition-colors ${
                      sortMode === key
                        ? "text-[#1A1A1A]"
                        : "text-[#8A8280] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {sortMode === key && (
                      <motion.span
                        layoutId="sort-underline"
                        className="absolute left-0 right-0 bottom-0 h-px bg-[#1A1A1A]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </Reveal>

          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} tall={i % 3 === 0} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <Reveal className="text-center py-20">
              <p className="text-[#8A8280]">No items in this category yet.</p>
            </Reveal>
          ) : (
            <div
              key={`${selectedSub}-${sortMode}`}
              className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5"
            >
              {visible.map((garment, i) => (
                <GarmentCard
                  key={garment.id}
                  garment={garment}
                  index={i}
                  onOpen={setSelectedGarment}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mt-14"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCount((c) => c + 16)}
                className="flex items-center gap-2 px-10 py-3 border border-[#1A1A1A] text-[10px] tracking-[0.25em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300"
              >
                Load More
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>
            </motion.div>
          )}

          <p className="text-center text-[10px] text-[#C4BAB0] mt-6 tracking-wide">
            {sorted.length} {sorted.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </section>

      <AnimatePresence>
        {selectedGarment && (
          <DetailOverlay
            garment={selectedGarment}
            onClose={() => setSelectedGarment(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
