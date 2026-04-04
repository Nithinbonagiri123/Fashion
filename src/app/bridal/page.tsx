import type { Metadata } from "next";
import garments from "@/lib/garmentData";
import CategoryPage from "@/components/store/CategoryPage";

export const metadata: Metadata = {
  title: "Bridal Collection — Lehengas, Sarees & Bridal Jewelry",
  description: "The bridal edit — handcrafted bridal lehengas, gold tissue sarees, kundan jewelry sets, and heirloom pieces for your forever moment.",
};

const bridalGarments = garments.filter((g) => g.category === "bridal");

export default function BridalPage() {
  return (
    <CategoryPage
      title="Bridal"
      subtitle="Heirloom pieces for your forever moment — bridal lehengas, sarees, and jewelry."
      heroImage="https://images.unsplash.com/photo-1609748340878-f98837ade498?w=1600&h=900&fit=crop"
      garments={bridalGarments}
    />
  );
}
