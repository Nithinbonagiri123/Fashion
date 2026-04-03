import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vastra Virasat — Indian Traditional Attire, Reimagined",
    template: "%s | Vastra Virasat",
  },
  description:
    "A curated lookbook of 60 handcrafted Indian garments. Sarees, lehengas, kurtas, and heirloom jewelry — each piece a story of artistry and tradition.",
  keywords: [
    "Indian fashion",
    "traditional attire",
    "handcrafted",
    "sarees",
    "lehengas",
    "Indian textiles",
    "artisan fashion",
    "lookbook",
  ],
  openGraph: {
    siteName: "Vastra Virasat",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
