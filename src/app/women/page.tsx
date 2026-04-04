import type { Metadata } from "next";
import garments from "@/lib/garmentData";
import CategoryPage from "@/components/store/CategoryPage";

export const metadata: Metadata = {
  title: "Women's Collection — Sarees, Lehengas, Kurtas & More",
  description: "Explore handcrafted Indian women's fashion — Banarasi sarees, Kanchipuram silks, festive lehengas, chikankari kurtas, and more.",
};

const womenGarments = garments.filter((g) => g.category === "women");

export default function WomenPage() {
  return (
    <CategoryPage
      title="Women"
      subtitle="Sarees, lehengas, kurtas, and gowns — each piece handcrafted by master artisans."
      heroImage="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&h=900&fit=crop"
      garments={womenGarments}
    />
  );
}
