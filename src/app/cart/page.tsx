"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, legacyIdFromSlug } from "@/lib/product-helpers";
import { getGarmentImage } from "@/lib/imageMap";

export default function CartPage() {
  const { cart, loading, error, updateItem, removeItem } = useCart();

  if (cart.items.length === 0) {
    return (
      <section className="bg-white min-h-[60vh]">
        <div className="max-w-[800px] mx-auto px-6 py-24 text-center">
          <h1
            className="text-3xl sm:text-4xl text-[#1A1A1A] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your bag is empty
          </h1>
          <p className="text-[#8A8280] mb-10">
            {error
              ? `Cart unavailable: ${error}.`
              : "Add a piece to begin — every garment carries centuries of craft."}
          </p>
          <Link
            href="/women"
            className="inline-block px-10 py-3 border border-[#1A1A1A] text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            Discover the collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1
          className="text-3xl sm:text-4xl text-[#1A1A1A] mb-10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your Bag ({cart.itemCount})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          <ul className="space-y-6 divide-y divide-[#E8E0D8]">
            {cart.items.map((item, idx) => {
              const legacyId = legacyIdFromSlug(item.productSlug);
              const img = legacyId ? getGarmentImage(legacyId) : item.imageUrl ?? "";
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="flex gap-5 pt-6 first:pt-0"
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative w-24 sm:w-32 aspect-[3/4] overflow-hidden bg-[#F5F0EA] shrink-0"
                  >
                    {img && <img src={img} alt={item.productName} className="absolute inset-0 w-full h-full object-cover" />}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="text-[15px] text-[#1A1A1A] hover:text-[#D4A537] transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#8A8280] mt-1">
                      {item.size !== "ONE_SIZE" ? `Size ${item.size} · ` : ""}
                      {item.color}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex items-center border border-[#1A1A1A]/30">
                        <button
                          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                          disabled={loading}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 py-1.5 text-sm tabular-nums min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, Math.min(99, item.quantity + 1))}
                          className="px-2.5 py-1.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                          aria-label="Increase quantity"
                          disabled={loading}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[15px] text-[#1A1A1A] tabular-nums">
                          {formatPrice(item.lineTotalCents, cart.currency)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#8A8280] hover:text-red-600 transition-colors"
                          aria-label="Remove"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-24 self-start border border-[#E8E0D8] p-6 sm:p-8">
            <h2 className="text-[11px] tracking-[0.25em] uppercase text-[#8A8280] mb-5">
              Order Summary
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#5A5450]">Subtotal</dt>
                <dd className="text-[#1A1A1A] tabular-nums">
                  {formatPrice(cart.subtotalCents, cart.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5A5450]">Shipping</dt>
                <dd className="text-[#8A8280]">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="border-t border-[#E8E0D8] mt-5 pt-5 flex justify-between text-base">
              <span className="text-[#1A1A1A]">Estimated total</span>
              <span className="text-[#1A1A1A] tabular-nums">
                {formatPrice(cart.subtotalCents, cart.currency)}
              </span>
            </div>
            <button className="w-full mt-7 py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#0B1120] transition-colors">
              Checkout
            </button>
            <p className="text-[10px] text-center text-[#C4BAB0] mt-3 tracking-wide">
              Checkout pipeline ships in Phase 2
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
