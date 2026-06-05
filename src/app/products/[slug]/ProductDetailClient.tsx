"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/product-helpers";
import type { ApiProduct, ApiVariant } from "@/lib/api";

interface Props {
  product: ApiProduct;
  heroImage: string;
}

export default function ProductDetailClient({ product, heroImage }: Props) {
  const { addItem, loading, error } = useCart();
  const inStockVariants = useMemo(() => product.variants.filter((v) => v.inStock), [product.variants]);
  const initial = inStockVariants[0] ?? product.variants[0] ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(initial?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selected: ApiVariant | null = selectedId
    ? product.variants.find((v) => v.id === selectedId) ?? null
    : null;

  const price = selected?.priceCents ?? product.basePriceCents;

  const onAdd = async () => {
    if (!selected) return;
    await addItem(selected.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const showOneSize = inStockVariants.every((v) => v.size === "ONE_SIZE");

  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EA]"
          >
            <img src={heroImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4A537] mb-3">
              {product.brand}
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-[#1A1A1A] mb-5"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h1>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8280] mb-6">
              {product.category}
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-2xl text-[#1A1A1A]">{formatPrice(price, product.currency)}</span>
              {selected && selected.priceCents !== product.basePriceCents && (
                <span className="text-sm text-[#8A8280] line-through">
                  {formatPrice(product.basePriceCents, product.currency)}
                </span>
              )}
            </div>

            <p className="text-[#5A5450] leading-relaxed mb-8">{product.description}</p>

            {!showOneSize && (
              <div className="mb-7">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedId;
                    const isOut = !v.inStock;
                    return (
                      <button
                        key={v.id}
                        disabled={isOut}
                        onClick={() => setSelectedId(v.id)}
                        className={`relative min-w-[3.25rem] px-4 py-2.5 text-[12px] tracking-[0.1em] uppercase border transition-colors ${
                          isSelected
                            ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                            : isOut
                              ? "border-[#E8E0D8] text-[#C4BAB0] cursor-not-allowed"
                              : "border-[#1A1A1A]/30 text-[#1A1A1A] hover:border-[#1A1A1A]"
                        }`}
                      >
                        {v.size}
                        {isOut && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-[#C4BAB0] rotate-12" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] mb-3">Quantity</p>
              <div className="inline-flex items-center border border-[#1A1A1A]/30">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 py-2 text-sm tabular-nums min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="px-3 py-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-stretch gap-3 mb-4">
              <motion.button
                whileHover={selected ? { scale: 1.01 } : undefined}
                whileTap={selected ? { scale: 0.98 } : undefined}
                onClick={onAdd}
                disabled={!selected || loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase disabled:bg-[#C4BAB0] disabled:cursor-not-allowed transition-colors"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added
                  </>
                ) : loading ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Bag
                  </>
                )}
              </motion.button>
              <button
                className="w-14 flex items-center justify-center border border-[#1A1A1A]/30 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                aria-label="Save to wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-red-700 mt-2">
                Cart unavailable: {error}. Is the API running on{" "}
                <code className="text-red-900">{process.env.NEXT_PUBLIC_API_URL ?? "localhost:4000"}</code>?
              </p>
            )}

            {!selected && (
              <p className="text-[11px] text-[#8A8280] mt-2">Select a size to continue.</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
