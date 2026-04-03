/*
  ── Supabase Schema ──

  Run this SQL in your Supabase Dashboard → SQL Editor:

  CREATE TABLE garments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    fabric_info TEXT NOT NULL,
    image_filename TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Row Level Security
  ALTER TABLE garments ENABLE ROW LEVEL SECURITY;

  -- Anyone can read garments
  CREATE POLICY "Public read access"
    ON garments FOR SELECT
    USING (true);

  -- Anyone can increment likes (update like_count only)
  CREATE POLICY "Public can like"
    ON garments FOR UPDATE
    USING (true)
    WITH CHECK (true);

  -- Only authenticated admins can insert/delete
  CREATE POLICY "Admin insert"
    ON garments FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Admin delete"
    ON garments FOR DELETE
    TO authenticated
    USING (true);

  -- Create a function for atomic like increment
  CREATE OR REPLACE FUNCTION increment_like(garment_id UUID)
  RETURNS void AS $$
    UPDATE garments SET like_count = like_count + 1 WHERE id = garment_id;
  $$ LANGUAGE sql;
*/

import garments, { type Garment } from "./garmentData";

// ─── Local fallback store (works without Supabase) ───
// When you connect Supabase, replace these functions with real API calls.

let localGarments: Garment[] = [...garments];

export async function fetchGarments(): Promise<Garment[]> {
  // Simulate network delay for skeleton loading demo
  await new Promise((r) => setTimeout(r, 300));
  return [...localGarments].sort((a, b) => b.like_count - a.like_count);
}

export async function fetchGarmentById(
  id: string
): Promise<Garment | undefined> {
  return localGarments.find((g) => g.id === id);
}

export async function incrementLike(id: string): Promise<number> {
  const garment = localGarments.find((g) => g.id === id);
  if (garment) {
    garment.like_count += 1;
    return garment.like_count;
  }
  return 0;
}

export async function addGarment(
  data: Omit<Garment, "id" | "like_count">
): Promise<Garment> {
  const newGarment: Garment = {
    ...data,
    id: `g${Date.now()}`,
    like_count: 0,
  };
  localGarments = [newGarment, ...localGarments];
  return newGarment;
}

export async function updateGarment(
  id: string,
  data: Partial<Omit<Garment, "id" | "like_count">>
): Promise<Garment | undefined> {
  const idx = localGarments.findIndex((g) => g.id === id);
  if (idx !== -1) {
    localGarments[idx] = { ...localGarments[idx], ...data };
    return localGarments[idx];
  }
  return undefined;
}

export async function deleteGarment(id: string): Promise<boolean> {
  const before = localGarments.length;
  localGarments = localGarments.filter((g) => g.id !== id);
  return localGarments.length < before;
}
