import type { Metadata } from "next";
import garments from "@/lib/garmentData";
import CategoryPage from "@/components/store/CategoryPage";

export const metadata: Metadata = {
  title: "Accessories — Jewelry, Dupattas, Shawls & Bags",
  description: "Handcrafted Indian accessories — temple jewelry, filigree jhumkas, phulkari dupattas, pashmina shawls, and zardozi clutches.",
};

const accessoryGarments = garments.filter((g) => g.category === "accessories");

export default function AccessoriesPage() {
  return (
    <CategoryPage
      title="Accessories"
      subtitle="Jewelry, dupattas, shawls, and bags — the finishing touches of heritage."
      heroImage="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1600&h=900&fit=crop"
      garments={accessoryGarments}
    />
  );
}
