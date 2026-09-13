"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
import { api, Donation } from "@/lib/api";
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Sparkles,
  Package,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamically import InteractiveFoodMap to ensure client-side Leaflet execution
const InteractiveFoodMap = dynamic(() => import("@/components/interactive-food-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[650px] w-full flex-col items-center justify-center rounded-[2.5rem] border border-slate-200 bg-slate-100/50 dark:border-white/10 dark:bg-slate-900/50">
      <Clock className="h-8 w-8 animate-spin text-emerald-600" />
      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
        Loading Interactive OpenStreetMap…
      </p>
    </div>
  ),
});

export default function MapDiscoveryPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await api.browseDonations();
        setDonations(list || []);
      } catch (err) {
        console.error("Failed to load map donations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    donations.forEach((d) => {
      if (d.category) cats.add(d.category);
    });
    return Array.from(cats);
  }, [donations]);

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchSearch =
        d.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickup_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" ||
        d.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [donations, searchQuery, selectedCategory]);

  return (
    <main className="relative flex min-h-screen flex-col bg-[linear-gradient(135deg,_#f7fee7_0%,_#ecfdf5_52%,_#fff7ed_100%)] dark:bg-[linear-gradient(135deg,_#052e16_0%,_#064e3b_55%,_#431407_100%)]">
      <Navbar />

      <section className="mx-auto mt-28 w-full max-w-7xl px-4 pb-16 pt-6">
        {/* Header banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Compass className="h-3.5 w-3.5" /> Geospatial Discovery
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-5xl font-aleo">
              Interactive Surplus Food Map
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300 max-w-2xl">
              Locate nearby available food donations, filter by distance radius, and claim items in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/donations/browse">
              <Button variant="outline" className="rounded-2xl border-emerald-900/20 bg-white/80 dark:bg-slate-900/80">
                Browse Grid List
              </Button>
            </Link>
            <Link href="/donations/create">
              <Button className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 font-bold">
                + Post Food
              </Button>
            </Link>
          </div>
        </div>

        {/* Map Container & Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Map Box */}
          <div className="w-full">
            <InteractiveFoodMap
              donations={filteredDonations}
              onSelectDonation={(d) => setSelectedDonation(d)}
              selectedDonationId={selectedDonation?.id}
              className="h-[680px] w-full"
              initialRadiusKm={25}
            />
          </div>

          {/* Sidebar Donation List */}
          <div className="flex flex-col rounded-[2.5rem] border border-white/80 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                Nearby Listings ({filteredDonations.length})
              </h3>
              <p className="text-xs text-slate-500">
                Select any card to center on the map.
              </p>

              {/* Search */}
              <div className="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950">
                <Search className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter nearby food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none dark:text-white"
                />
              </div>

              {/* Category pills */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                    selectedCategory === "all"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                      selectedCategory === cat
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Listings */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {filteredDonations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  No listings found for your search.
                </div>
              ) : (
                filteredDonations.map((item) => {
                  const isSelected = selectedDonation?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDonation(item)}
                      className={`cursor-pointer rounded-2xl border p-3 transition hover:shadow-md ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-100 bg-white/70 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.category || "General"}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.quantity}</span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {item.food_name}
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">
                        📍 {item.pickup_location}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                          ⏰ {item.pickup_deadline ? new Date(item.pickup_deadline).toLocaleDateString() : "Flexible"}
                        </span>
                        <Link
                          href={`/donations/${item.id}`}
                          className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Claim →
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
