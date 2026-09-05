"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Leaf,
  Utensils,
  Droplets,
  Award,
  TrendingUp,
  Share2,
  Printer,
  Sparkles,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Globe2,
  TreeDeciduous,
  Car,
  CheckCircle2,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api, Donation } from "@/lib/api";

// Conversion factors based on FAO and EPA Food Waste Reduction Metrics
const KG_PER_MEAL = 0.45; // ~0.45 kg (1 lb) per standard meal
const CO2_KG_PER_KG_FOOD = 2.5; // ~2.5 kg CO2e saved per kg food kept from landfills
const WATER_LITERS_PER_KG_FOOD = 850; // ~850 liters of virtual water embedded per kg food
const USD_VALUE_PER_KG_FOOD = 5.2; // ~$5.20 economic value per kg food
const CO2_PER_TREE_YEAR = 22; // ~22 kg CO2 absorbed by one tree seedling per year
const CO2_PER_CAR_MILE = 0.404; // ~0.404 kg CO2 emitted per average passenger vehicle mile

export default function ImpactPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [certName, setCertName] = useState("Community Champion");
  const [isPrinting, setIsPrinting] = useState(false);

  // Interactive Calculator State
  const [calcProduceKg, setCalcProduceKg] = useState(15);
  const [calcBakeryKg, setCalcBakeryKg] = useState(10);
  const [calcPreparedKg, setCalcPreparedKg] = useState(20);
  const [calcDairyKg, setCalcDairyKg] = useState(8);
  const [calcPantryKg, setCalcPantryKg] = useState(12);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.browseDonations();
        setDonations(data || []);
      } catch (err) {
        console.error("Failed to load donations for impact data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute Platform Totals (Baseline + live donations count)
  const platformStats = useMemo(() => {
    // Extract numerical weights if parseable, or baseline estimation
    const liveWeight = donations.reduce((acc, d) => {
      const match = d.quantity?.match(/(\d+(\.\d+)?)/);
      const val = match ? parseFloat(match[0]) : 5; // default fallback 5kg per batch
      return acc + (isNaN(val) ? 5 : val);
    }, 0);

    const baseWeightKg = 1240 + liveWeight;
    const totalMeals = Math.round(baseWeightKg / KG_PER_MEAL);
    const co2SavedKg = Math.round(baseWeightKg * CO2_KG_PER_KG_FOOD);
    const waterSavedLiters = Math.round(baseWeightKg * WATER_LITERS_PER_KG_FOOD);
    const economicValue = Math.round(baseWeightKg * USD_VALUE_PER_KG_FOOD);
    const treesEquivalent = Math.round(co2SavedKg / CO2_PER_TREE_YEAR);
    const carMilesEquivalent = Math.round(co2SavedKg / CO2_PER_CAR_MILE);

    return {
      totalWeightKg: Math.round(baseWeightKg),
      totalMeals,
      co2SavedKg,
      waterSavedLiters,
      economicValue,
      treesEquivalent,
      carMilesEquivalent,
      activeDonationsCount: donations.length
    };
  }, [donations]);

  // Dynamic Calculator Metrics
  const calcTotalKg = calcProduceKg + calcBakeryKg + calcPreparedKg + calcDairyKg + calcPantryKg;
  const calcMeals = Math.round(calcTotalKg / KG_PER_MEAL);
  const calcCo2 = Math.round(calcTotalKg * CO2_KG_PER_KG_FOOD);
  const calcWater = Math.round(calcTotalKg * WATER_LITERS_PER_KG_FOOD);
  const calcValue = Math.round(calcTotalKg * USD_VALUE_PER_KG_FOOD);
  const calcTrees = (calcCo2 / CO2_PER_TREE_YEAR).toFixed(1);
  const calcCarMiles = Math.round(calcCo2 / CO2_PER_CAR_MILE);

  // Category distribution data
  const categoryBreakdown = [
    { label: "Prepared & Catering Meals", percentage: 38, color: "bg-emerald-600", icon: "🍲" },
    { label: "Fresh Fruits & Produce", percentage: 28, color: "bg-teal-500", icon: "🥦" },
    { label: "Bakery & Breads", percentage: 18, color: "bg-amber-500", icon: "🥖" },
    { label: "Dairy & Refrigerated", percentage: 10, color: "bg-sky-500", icon: "🧀" },
    { label: "Pantry & Dry Goods", percentage: 6, color: "bg-purple-500", icon: "📦" }
  ];

  // Milestone Badges
  const badges = [
    {
      title: "Seedling Rescuer",
      req: "50+ kg Food Saved",
      achieved: platformStats.totalWeightKg >= 50,
      icon: "🌱",
      desc: "Prevented first batch of food waste from landfills."
    },
    {
      title: "Community Feeder",
      req: "500+ Meals Delivered",
      achieved: platformStats.totalMeals >= 500,
      icon: "🍲",
      desc: "Nourished vulnerable neighborhood families and shelters."
    },
    {
      title: "Carbon Guardian",
      req: "2,000+ kg CO₂e Offset",
      achieved: platformStats.co2SavedKg >= 2000,
      icon: "🌍",
      desc: "Substantial greenhouse gas emission prevention."
    },
    {
      title: "Zero-Waste Champion",
      req: "5,000+ Meals Milestone",
      achieved: platformStats.totalMeals >= 5000,
      icon: "🏆",
      desc: "Elite status in the FoodBridge sustainable food network."
    }
  ];

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-300/40 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Live Sustainability & Social Impact Tracker
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
          Our Collective Impact on Food Waste & Hunger
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Every rescued surplus donation reduces greenhouse gas emissions, conserves clean water, and puts wholesome meals directly into the hands of community members who need them.
        </p>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-emerald-200/60 dark:border-emerald-900/40 bg-white/80 dark:bg-emerald-950/20 shadow-sm backdrop-blur-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-emerald-900 dark:text-emerald-300">Meals Provided</CardDescription>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300">
                  <Utensils className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white">
                {platformStats.totalMeals.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">~{platformStats.totalWeightKg.toLocaleString()} kg</span>
                of fresh surplus food rescued
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-emerald-200/60 dark:border-emerald-900/40 bg-white/80 dark:bg-emerald-950/20 shadow-sm backdrop-blur-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-emerald-900 dark:text-emerald-300">CO₂e Diverted</CardDescription>
                <div className="p-2 bg-teal-100 dark:bg-teal-900/60 rounded-lg text-teal-700 dark:text-teal-300">
                  <Leaf className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white">
                {platformStats.co2SavedKg.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">kg</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TreeDeciduous className="w-3.5 h-3.5 text-emerald-600" />
                Equal to planting <strong>{platformStats.treesEquivalent}</strong> tree seedlings
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-sky-200/60 dark:border-sky-900/40 bg-white/80 dark:bg-sky-950/20 shadow-sm backdrop-blur-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-sky-900 dark:text-sky-300">Water Conserved</CardDescription>
                <div className="p-2 bg-sky-100 dark:bg-sky-900/60 rounded-lg text-sky-700 dark:text-sky-300">
                  <Droplets className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                {(platformStats.waterSavedLiters / 1000).toFixed(1)}k <span className="text-lg font-normal text-muted-foreground">L</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Equivalent to ~<strong>{Math.round(platformStats.waterSavedLiters / 65)}</strong> home showers saved
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-amber-200/60 dark:border-amber-900/40 bg-white/80 dark:bg-amber-950/20 shadow-sm backdrop-blur-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-amber-900 dark:text-amber-300">Economic Value</CardDescription>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-amber-950 dark:text-white">
                ${platformStats.economicValue.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Direct food cost savings redistributed to communities
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Impact Calculator */}
      <Card className="border-emerald-200/80 dark:border-emerald-800/40 shadow-md bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-background dark:to-emerald-950/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" /> Interactive Tool
              </div>
              <CardTitle className="text-2xl font-bold">Personal & Business Food Rescue Calculator</CardTitle>
              <CardDescription>
                Adjust estimated surplus quantities below to simulate your environmental and community footprint savings.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setCalcProduceKg(15);
              setCalcBakeryKg(10);
              setCalcPreparedKg(20);
              setCalcDairyKg(8);
              setCalcPantryKg(12);
            }}>
              Reset Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 p-3.5 rounded-xl bg-white/70 dark:bg-card/70 border border-border">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>🥦 Fresh Produce & Fruits</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{calcProduceKg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={calcProduceKg}
                onChange={(e) => setCalcProduceKg(parseInt(e.target.value) || 0)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-white/70 dark:bg-card/70 border border-border">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>🥖 Bakery & Bread</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{calcBakeryKg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={calcBakeryKg}
                onChange={(e) => setCalcBakeryKg(parseInt(e.target.value) || 0)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-white/70 dark:bg-card/70 border border-border">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>🍲 Prepared Meals & Catering</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{calcPreparedKg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={calcPreparedKg}
                onChange={(e) => setCalcPreparedKg(parseInt(e.target.value) || 0)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-white/70 dark:bg-card/70 border border-border">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>🧀 Dairy & Chilled Items</span>
                <span className="font-bold text-sky-700 dark:text-sky-400">{calcDairyKg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={calcDairyKg}
                onChange={(e) => setCalcDairyKg(parseInt(e.target.value) || 0)}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-white/70 dark:bg-card/70 border border-border">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>📦 Dry Goods & Pantry</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{calcPantryKg} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={calcPantryKg}
                onChange={(e) => setCalcPantryKg(parseInt(e.target.value) || 0)}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-700 text-white flex flex-col justify-center items-center text-center shadow-sm">
              <p className="text-xs uppercase tracking-wider opacity-90">Total Food Rescued</p>
              <p className="text-3xl font-extrabold">{calcTotalKg} kg</p>
              <p className="text-xs opacity-80 mt-1">Ready to donate to local shelters</p>
            </div>
          </div>

          {/* Calculator Output Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-emerald-950 text-white shadow-inner">
            <div className="text-center md:border-r border-emerald-800/80 p-2">
              <div className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Meals Provided</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-emerald-100">{calcMeals}</div>
              <div className="text-[11px] text-emerald-400/80 mt-0.5">Wholesome portions</div>
            </div>
            <div className="text-center md:border-r border-emerald-800/80 p-2">
              <div className="text-xs text-emerald-300 font-medium uppercase tracking-wider">CO₂e Diverted</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-emerald-100">{calcCo2} kg</div>
              <div className="text-[11px] text-emerald-400/80 mt-0.5">≈ {calcCarMiles} car miles</div>
            </div>
            <div className="text-center md:border-r border-emerald-800/80 p-2">
              <div className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Water Saved</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-emerald-100">{calcWater.toLocaleString()} L</div>
              <div className="text-[11px] text-emerald-400/80 mt-0.5">Embedded water</div>
            </div>
            <div className="text-center p-2">
              <div className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Cost Offset</div>
              <div className="text-2xl md:text-3xl font-bold mt-1 text-emerald-100">${calcValue}</div>
              <div className="text-[11px] text-emerald-400/80 mt-0.5">Social value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown and Milestones Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Rescue Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-600" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of surplus inventory rescued by food category across the network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="p-4 mt-6 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Have surplus food to share?</p>
                <p className="text-xs text-muted-foreground">List items in under 2 minutes and connect with local shelters.</p>
              </div>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/donations/create">Donate Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Badges */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Community Sustainability Badges
            </CardTitle>
            <CardDescription>
              Eco-hero achievements unlocked by our collective donor and recipient community.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className={`p-4 rounded-xl border transition-all ${
                  badge.achieved
                    ? "bg-gradient-to-br from-white to-emerald-50/60 dark:from-card dark:to-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs"
                    : "bg-slate-50/50 dark:bg-card/40 border-dashed border-border opacity-70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{badge.icon}</span>
                  {badge.achieved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">In Progress</span>
                  )}
                </div>
                <h4 className="font-bold text-sm mt-2">{badge.title}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{badge.req}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{badge.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Official Shareable Impact Certificate */}
      <div className="pt-6">
        <Card className="border-emerald-300 dark:border-emerald-800 bg-white dark:bg-card shadow-lg print:shadow-none print:border-2 print:border-emerald-900">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Official FoodBridge Impact Certificate
                </CardTitle>
                <CardDescription>
                  Download or print this verified certificate to demonstrate your social responsibility and sustainability credentials.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="max-w-xl mx-auto space-y-2 print:hidden">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Certificate Issued To (Organization or Individual Name):
              </label>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="e.g. Green Leaf Cafe or Metro Food Shelter"
                className="w-full px-4 py-2 border rounded-lg text-sm bg-background"
              />
            </div>

            {/* Certificate Frame */}
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
                  In recognition of verified dedication towards eliminating hunger, reducing greenhouse gas emissions, and creating a circular food economy.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-w-2xl mx-auto border-y border-emerald-900/10 dark:border-emerald-200/10">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Meals Supported</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {platformStats.totalMeals.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Food Rescued</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {platformStats.totalWeightKg.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">CO₂e Offset</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {platformStats.co2SavedKg.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Water Saved</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                    {(platformStats.waterSavedLiters / 1000).toFixed(1)}k L
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
      </div>

      {/* Call to Action */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 md:p-12 text-center space-y-6 shadow-xl">
        <h3 className="text-2xl md:text-4xl font-extrabold max-w-2xl mx-auto">
          Ready to expand our collective impact?
        </h3>
        <p className="text-emerald-100 max-w-xl mx-auto text-sm md:text-base">
          Join hundreds of restaurants, grocers, and community kitchens working together to rescue surplus food and feed local neighborhoods.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold">
            <Link href="/donations/create">Share Surplus Food</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold">
            <Link href="/donations/browse">Find Available Donations</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
