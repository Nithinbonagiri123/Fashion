"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import PageTransition from "@/components/motion/PageTransition";
import { CartProvider } from "@/lib/cart-context";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith("/admin");

  if (bare) return <CartProvider>{children}</CartProvider>;

  return (
    <CartProvider>
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </CartProvider>
  );
}
