import type { Metadata } from "next";
import HowItWorks from "@/components/store/HowItWorks";

export const metadata: Metadata = {
  title: "Discover — The Vastra Virasat Story",
  description: "Learn how Vastra Virasat works — a demand-driven lookbook where your votes decide what gets crafted next.",
};

export default function DiscoverPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=1600&h=900&fit=crop"
          alt="Discover"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 mb-3">
              Our Story
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-wide"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Discover
            </h1>
            <p className="text-white/50 text-sm sm:text-base mt-3 max-w-lg mx-auto">
              A curated lookbook where your love shapes what gets crafted next.
            </p>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] mb-4">
            The Vision
          </p>
          <h2
            className="text-2xl sm:text-3xl tracking-wide text-[#1A1A1A] mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Fashion That Listens
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mb-8" />
          <p className="text-[#6B6462] leading-relaxed mb-6">
            Vastra Virasat is not a typical fashion store. We are a curated
            lookbook of 60 handcrafted Indian garments — each one a story of
            artistry, patience, and tradition.
          </p>
          <p className="text-[#6B6462] leading-relaxed mb-6">
            Instead of guessing what to stock, we let you decide. Browse our
            collection, double-tap the pieces you love, and we craft what gets
            the most demand. Your vote directly shapes what our artisans create
            next.
          </p>
          <p className="text-[#6B6462] leading-relaxed">
            Every saree, lehenga, kurta, and piece of jewelry in this
            collection was made by hand — by weavers, embroiderers, and
            craftspeople whose families have practised these arts for
            generations. When you show love for a piece, you are not just
            voting — you are keeping a craft alive.
          </p>
        </div>
      </section>

      {/* The craft */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
                title: "The Weavers",
                desc: "Generations of families who speak in thread and loom. Each piece takes weeks — sometimes months — to complete.",
              },
              {
                img: "https://images.unsplash.com/photo-1609748340878-f98837ade498?w=600&h=800&fit=crop",
                title: "The Embroiderers",
                desc: "Hands that turn plain fabric into gardens, galaxies, and stories. Zardozi, chikankari, phulkari — each stitch has a name.",
              },
              {
                img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",
                title: "The Jewelers",
                desc: "Gold, silver, and precious stones shaped into wearable heirlooms. Techniques passed down through centuries, unchanged.",
              },
            ].map((item) => (
              <div key={item.title} className="group">
                <div className="aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3
                  className="text-lg tracking-wide text-[#1A1A1A] mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#8A8280] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
    </>
  );
}
