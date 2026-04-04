import type { Metadata } from "next";
import garments from "@/lib/garmentData";
import CategoryPage from "@/components/store/CategoryPage";

export const metadata: Metadata = {
  title: "Sale — Up to 50% Off Select Styles",
  description: "Handcrafted Indian fashion on sale — sarees, lehengas, kurtas, jewelry, and accessories at special prices.",
};

const saleGarments = garments.filter((g) => g.on_sale);

export default function SalePage() {
  return (
    <CategoryPage
      title="Sale"
      subtitle="Up to 50% off select handcrafted pieces — limited time."
      heroImage="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&h=900&fit=crop"
      garments={saleGarments}
    />
  );
}
