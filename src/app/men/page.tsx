import type { Metadata } from "next";
import garments from "@/lib/garmentData";
import CategoryPage from "@/components/store/CategoryPage";

export const metadata: Metadata = {
  title: "Men's Collection — Sherwanis, Jackets & Kurtas",
  description: "Handcrafted Indian menswear — velvet sherwanis, silk Nehru jackets, khadi kurtas, and heritage weaves.",
};

const menGarments = garments.filter((g) => g.category === "men");

export default function MenPage() {
  return (
    <CategoryPage
      title="Men"
      subtitle="Sherwanis, Nehru jackets, and kurtas — the art of Indian menswear."
      heroImage="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&h=900&fit=crop"
      garments={menGarments}
    />
  );
}
