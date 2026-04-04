import AnnouncementBar from "@/components/store/AnnouncementBar";
import Navbar from "@/components/store/Navbar";
import HeroCarousel from "@/components/store/HeroCarousel";
import TrustBadges from "@/components/store/TrustBadges";
import HowItWorks from "@/components/store/HowItWorks";
import Footer from "@/components/store/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <HeroCarousel />
      <TrustBadges />
      <HowItWorks />
      <Footer />
    </>
  );
}
