"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, Flame, ChevronDown } from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import { getGarmentImage, getGarmentImageLarge } from "@/lib/imageMap";
import { incrementLike } from "@/lib/supabase";
import GarmentCard from "./GarmentCard";
import DetailOverlay from "./DetailOverlay";

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

  useEffect(() => {
    // Simulate load
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

  let filtered = selectedSub === "All"
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
      {/* Hero banner */}
      <section className="relative h-[40vh] sm:h-[50vh] overflow-hidden bg-black">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 w-full pb-10 sm:pb-14">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h1>
              <p className="text-white/60 text-sm sm:text-base mt-2 max-w-lg tracking-wide">
                {subtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Subcategory filter */}
          {subcategories.length > 2 && (
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 overflow-x-auto pb-2">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSub(sub);
                    setShowCount(16);
                  }}
                  className={`text-[11px] tracking-[0.15em] uppercase whitespace-nowrap pb-1 transition-all ${
                    selectedSub === sub
                      ? "text-[#1A1A1A] border-b border-[#1A1A1A]"
                      : "text-[#8A8280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center justify-center gap-6 mb-10">
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
                className={`flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase pb-1 transition-all ${
                  sortMode === key
                    ? "text-[#1A1A1A] border-b border-[#1A1A1A]"
                    : "text-[#8A8280] hover:text-[#1A1A1A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} tall={i % 3 === 0} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#8A8280]">No items in this category yet.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5">
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

          {/* Load more */}
          {hasMore && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-14"
            >
              <button
                onClick={() => setShowCount((c) => c + 16)}
                className="flex items-center gap-2 px-10 py-3 border border-[#1A1A1A] text-[10px] tracking-[0.25em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
              >
                Load More
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Count */}
          <p className="text-center text-[10px] text-[#C4BAB0] mt-6 tracking-wide">
            {sorted.length} {sorted.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </section>

      {/* Detail overlay */}
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
