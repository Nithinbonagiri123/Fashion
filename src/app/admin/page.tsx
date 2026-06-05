"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Heart,
  TrendingUp,
  Package,
  Users,
  Search,
  Sparkles,
  Save,
} from "lucide-react";
import { type Garment } from "@/lib/garmentData";
import {
  fetchGarments,
  addGarment,
  updateGarment,
  deleteGarment,
} from "@/lib/supabase";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

export default function AdminPage() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New garment form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFabric, setNewFabric] = useState("");
  const [newImage, setNewImage] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFabric, setEditFabric] = useState("");
  const [editImage, setEditImage] = useState("");

  useEffect(() => {
    fetchGarments().then((data) => {
      setGarments(data);
      setLoading(false);
    });
  }, []);

  const totalLikes = garments.reduce((s, g) => s + g.like_count, 0);
  const topGarment = garments.length
    ? garments.reduce((a, b) => (a.like_count > b.like_count ? a : b))
    : null;

  const filtered = garments.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.fabric_info.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newName || !newDesc) return;
    const added = await addGarment({
      name: newName,
      description: newDesc,
      fabric_info: newFabric || "Handcrafted",
      image_filename: newImage || "new_garment.jpg",
      category: "women",
      subcategory: "Sarees",
    });
    setGarments((prev) => [added, ...prev]);
    setNewName("");
    setNewDesc("");
    setNewFabric("");
    setNewImage("");
    setShowAddForm(false);
  };

  const startEdit = (g: Garment) => {
    setEditingId(g.id);
    setEditName(g.name);
    setEditDesc(g.description);
    setEditFabric(g.fabric_info);
    setEditImage(g.image_filename);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const updated = await updateGarment(editingId, {
      name: editName,
      description: editDesc,
      fabric_info: editFabric,
      image_filename: editImage,
    });
    if (updated) {
      setGarments((prev) =>
        prev.map((g) => (g.id === editingId ? updated : g))
      );
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteGarment(id);
    setGarments((prev) => prev.filter((g) => g.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0EA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Back to Lookbook</span>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A537]" />
              <h1
                className="text-lg font-normal tracking-wide"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Dashboard
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A537] text-black text-xs tracking-[0.15em] uppercase hover:bg-[#B8860B] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Garment</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Garments",
              value: garments.length,
              icon: Package,
              color: "#D4A537",
            },
            {
              label: "Total Likes",
              value: totalLikes,
              icon: Heart,
              color: "#C9736B",
            },
            {
              label: "Most Loved",
              value: topGarment?.like_count ?? 0,
              icon: TrendingUp,
              color: "#6B8E6B",
            },
            {
              label: "Avg. Likes",
              value: garments.length
                ? Math.round(totalLikes / garments.length)
                : 0,
              icon: Users,
              color: "#7B6B8E",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4, borderColor: `${stat.color}40` }}
              className="rounded-xl p-5 border border-white/5 bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-white/40">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-light mt-1">
                    <AnimatedNumber value={stat.value} />
                  </p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                    strokeWidth={1.5}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
                <h2 className="text-sm tracking-[0.15em] uppercase text-[#D4A537] mb-4">
                  Add New Garment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 mb-1.5">
                      Garment Name *
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Hand-Woven Gold Tissue Sari"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A537]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 mb-1.5">
                      Fabric Info
                    </label>
                    <input
                      value={newFabric}
                      onChange={(e) => setNewFabric(e.target.value)}
                      placeholder="e.g. Pure Silk, Handwoven"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A537]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 mb-1.5">
                      Image File Name
                    </label>
                    <input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="e.g. gold_tissue_sari.jpg"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A537]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 mb-1.5">
                      Description *
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="A poetic description of the garment..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A537]/50 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2 text-xs tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newName || !newDesc}
                    className="px-5 py-2 bg-[#D4A537] text-black text-xs tracking-[0.15em] uppercase hover:bg-[#B8860B] transition-colors disabled:opacity-30"
                  >
                    Add Garment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search garments..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A537]/50"
          />
        </div>

        {/* Garment table */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/40 font-normal">
                    Garment
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/40 font-normal hidden md:table-cell">
                    Fabric
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/40 font-normal hidden lg:table-cell">
                    Image File
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/40 font-normal">
                    <Heart className="w-3.5 h-3.5 inline" /> Likes
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/40 font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
                          <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="h-3 w-36 rounded bg-white/5 animate-pulse" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-4 w-8 rounded bg-white/5 animate-pulse mx-auto" />
                      </td>
                      <td className="px-4 py-4" />
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-white/30"
                    >
                      No garments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        {editingId === g.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white/5 border border-[#D4A537]/30 rounded px-3 py-1.5 text-sm text-white w-full max-w-[250px] focus:outline-none"
                          />
                        ) : (
                          <div>
                            <p className="font-medium text-sm">{g.name}</p>
                            <p className="text-[10px] text-white/30 mt-0.5 md:hidden">
                              {g.fabric_info}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {editingId === g.id ? (
                          <input
                            value={editFabric}
                            onChange={(e) => setEditFabric(e.target.value)}
                            className="bg-white/5 border border-[#D4A537]/30 rounded px-3 py-1.5 text-sm text-white w-full max-w-[200px] focus:outline-none"
                          />
                        ) : (
                          <span className="text-white/50 text-xs">
                            {g.fabric_info}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {editingId === g.id ? (
                          <input
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            className="bg-white/5 border border-[#D4A537]/30 rounded px-3 py-1.5 text-xs text-white w-full max-w-[250px] focus:outline-none font-mono"
                          />
                        ) : (
                          <span className="text-white/30 text-[10px] font-mono">
                            {g.image_filename}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-white/70">
                          <Heart className="w-3 h-3 text-[#C9736B] fill-[#C9736B]" />
                          {g.like_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === g.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : deleteConfirm === g.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-red-400 mr-1">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(g.id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Confirm delete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(g)}
                              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(g.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Count */}
        <p className="text-[10px] text-white/20 mt-4 text-center tracking-wide">
          Showing {filtered.length} of {garments.length} garments
        </p>
      </main>
    </div>
  );
}
