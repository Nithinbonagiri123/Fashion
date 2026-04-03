"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, Flame } from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import { fetchGarments } from "@/lib/supabase";
import GarmentCard from "./GarmentCard";
import DetailOverlay from "./DetailOverlay";

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

export default function Gallery() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    fetchGarments().then((data) => {
      setGarments(data);
      setLoading(false);
    });
  }, []);

  const handleLikeUpdate = useCallback(
    (id: string, newCount: number) => {
      setGarments((prev) =>
        prev.map((g) => (g.id === id ? { ...g, like_count: newCount } : g))
      );
      // Also update selected garment if open
      if (selectedGarment?.id === id) {
        setSelectedGarment((prev) =>
          prev ? { ...prev, like_count: newCount } : null
        );
      }
    },
    [selectedGarment]
  );

  const sorted = [...garments].sort((a, b) => {
    switch (sortMode) {
      case "trending":
        return b.like_count - a.like_count;
      case "newest":
        return garments.indexOf(a) - garments.indexOf(b);
      case "most_loved":
        return b.like_count - a.like_count;
      default:
        return 0;
    }
  });

  const visible = sorted.slice(0, showCount);
  const hasMore = showCount < sorted.length;

  return (
    <>
      {/* Sort controls */}
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
            className={`flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase pb-1 transition-all ${
              sortMode === key
                ? "text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      {loading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} tall={i % 3 === 0} />
          ))}
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
            onClick={() => setShowCount((c) => c + 20)}
            className="px-10 py-3 border border-foreground text-[10px] tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Load More Pieces
          </button>
        </motion.div>
      )}

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
