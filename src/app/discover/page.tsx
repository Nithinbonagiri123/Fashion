import type { Metadata } from "next";
import HowItWorks from "@/components/store/HowItWorks";
import DiscoverHero from "@/components/store/DiscoverHero";
import DiscoverStory from "@/components/store/DiscoverStory";
import DiscoverCrafts from "@/components/store/DiscoverCrafts";

export const metadata: Metadata = {
  title: "Discover — The Vastra Virasat Story",
  description:
    "Learn how Vastra Virasat works — a demand-driven lookbook where your votes decide what gets crafted next.",
};

export default function DiscoverPage() {
  return (
    <>
      <DiscoverHero image="https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=1600&h=900&fit=crop" />
      <DiscoverStory />
      <DiscoverCrafts />
      <HowItWorks />
    </>
  );
}
