"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
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
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ImpactPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filterRole, setFilterRole] = useState<"recipient" | "donor">("recipient");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await api.me().catch(() => null);
      let userProfile = meRes?.profile || null;
      setProfile(userProfile);

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

      // If user has no items yet, we compute with starter activity
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

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const tierColors = {
    bronze: "from-amber-600 to-amber-800 text-amber-100 border-amber-500/30",
    silver: "from-slate-400 to-slate-600 text-slate-100 border-slate-400/40",
    gold: "from-yellow-400 to-amber-500 text-amber-950 border-yellow-300",
    platinum: "from-teal-400 via-emerald-400 to-cyan-500 text-slate-950 border-teal-300 font-bold",
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_40%,_#eff6ff_70%,_#fefce8_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#022c22_0%,_#064e3b_35%,_#1e1b4b_70%,_#422006_100%)]">
      <Navbar />

      <div className="mx-auto mt-28 w-full max-w-6xl px-4 pb-16 pt-4 md:pt-8">
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
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

        {/* ─── MILESTONE ACHIEVEMENTS & BADGES ─── */}
        <div className="mt-12">
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
            {badges.map((badge) => {
              return (
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
              );
            })}
          </div>
        </div>

        {/* ─── CALL TO ACTION BANNER ─── */}
        <div className="mt-14 rounded-[2.5rem] bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-8 text-white shadow-2xl md:p-12">
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
>>>>>>> eba1007 (feat: add impact analytics dashboard, milestone badges, and hub integration)
  );
}
