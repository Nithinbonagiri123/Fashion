import AnnouncementBar from "@/components/store/AnnouncementBar";
import Navbar from "@/components/store/Navbar";
import HeroCarousel from "@/components/store/HeroCarousel";
import TrustBadges from "@/components/store/TrustBadges";
import Gallery from "@/components/store/Gallery";
import HowItWorks from "@/components/store/HowItWorks";
import Footer from "@/components/store/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <HeroCarousel />
      <TrustBadges />

      {/* The Lookbook */}
      <section id="lookbook" className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] mb-2">
              The Lookbook
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl tracking-wide text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              60 Handcrafted Pieces
            </h2>
            <p className="text-[#8A8280] text-sm mt-2 max-w-lg mx-auto">
              Each garment is a story of human patience and artistry.
              Double-tap to love. Click to explore.
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mt-4" />
          </div>

          <Gallery />
        </div>
      </section>

      <HowItWorks />
      <Footer />
    </>
  );
}
