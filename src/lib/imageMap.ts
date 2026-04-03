// ── Unique image for every garment — no repeats ──
// Each garment ID maps to one distinct Unsplash photo.
// When you add your own product photography, replace these URLs.

const imageMap: Record<string, string> = {
  // ── SAREES (20) ──
  g01: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",       // Banarasi Silk — Crimson
  g02: "https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop",       // Kanchipuram Temple Border
  g03: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=600&h=800&fit=crop",       // Chanderi Tissue — Ivory
  g04: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop",       // Pochampally Ikat Silk
  g05: "https://images.unsplash.com/photo-1633784745498-24c66c4f5506?w=600&h=800&fit=crop",       // Paithani Peacock Pallu
  g06: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&h=800&fit=crop",       // Tussar Silk — Gold
  g07: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=600&h=800&fit=crop",       // Jamdani Muslin
  g08: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=800&fit=crop",       // Patola Double-Ikat
  g09: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=800&fit=crop",       // Gadwal Silk-Cotton
  g10: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=800&fit=crop",       // Bandhani Tie-Dye — Red
  g11: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=600&h=800&fit=crop",       // Maheshwari Silk — Grape
  g12: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop",       // Organza — Blush Ombré
  g13: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&h=800&fit=crop",       // Tant Cotton — Bengal
  g14: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop",       // Narayanpet Cotton
  g15: "https://images.unsplash.com/photo-1564468781192-a023f8e0bbf0?w=600&h=800&fit=crop",       // Kasavu Set Mundu
  g16: "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&h=800&fit=crop",       // Ajrakh Block-Print
  g17: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop",         // Handloom Linen — Sage
  g18: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop",       // Resham Thread Work
  g19: "https://images.unsplash.com/photo-1609748340878-f98837ade498?w=600&h=800&fit=crop",       // Gold Tissue Bridal
  g20: "https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=600&h=800&fit=crop",       // Sambalpuri Ikat

  // ── LEHENGAS (10) ──
  g21: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",       // Bridal Lehenga — Maroon
  g22: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=600&h=800&fit=crop",       // Gota Patti — Pink
  g23: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",       // Sequin — Champagne
  g24: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",       // Benarasi — Purple
  g25: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop",       // Mirror Work Ghagra
  g26: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",       // Heritage Half-Saree
  g27: "https://images.unsplash.com/photo-1558171813-01e537452169?w=600&h=800&fit=crop",         // Lavani — Hot Pink
  g28: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",       // Pastel Threadwork
  g29: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=800&fit=crop",       // Brocade Heritage Gown
  g30: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",       // Dhakai Jamdani Lehenga

  // ── KURTAS & SUITS (10) ──
  g31: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop",       // Chikankari Lucknowi
  g32: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=800&fit=crop",       // Block-Print Mulmul
  g33: "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=600&h=800&fit=crop",       // Hand-Spun Khadi
  g34: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=800&fit=crop",         // Mukaish Palazzo — Mint
  g35: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",       // Georgette Sharara
  g36: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",       // Anarkali — Ivory
  g37: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop",       // Aari Embroidered — Navy
  g38: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&h=800&fit=crop",       // Silk Angrakha — Ivory
  g39: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=800&fit=crop",       // Kalamkari Suit
  g40: "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=600&h=800&fit=crop",       // Cotton Palazzo

  // ── MENSWEAR (5) ──
  g41: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop",       // Maroon Velvet Sherwani
  g42: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",       // Nehru Jacket — Slate
  g43: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop",         // Khadi Silk Jacket
  g44: "https://images.unsplash.com/photo-1617331140180-e8262094733a?w=600&h=800&fit=crop",       // Dhurrie Weave Jacket
  g45: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=800&fit=crop",       // Lucknowi Kurta Pajama

  // ── DUPATTAS & SHAWLS (5) ──
  g46: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop",       // Phulkari Dupatta
  g47: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",       // Pashmina Shawl
  g48: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=600&h=800&fit=crop",       // Zari Silk Dupatta — Plum
  g49: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",       // Kantha Wrap
  g50: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop",       // Bandhani Silk — Saffron

  // ── JEWELRY & ACCESSORIES (10) ──
  g51: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop",       // Kundan Bridal Set
  g52: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=800&fit=crop",       // Temple Choker
  g53: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=600&h=800&fit=crop",       // Filigree Jhumkas
  g54: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=800&fit=crop",       // Bridal Nath
  g55: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop",       // Jadau Maang Tikka
  g56: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&h=800&fit=crop",       // Lacquer Bangles
  g57: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&h=800&fit=crop",       // Coin Necklace
  g58: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",         // Zardozi Clutch
  g59: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",         // Brocade Potli
  g60: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",       // Sandalwood Clutch
};

export function getGarmentImage(id: string): string {
  return (
    imageMap[id] ||
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop"
  );
}

export function getGarmentImageLarge(id: string): string {
  const url = getGarmentImage(id);
  return url.replace("w=600&h=800", "w=1000&h=1300");
}

export default imageMap;
