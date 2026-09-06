"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Profile, Donation, Claim } from "@/lib/api";
import { calculateImpact, ImpactMetrics, Badge } from "@/lib/impact";
import {
  Sparkles,
  Award,
  Trees,
  Car,
  Droplets,
  Share2,
  CheckCircle,
  TrendingUp,
  Heart,
  Scale,
  CloudSun,
  ShieldCheck,
  Calculator,
  Printer,
  ChevronRight,
  Zap,
  Leaf,
  Utensils,
  Globe2,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ImpactPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filterRole, setFilterRole] = useState<"recipient" | "donor">("recipient");
  const [certName, setCertName] = useState("Community Champion");

  // Interactive Calculator State
  const [calcProduceKg, setCalcProduceKg] = useState(15);
  const [calcBakeryKg, setCalcBakeryKg] = useState(10);
  const [calcPreparedKg, setCalcPreparedKg] = useState(20);
  const [calcDairyKg, setCalcDairyKg] = useState(8);
  const [calcPantryKg, setCalcPantryKg] = useState(12);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await api.me().catch(() => null);
      let userProfile = meRes?.profile || null;
      if (userProfile) {
        setProfile(userProfile);
        setCertName(userProfile.name || "Community Champion");
      }

      const activeRole = userProfile?.role || "recipient";
      setFilterRole(activeRole);

      let donations: Donation[] = [];
      let claims: Claim[] = [];

      if (activeRole === "donor") {
        donations = await api.myDonations().catch(() => []);
      } else {
        const claimsRes = await api.myClaims().catch(() => ({ data: [] }));
        claims = claimsRes.data || [];
      }

      const impactData = calculateImpact(donations, claims, activeRole);
      setMetrics(impactData.metrics);
      setBadges(impactData.badges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (newRole: "recipient" | "donor") => {
    setFilterRole(newRole);
    setLoading(true);
    try {
      let donations: Donation[] = [];
      let claims: Claim[] = [];
      if (newRole === "donor") {
        donations = await api.myDonations().catch(() => []);
      } else {
        const claimsRes = await api.myClaims().catch(() => ({ data: [] }));
        claims = claimsRes.data || [];
      }
      const impactData = calculateImpact(donations, claims, newRole);
      setMetrics(impactData.metrics);
      setBadges(impactData.badges);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = () => {
    const text = `🌱 Together on FoodBridge, I have helped rescue ${metrics?.mealsSaved || 0} meals, diverted ${metrics?.kgDiverted || 0} kg of food waste, and saved ${metrics?.co2SavedKg || 0} kg of CO2e! Let's build a zero-waste community together: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const tierColors = {
    bronze: "from-amber-600 to-amber-800 text-amber-100 border-amber-500/30",
    silver: "from-slate-400 to-slate-600 text-slate-100 border-slate-400/40",
    gold: "from-yellow-400 to-amber-500 text-amber-950 border-yellow-300",
    platinum: "from-teal-400 via-emerald-400 to-cyan-500 text-slate-950 border-teal-300 font-bold",
  };

  // Calculator Output Computations
  const calcTotalKg = calcProduceKg + calcBakeryKg + calcPreparedKg + calcDairyKg + calcPantryKg;
  const calcMeals = Math.round(calcTotalKg * 2.4);
  const calcCo2 = Math.round(calcTotalKg * 2.5 * 10) / 10;
  const calcWater = Math.round(calcTotalKg * 180);
  const calcCarMiles = Math.round(calcCo2 * 2.48);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_40%,_#eff6ff_70%,_#fefce8_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#022c22_0%,_#064e3b_35%,_#1e1b4b_70%,_#422006_100%)]">
      <Navbar />

      <div className="mx-auto mt-28 w-full max-w-6xl px-4 pb-16 pt-4 md:pt-8 space-y-10">
        {/* ─── HEADER & HERO ─── */}
        <div className="rounded-[2.5rem] border border-white/80 bg-white/80 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/60 md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Community & Environmental Impact Hub
            </span>

            {/* Role switch toggle */}
            <div className="inline-flex rounded-full bg-slate-200/80 p-1 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleToggle("recipient")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  filterRole === "recipient"
                    ? "bg-emerald-700 text-white shadow"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Recipient Impact
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle("donor")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  filterRole === "donor"
                    ? "bg-emerald-700 text-white shadow"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Donor Impact
              </button>
            </div>
          </div>

          <h1 className="mt-6 font-aleo text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white md:text-6xl">
            Real Food. Real Impact.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Zero Waste in Action.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-emerald-50/80">
            Every listing shared and claim rescued translates into full plates, lower greenhouse
            gas emissions, and conserved water reserves across our communities.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleCopyShare}
              className="flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-800"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Copied Impact to Clipboard!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Share My Impact
                </>
              )}
            </Button>
            <Link href="/donations/browse">
              <Button variant="outline" className="rounded-full px-6 py-3 font-semibold">
                Browse Donations <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── PRIMARY METRICS GRID ─── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Meals Rescued",
              value: metrics ? `${metrics.mealsSaved}` : "0",
              subtext: "Delivered to local plates",
              icon: Heart,
              color: "from-rose-500 to-pink-600 text-white shadow-rose-900/20",
              badge: "+100% sustenance",
            },
            {
              label: "Food Waste Diverted",
              value: metrics ? `${metrics.kgDiverted} kg` : "0 kg",
              subtext: "Kept out of landfills",
              icon: Scale,
              color: "from-emerald-600 to-teal-700 text-white shadow-emerald-900/20",
              badge: "Landfill diverted",
            },
            {
              label: "CO2e Avoided",
              value: metrics ? `${metrics.co2SavedKg} kg` : "0 kg",
              subtext: "Greenhouse emissions stopped",
              icon: CloudSun,
              color: "from-sky-500 to-blue-600 text-white shadow-sky-900/20",
              badge: "Clean atmosphere",
            },
            {
              label: "Water Conserved",
              value: metrics ? `${metrics.waterSavedLiters.toLocaleString()} L` : "0 L",
              subtext: "Agricultural water protected",
              icon: Droplets,
              color: "from-cyan-500 to-teal-600 text-white shadow-cyan-900/20",
              badge: "Natural resource",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 dark:bg-white/10 dark:text-emerald-200">
                    {card.badge}
                  </span>
                </div>
                <p className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "..." : card.value}
                </p>
                <h3 className="mt-1 text-sm font-bold text-slate-700 dark:text-emerald-100">
                  {card.label}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-emerald-50/60">
                  {card.subtext}
                </p>
              </div>
            );
          })}
        </div>

        {/* ─── EQUIVALENCIES & CATEGORY DISTRIBUTION ─── */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Environmental Equivalency Section */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Trees className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  Environmental Equivalency
                </h2>
                <p className="text-xs text-slate-500 dark:text-emerald-50/60">
                  Your direct contributions converted into real-world environmental gains
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-emerald-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Trees className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-200">
                    {metrics?.equivalencies.treesPlanted || 0}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tree Seedlings Grown
                  </p>
                  <p className="text-[11px] text-slate-400">Equivalent to carbon absorption for 10 years</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-sky-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-950 dark:text-sky-200">
                    {metrics?.equivalencies.carMilesAvoided || 0} mi
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Car Miles Avoided
                  </p>
                  <p className="text-[11px] text-slate-400">Gasoline vehicle combustion emissions offset</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-amber-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-950 dark:text-amber-200">
                    {metrics?.equivalencies.smartphoneCharges.toLocaleString() || 0}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Phone Charges Offset
                  </p>
                  <p className="text-[11px] text-slate-400">Energy conserved from avoided landfill decay</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-teal-50/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-950 dark:text-teal-200">
                    {metrics?.equivalencies.showersConserved || 0}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Showers Conserved
                  </p>
                  <p className="text-[11px] text-slate-400">Standard 8-minute showers in freshwater saved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Card */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  Category Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-emerald-50/60">
                  Diverted food categories by volume
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {metrics?.categoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-emerald-100 mb-1.5">
                    <span>{cat.category}</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-700"
                      style={{ width: `${Math.max(8, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-200">
              💡 <strong>Zero-Waste Tip:</strong> High perishables like bakery and produce represent over 60% of rescued food volume nationwide. Keep listing them quickly to maximize community impact!
            </div>
          </div>
        </div>

        {/* ─── INTERACTIVE RESCUE CALCULATOR ─── */}
        <Card className="rounded-[2.5rem] border border-emerald-200/80 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/10 md:p-8">
          <CardHeader className="p-0 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <Calculator className="w-4 h-4" /> Interactive Simulation
                </div>
                <CardTitle className="text-2xl font-bold">Food Rescue Impact Calculator</CardTitle>
                <CardDescription>
                  Adjust estimated surplus quantities below to simulate environmental and community footprint savings.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setCalcProduceKg(15);
                  setCalcBakeryKg(10);
                  setCalcPreparedKg(20);
                  setCalcDairyKg(8);
                  setCalcPantryKg(12);
                }}
              >
                Reset Defaults
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span>🥦 Fresh Produce</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{calcProduceKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcProduceKg}
                  onChange={(e) => setCalcProduceKg(parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span>🥖 Bakery & Bread</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{calcBakeryKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcBakeryKg}
                  onChange={(e) => setCalcBakeryKg(parseInt(e.target.value) || 0)}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span>🍲 Prepared Meals</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{calcPreparedKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcPreparedKg}
                  onChange={(e) => setCalcPreparedKg(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span>🧀 Dairy & Chilled</span>
                  <span className="font-bold text-sky-700 dark:text-sky-400">{calcDairyKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcDairyKg}
                  onChange={(e) => setCalcDairyKg(parseInt(e.target.value) || 0)}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm font-medium">
                  <span>📦 Pantry & Dry</span>
                  <span className="font-bold text-purple-700 dark:text-purple-400">{calcPantryKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calcPantryKg}
                  onChange={(e) => setCalcPantryKg(parseInt(e.target.value) || 0)}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-700 text-white flex flex-col justify-center items-center text-center shadow-md">
                <p className="text-xs uppercase tracking-wider opacity-90 font-semibold">Simulated Food Rescue</p>
                <p className="text-3xl font-extrabold">{calcTotalKg} kg</p>
                <p className="text-xs opacity-80 mt-1">Ready to redistribute to families</p>
              </div>
            </div>

            {/* Simulated Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-emerald-950 text-white shadow-inner">
              <div className="text-center md:border-r border-emerald-800/80 p-2">
                <div className="text-xs text-emerald-300 font-medium uppercase">Meals Provided</div>
                <div className="text-2xl font-bold mt-1 text-emerald-100">{calcMeals}</div>
              </div>
              <div className="text-center md:border-r border-emerald-800/80 p-2">
                <div className="text-xs text-emerald-300 font-medium uppercase">CO₂e Avoided</div>
                <div className="text-2xl font-bold mt-1 text-emerald-100">{calcCo2} kg</div>
              </div>
              <div className="text-center md:border-r border-emerald-800/80 p-2">
                <div className="text-xs text-emerald-300 font-medium uppercase">Water Conserved</div>
                <div className="text-2xl font-bold mt-1 text-emerald-100">{calcWater.toLocaleString()} L</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xs text-emerald-300 font-medium uppercase">Car Miles Offset</div>
                <div className="text-2xl font-bold mt-1 text-emerald-100">{calcCarMiles} mi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── MILESTONE ACHIEVEMENTS & BADGES ─── */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-white">
                  Milestone Badges & Honors
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-emerald-50/70">
                Unlock achievements as you donate, rescue food, and shrink your community&apos;s carbon footprint.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              {unlockedCount} of {badges.length} Badges Unlocked
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`group relative flex flex-col justify-between rounded-[2rem] border p-6 shadow-lg backdrop-blur transition-all duration-300 ${
                  badge.unlocked
                    ? "border-emerald-300/60 bg-white/90 shadow-emerald-950/10 hover:-translate-y-1 hover:shadow-2xl dark:border-emerald-500/30 dark:bg-slate-900/80"
                    : "border-dashed border-slate-200 bg-white/50 opacity-75 grayscale hover:grayscale-0 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-3xl shadow-md dark:from-slate-800 dark:to-slate-700">
                      {badge.icon}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm bg-gradient-to-r ${
                        tierColors[badge.tier]
                      }`}
                    >
                      {badge.tier}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {badge.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-emerald-50/70">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className={badge.unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}>
                      {badge.unlocked ? "Unlocked 🎉" : `${badge.currentValue} / ${badge.requiredCount}`}
                    </span>
                    <span className="text-slate-400">{badge.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.unlocked
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-slate-400 dark:bg-slate-600"
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── OFFICIAL IMPACT CERTIFICATE ─── */}
        <Card className="rounded-[2.5rem] border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-card shadow-lg print:border-2">
          <CardHeader className="border-b border-border p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Official FoodBridge Impact Certificate
                </CardTitle>
                <CardDescription>
                  Download or print your certificate recognizing your environmental and community footprint.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-full gap-1.5 print:hidden">
                <Printer className="w-4 h-4" /> Print / Save PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="max-w-xl mx-auto space-y-2 print:hidden">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Certificate Issued To:
              </label>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Your Name or Organization"
                className="w-full px-4 py-2 border rounded-xl text-sm bg-background"
              />
            </div>

            {/* Certificate Visual Frame */}
            <div className="border-4 border-double border-emerald-700/60 dark:border-emerald-600/40 rounded-2xl p-6 md:p-10 bg-gradient-to-b from-emerald-50/20 via-white to-emerald-50/10 dark:from-emerald-950/20 dark:to-card text-center space-y-6 relative overflow-hidden">
              <div className="flex justify-center items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <HeartHandshake className="w-8 h-8" />
                <span className="font-extrabold text-2xl tracking-tight">FoodBridge Network</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                  Certificate of Sustainability & Social Impact
                </p>
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
                  {certName || "Community Partner"}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto pt-2">
                  In recognition of verified dedication towards eliminating hunger, reducing greenhouse gas emissions, and creating a circular zero-waste economy.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-w-2xl mx-auto border-y border-emerald-900/10 dark:border-emerald-200/10">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Meals Supported</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {metrics?.mealsSaved ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Food Rescued</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {metrics?.kgDiverted ?? 0} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">CO₂e Offset</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {metrics?.co2SavedKg ?? 0} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Water Saved</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {metrics?.waterSavedLiters.toLocaleString() ?? 0} L
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground pt-4 max-w-xl mx-auto gap-2">
                <div>
                  <strong>Issued By:</strong> FoodBridge Sustainability Verification
                </div>
                <div>
                  <strong>Date:</strong> {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── CALL TO ACTION BANNER ─── */}
        <div className="rounded-[2.5rem] bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-8 text-white shadow-2xl md:p-12 print:hidden">
          <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Collective Impact
              </span>
              <h2 className="mt-4 font-aleo text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ready to level up your zero-waste impact?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
                Post surplus food or claim items before pickup deadlines expire. Every meal shared
                makes our community greener and stronger.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link href="/donations/create">
                <Button className="w-full sm:w-auto bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                  Create Donation
                </Button>
              </Link>
              <Link href="/donations/browse">
                <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Browse Available Food
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
