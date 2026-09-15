"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RescueRouteSimulator from "@/components/rescue-route-simulator";
import VolunteerPassportModal from "@/components/volunteer-passport-modal";
import {
  api,
  RescueMission,
  RescueStats,
  CourierLeaderboardItem,
  VehicleType,
  MissionUrgency,
  MissionStatus,
  CreateMissionPayload,
} from "@/lib/api";
import {
  Bike,
  Car,
  Truck,
  Footprints,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Leaf,
  Scale,
  Sparkles,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Package,
  ThermometerSnowflake,
  Flame,
  KeyRound,
  Compass,
  Navigation,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  BadgeCheck,
  Radio,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const vehicleConfig: Record<VehicleType, { label: string; icon: typeof Bike; color: string; badgeBg: string }> = {
  bike: {
    label: "Bicycle / Cargo",
    icon: Bike,
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  car: {
    label: "Standard Car",
    icon: Car,
    color: "text-sky-700 dark:text-sky-400",
    badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
  },
  van: {
    label: "Cargo Van / Truck",
    icon: Truck,
    color: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
  },
  walk: {
    label: "Walking / Cart",
    icon: Footprints,
    color: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
};

const urgencyConfig: Record<MissionUrgency, { label: string; bg: string; icon: typeof Flame }> = {
  critical: {
    label: "Critical (< 2h)",
    bg: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/50",
    icon: Flame,
  },
  urgent: {
    label: "Urgent (Today)",
    bg: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50",
    icon: Clock,
  },
  flexible: {
    label: "Flexible Window",
    bg: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900/50",
    icon: Clock,
  },
};

const statusConfig: Record<MissionStatus, { label: string; step: number; color: string }> = {
  available: { label: "Ready for Pickup", step: 1, color: "bg-emerald-500 text-white" },
  assigned: { label: "Volunteer Assigned", step: 2, color: "bg-sky-500 text-white" },
  picked_up: { label: "Food Picked Up", step: 3, color: "bg-amber-500 text-white" },
  in_transit: { label: "In Transit to Shelter", step: 3, color: "bg-indigo-500 text-white" },
  delivered: { label: "Delivered & Verified", step: 4, color: "bg-emerald-600 text-white" },
  cancelled: { label: "Cancelled", step: 0, color: "bg-gray-400 text-white" },
};

export default function VolunteersPage() {
  const [missions, setMissions] = useState<RescueMission[]>([]);
  const [stats, setStats] = useState<RescueStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<CourierLeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Active Mission
  const [activeMissionModal, setActiveMissionModal] = useState<RescueMission | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [expandedSimulatorId, setExpandedSimulatorId] = useState<string | null>(null);
  const [verificationInputPin, setVerificationInputPin] = useState("");
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Flash Rescue Countdown Timer
  const [flashSeconds, setFlashSeconds] = useState(2700); // 45 mins countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFlashTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Volunteer Courier Mode
  const [myVehicle, setMyVehicle] = useState<VehicleType>("bike");
  const [isCourierActive, setIsCourierActive] = useState(true);

  // Dispatch Form State
  const [dispatchForm, setDispatchForm] = useState<CreateMissionPayload>({
    title: "",
    donor_name: "",
    pickup_address: "",
    recipient_name: "",
    dropoff_address: "",
    food_category: "Prepared Meals",
    weight_kg: 15,
    vehicle_required: "bike",
    urgency: "urgent",
    requires_refrigeration: false,
    notes: "",
    pickup_window: "Next 2 hours",
    distance_km: 2.8,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [missionRes, statsRes, leaderRes] = await Promise.all([
        api.getRescueMissions(),
        api.getRescueStats(),
        api.getCouriersLeaderboard(),
      ]);

      if (missionRes?.data) setMissions(missionRes.data);
      if (statsRes) setStats(statsRes);
      if (leaderRes) setLeaderboard(leaderRes);
    } catch (err) {
      console.error("Failed to load rescue missions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (selectedStatus === "available" && m.status !== "available") return false;
      if (selectedStatus === "active" && !["assigned", "picked_up", "in_transit"].includes(m.status)) return false;
      if (selectedStatus === "delivered" && m.status !== "delivered") return false;

      if (selectedVehicle !== "all" && m.vehicle_required !== selectedVehicle) return false;
      if (selectedUrgency !== "all" && m.urgency !== selectedUrgency) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          m.title.toLowerCase().includes(q) ||
          m.donor_name.toLowerCase().includes(q) ||
          m.recipient_name.toLowerCase().includes(q) ||
          m.food_category.toLowerCase().includes(q) ||
          m.pickup_address.toLowerCase().includes(q) ||
          m.dropoff_address.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [missions, selectedStatus, selectedVehicle, selectedUrgency, searchQuery]);

  // Handle claiming a mission
  const handleClaimMission = async (missionId: string) => {
    try {
      setStatusActionLoading(true);
      const updated = await api.claimRescueMission(missionId, "You (Courier Volunteer)");
      setMissions((prev) => prev.map((m) => (m.id === missionId ? updated : m)));
      setActiveMissionModal(updated);
      setActionMessage({
        type: "success",
        text: `Mission accepted! Head to ${updated.pickup_address} for pickup.`,
      });
      const newStats = await api.getRescueStats();
      setStats(newStats);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to claim mission" });
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Handle step progression
  const handleAdvanceStatus = async (targetStatus: MissionStatus) => {
    if (!activeMissionModal) return;
    setStatusActionLoading(true);
    setActionMessage(null);

    try {
      let pin = undefined;
      if (targetStatus === "delivered") {
        if (!verificationInputPin.trim()) {
          setActionMessage({
            type: "error",
            text: "Please enter the 4-digit recipient handover PIN to confirm delivery.",
          });
          setStatusActionLoading(false);
          return;
        }
        pin = verificationInputPin.trim();
      }

      const updated = await api.updateRescueStatus(activeMissionModal.id, targetStatus, undefined, pin);
      setMissions((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setActiveMissionModal(updated);
      setVerificationInputPin("");
      setActionMessage({
        type: "success",
        text:
          targetStatus === "delivered"
            ? `🎉 Delivery verified & completed! Thank you for rescuing ${updated.weight_kg}kg of food.`
            : `Status updated to ${statusConfig[targetStatus].label}.`,
      });

      const newStats = await api.getRescueStats();
      setStats(newStats);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message.includes("PIN") ? "Incorrect handover PIN code. Please ask the shelter for their 4-digit PIN." : err.message || "Status update failed",
      });
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Handle dispatch creation
  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.title || !dispatchForm.pickup_address || !dispatchForm.dropoff_address) {
      setActionMessage({ type: "error", text: "Please fill in title, pickup address, and dropoff address." });
      return;
    }

    try {
      setStatusActionLoading(true);
      const newMission = await api.createRescueMission(dispatchForm);
      setMissions((prev) => [newMission, ...prev]);
      setShowDispatchModal(false);
      setActionMessage({
        type: "success",
        text: `Rescue mission "${newMission.title}" dispatched! Nearby couriers have been alerted.`,
      });
      setDispatchForm({
        title: "",
        donor_name: "",
        pickup_address: "",
        recipient_name: "",
        dropoff_address: "",
        food_category: "Prepared Meals",
        weight_kg: 15,
        vehicle_required: "bike",
        urgency: "urgent",
        requires_refrigeration: false,
        notes: "",
        pickup_window: "Next 2 hours",
        distance_km: 2.8,
      });
      const newStats = await api.getRescueStats();
      setStats(newStats);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to create rescue mission." });
    } finally {
      setStatusActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background text-foreground">
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 pt-28 pb-16">
        {/* Banner Alert */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between border shadow-sm transition-all ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-200"
                : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/70 dark:border-red-800 dark:text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <p className="text-sm font-medium">{actionMessage.text}</p>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-sm font-semibold opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white p-8 md:p-12 shadow-2xl mb-8 border border-emerald-700/40">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-20 top-8 opacity-15 hidden lg:block">
            <Bike className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md mb-4 text-emerald-200 text-xs md:text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Volunteer Food Courier Logistics & Rescue Dispatch
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-aleo mb-4">
              Bridge the Last Mile of Food Rescue
            </h1>
            <p className="text-emerald-100 text-base md:text-lg mb-8 leading-relaxed">
              Transport surplus meals directly from bakeries, markets, and caterers to local shelters and community kitchens. Pick your transport mode, claim a rescue run, and deliver fresh nutrition where it counts.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                onClick={() => setShowDispatchModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Dispatch New Rescue Run
              </Button>

              <Button
                onClick={() => setShowPassportModal(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-5 py-2.5 rounded-xl backdrop-blur-sm flex items-center gap-2"
              >
                <BadgeCheck className="h-5 w-5 text-amber-300" />
                My Courier Passport & ID
              </Button>
            </div>
          </div>
        </div>

        {/* Live Emergency Flash Rescue Broadcast Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 md:p-5 shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-red-400/40">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
            <Radio className="w-32 h-32 text-white animate-pulse" />
          </div>

          <div className="flex items-start md:items-center gap-3.5 z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shrink-0 mt-0.5 md:mt-0">
              <Zap className="h-6 w-6 text-amber-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black/30 text-amber-300 text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  Flash Rescue Alert
                </span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  ⏳ Expires in {formatFlashTime(flashSeconds)}
                </span>
              </div>
              <h3 className="text-base font-bold mt-1">
                Hot Artisan Sourdough & 30 Fresh Soups Ready for Immediate Rescue
              </h3>
              <p className="text-xs text-red-100">
                Green Harvest Bakery (142 Baker St) &rarr; Hope Community Shelter (88 Peace Ave) • ~18.5 kg
              </p>
            </div>
          </div>

          <div className="z-10 shrink-0 w-full md:w-auto">
            <Button
              onClick={() => handleClaimMission("mission_1")}
              disabled={statusActionLoading}
              className="w-full md:w-auto bg-white text-red-700 hover:bg-red-50 font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Bike className="h-4 w-4" />
              Claim Flash Run
            </Button>
          </div>
        </div>

        {/* Courier Mode & Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* Active Vehicle Status */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Courier Mode
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isCourierActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isCourierActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                {isCourierActive ? "Online & Ready" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {(() => {
                  const Icon = vehicleConfig[myVehicle].icon;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <p className="font-bold text-sm">{vehicleConfig[myVehicle].label}</p>
                <p className="text-xs text-muted-foreground">Max load: ~25kg recommended</p>
              </div>
            </div>
            <div className="flex gap-1.5 pt-2 border-t border-border/50">
              {(["bike", "car", "van", "walk"] as VehicleType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setMyVehicle(v)}
                  className={`flex-1 text-xs py-1 px-1.5 rounded-lg border font-medium transition ${
                    myVehicle === v
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {v === "bike" ? "🚲 Bike" : v === "car" ? "🚗 Car" : v === "van" ? "🚐 Van" : "🚶 Walk"}
                </button>
              ))}
            </div>
          </div>

          {/* Rescued Weight Metric */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Food Rescued
              </span>
              <Scale className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {stats?.totalKgRescued || 185} <span className="text-lg font-bold text-muted-foreground">kg</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                ~{stats?.estimatedMealsProvided || 400} nutritious meals provided
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: "78%" }} />
            </div>
          </div>

          {/* CO2 Emissions Offset */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CO₂e Emissions Prevented
              </span>
              <Leaf className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-400 tracking-tight">
                {stats?.co2SavedKg || 462.5} <span className="text-lg font-bold text-muted-foreground">kg</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Equal to 1,900+ km driven by standard gas cars
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: "65%" }} />
            </div>
          </div>

          {/* Dispatch Volume / Active Runs */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dispatches Today
              </span>
              <Navigation className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-sky-700 dark:text-sky-400 tracking-tight">
                {stats?.availableCount || 2}{" "}
                <span className="text-sm font-semibold text-muted-foreground">open runs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeCount || 2} active runs in transit right now
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>

        {/* Main Content Layout: Missions Board + Leaderboard Sidebar */}
        <div id="mission-board" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Missions List (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-4">
              {/* Search & Refresh */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by pickup, donor, shelter, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  className="rounded-xl flex items-center gap-2 border-border/80"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "All Runs" },
                    { id: "available", label: "🟢 Ready to Claim" },
                    { id: "active", label: "🚴 Active / In Transit" },
                    { id: "delivered", label: "✅ Delivered" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        selectedStatus === tab.id
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Vehicle & Urgency Selectors */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">Any Vehicle</option>
                    <option value="bike">🚲 Bike / Cargo</option>
                    <option value="car">🚗 Car</option>
                    <option value="van">🚐 Van / Truck</option>
                    <option value="walk">🚶 Walking</option>
                  </select>

                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">Any Urgency</option>
                    <option value="critical">🔥 Critical (&lt;2h)</option>
                    <option value="urgent">⏳ Urgent (Today)</option>
                    <option value="flexible">🍃 Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Missions List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-card animate-pulse border border-border/60" />
                ))}
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="bg-card border border-border/70 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Bike className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-1">No Rescue Missions Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  No dispatches match the selected filter criteria. Try adjusting your filters or dispatch a new rescue run.
                </p>
                <Button onClick={() => setShowDispatchModal(true)} className="bg-emerald-600 hover:bg-emerald-500">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Dispatch New Rescue Run
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMissions.map((mission) => {
                  const vehicle = vehicleConfig[mission.vehicle_required] || vehicleConfig.bike;
                  const urgency = urgencyConfig[mission.urgency] || urgencyConfig.urgent;
                  const status = statusConfig[mission.status] || statusConfig.available;
                  const VehicleIcon = vehicle.icon;
                  const UrgencyIcon = urgency.icon;
                  const isSimulatorOpen = expandedSimulatorId === mission.id;

                  return (
                    <div
                      key={mission.id}
                      className="bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Top Urgency / Vehicle / Status Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${urgency.bg}`}
                          >
                            <UrgencyIcon className="h-3.5 w-3.5" />
                            {urgency.label}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${vehicle.badgeBg}`}
                          >
                            <VehicleIcon className="h-3.5 w-3.5" />
                            {vehicle.label}
                          </span>

                          {mission.requires_refrigeration && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                              <ThermometerSnowflake className="h-3 w-3" />
                              Cold-Chain / Perishable
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Title & Food Details */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3">
                        <h3 className="text-lg font-bold text-foreground font-aleo tracking-tight">
                          {mission.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            📦 {mission.weight_kg} kg
                          </span>
                          <span>•</span>
                          <span>{mission.food_category}</span>
                        </div>
                      </div>

                      {/* Route Path (Pickup -> Dropoff) */}
                      <div className="bg-muted/40 rounded-xl p-3.5 mb-4 border border-border/40 space-y-2.5">
                        <div className="flex items-start gap-2.5 text-xs">
                          <div className="mt-0.5 flex flex-col items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                            <span className="w-0.5 h-6 bg-border my-0.5" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-950" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="font-bold text-foreground">{mission.donor_name}</p>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {mission.pickup_address}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-foreground">{mission.recipient_name}</p>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {mission.dropoff_address}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-sm text-foreground">
                              {mission.distance_km} km
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              ~{mission.est_duration_mins} mins
                            </div>
                            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                              {mission.pickup_window}
                            </div>
                          </div>
                        </div>
                      </div>

                      {mission.notes && (
                        <p className="text-xs text-muted-foreground italic mb-4 bg-muted/20 px-3 py-1.5 rounded-lg">
                          &ldquo;{mission.notes}&rdquo;
                        </p>
                      )}

                      {/* Expandable Live Route Simulator */}
                      {isSimulatorOpen && (
                        <div className="mb-4">
                          <RescueRouteSimulator mission={mission} />
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          {mission.volunteer_name ? (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              👤 Assigned to: <strong className="text-emerald-700 dark:text-emerald-400">{mission.volunteer_name}</strong>
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ⚡ Awaiting Volunteer Courier
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedSimulatorId(isSimulatorOpen ? null : mission.id)}
                            className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                          >
                            <Compass className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                            {isSimulatorOpen ? "Hide Radar" : "🗺️ Route Radar"}
                          </Button>

                          {mission.status === "available" ? (
                            <Button
                              onClick={() => handleClaimMission(mission.id)}
                              disabled={statusActionLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                            >
                              <Bike className="h-4 w-4" />
                              Accept Rescue Run
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setActiveMissionModal(mission)}
                              variant="outline"
                              className="text-xs font-bold px-4 py-2 rounded-xl border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5"
                            >
                              <Navigation className="h-4 w-4" />
                              Manage Mission Route
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar (Leaderboard, Guide, Eco Calculator) */}
          <div className="space-y-6">
            {/* Top Volunteer Couriers Leaderboard */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-foreground font-aleo text-base">
                    Courier Honor Roll
                  </h3>
                </div>
                <button
                  onClick={() => setShowPassportModal(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  View Passport
                </button>
              </div>

              <div className="space-y-3.5">
                {leaderboard.map((courier, idx) => (
                  <div
                    key={courier.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl">{courier.avatar}</span>
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-foreground">{courier.name}</p>
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-semibold">
                            {courier.rating} ★
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{courier.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                        {courier.total_kg_rescued} kg
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {courier.completed_missions} runs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Safe Transport Protocols */}
            <div className="bg-gradient-to-br from-emerald-950/10 to-teal-950/20 border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-foreground">Food Courier Guidelines</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  Keep hot and chilled items strictly separated in insulated bags.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  Perform pickup directly from the designated donor kitchen or dock.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  Always ask recipient shelter staff for the 4-digit handover PIN upon arrival.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Active Mission Route & Handover Modal with Embedded Simulator */}
      {activeMissionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveMissionModal(null);
                setActionMessage(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  statusConfig[activeMissionModal.status].color
                }`}
              >
                {statusConfig[activeMissionModal.status].label}
              </span>
              <span className="text-xs text-muted-foreground">Mission #{activeMissionModal.id}</span>
            </div>

            <h2 className="text-xl font-bold font-aleo mb-4">{activeMissionModal.title}</h2>

            {/* Stepper Progress */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: "Assigned", step: 1, target: "assigned" },
                { label: "Picked Up", step: 2, target: "picked_up" },
                { label: "In Transit", step: 3, target: "in_transit" },
                { label: "Delivered", step: 4, target: "delivered" },
              ].map((s) => {
                const currentStep = statusConfig[activeMissionModal.status].step;
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="text-center">
                    <div
                      className={`h-2 rounded-full mb-1.5 transition-all ${
                        isPassed ? "bg-emerald-600" : "bg-muted"
                      }`}
                    />
                    <p
                      className={`text-[11px] font-semibold ${
                        isCurrent
                          ? "text-emerald-700 dark:text-emerald-300 font-bold"
                          : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Embedded Live Route Simulator */}
            <div className="mb-6">
              <RescueRouteSimulator mission={activeMissionModal} />
            </div>

            {/* Handover PIN Section if Delivering */}
            {activeMissionModal.status !== "delivered" && (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center gap-2 mb-1 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <KeyRound className="h-4 w-4" />
                    Handover PIN Verification
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-3">
                    Ask the shelter staff for their 4-digit handover PIN (Demo PIN is <strong>{activeMissionModal.verification_code}</strong>) to confirm delivery.
                  </p>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={verificationInputPin}
                    onChange={(e) => setVerificationInputPin(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-background focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Transition Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {activeMissionModal.status === "assigned" && (
                    <Button
                      onClick={() => handleAdvanceStatus("picked_up")}
                      disabled={statusActionLoading}
                      className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
                    >
                      Confirm Food Picked Up from Donor
                    </Button>
                  )}

                  {activeMissionModal.status === "picked_up" && (
                    <Button
                      onClick={() => handleAdvanceStatus("in_transit")}
                      disabled={statusActionLoading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                    >
                      Start Transit to Shelter
                    </Button>
                  )}

                  {["assigned", "picked_up", "in_transit"].includes(activeMissionModal.status) && (
                    <Button
                      onClick={() => handleAdvanceStatus("delivered")}
                      disabled={statusActionLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                    >
                      Verify PIN & Complete Delivery
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeMissionModal.status === "delivered" && (
              <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-100">
                  Rescue Mission Successfully Completed!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  You saved {activeMissionModal.weight_kg}kg of food and averted ~{(activeMissionModal.weight_kg * 2.5).toFixed(1)}kg of CO₂e emissions.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setActiveMissionModal(null)}
              className="w-full rounded-xl"
            >
              Close Window
            </Button>
          </div>
        </div>
      )}

      {/* Dispatch New Mission Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDispatchModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <PlusCircle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold font-aleo">Dispatch a Food Rescue Run</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Request volunteer courier pickup for surplus meals or heavy food crates.
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Title / Food Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25 Fresh Bento Boxes & Pastries"
                  value={dispatchForm.title}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Donor / Kitchen Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Green Harvest Bakery"
                    value={dispatchForm.donor_name}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, donor_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Recipient Shelter</label>
                  <input
                    type="text"
                    placeholder="e.g. Hope Community Shelter"
                    value={dispatchForm.recipient_name}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, recipient_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Pickup Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 142 Baker St, Back Door Kitchen"
                  value={dispatchForm.pickup_address}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, pickup_address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Dropoff Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 88 Peace Avenue, Downtown"
                  value={dispatchForm.dropoff_address}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, dropoff_address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={dispatchForm.weight_kg}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={dispatchForm.vehicle_required}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicle_required: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bike">🚲 Bike</option>
                    <option value="car">🚗 Car</option>
                    <option value="van">🚐 Van</option>
                    <option value="walk">🚶 Walk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Urgency</label>
                  <select
                    value={dispatchForm.urgency}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, urgency: e.target.value as MissionUrgency })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="critical">🔥 Critical (&lt;2h)</option>
                    <option value="urgent">⏳ Urgent</option>
                    <option value="flexible">🍃 Flexible</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="refrigeration"
                  checked={dispatchForm.requires_refrigeration}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, requires_refrigeration: e.target.checked })}
                  className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="refrigeration" className="text-xs font-medium cursor-pointer">
                  Requires thermal insulated container / Cold-chain
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Pickup Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ring kitchen buzzer, boxes already packaged."
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={statusActionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  {statusActionLoading ? "Dispatching..." : "Dispatch Courier Run"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volunteer Courier Digital Passport Modal */}
      {showPassportModal && (
        <VolunteerPassportModal onClose={() => setShowPassportModal(false)} />
      )}

      <Footer />
    </div>
  );
}
