import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import {
  basePriceCents,
  colorFor,
  effectivePriceCents,
  imageUrlFor,
  type GarmentSeed,
  sizesFor,
  skuFor,
  toSlug,
} from "../src/lib/product-helpers.js";

const prisma = new PrismaClient();

// We load garmentData.ts from the Next.js app at runtime via a regex pull
// so we don't have to import across workspaces (no cross-tsconfig wiring).
function loadGarments(): GarmentSeed[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = join(here, "..", "..", "..", "src", "lib", "garmentData.ts");
  const source = readFileSync(path, "utf8");
  const arr = source.match(/const garments:[^=]+=\s*(\[[\s\S]+?\]);/);
  if (!arr || !arr[1]) throw new Error("Failed to extract garments array from garmentData.ts");
  // The array uses TS-friendly trailing commas + comments — strip comments and
  // single-quoted keys aren't used here, so JSON.parse-after-cleanup works.
  const cleaned = arr[1]
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(\w+):/g, '"$1":')
    .replace(/,(\s*[\]}])/g, "$1");
  return JSON.parse(cleaned) as GarmentSeed[];
}

async function main() {
  const garments = loadGarments();
  console.log(`Seeding ${garments.length} products...`);

  for (const g of garments) {
    const slug = toSlug(g);
    const sizes = sizesFor(g);
    const color = colorFor(g);
    const base = basePriceCents(g);
    const effective = effectivePriceCents(g);

    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        name: g.name,
        description: g.description,
        brand: "Vastra Virasat",
        category: g.category,
        basePriceCents: base,
        currency: "USD",
        imageUrls: [imageUrlFor(g)],
        isPublished: true,
      },
      update: {
        name: g.name,
        description: g.description,
        basePriceCents: base,
        imageUrls: [imageUrlFor(g)],
      },
    });

    for (const size of sizes) {
      const sku = skuFor(g, size);
      await prisma.productVariant.upsert({
        where: { sku },
        create: {
          productId: product.id,
          sku,
          size,
          color,
          priceCentsOverride: effective === base ? null : effective,
          warehouseStock: 25,
          reservedStock: 0,
          isActive: true,
        },
        update: {
          priceCentsOverride: effective === base ? null : effective,
        },
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
