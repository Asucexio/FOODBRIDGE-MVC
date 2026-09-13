"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Donation, Profile } from "@/lib/api";
import { calculateImpact, ImpactMetrics, Badge } from "@/lib/impact";
import {
  ArrowRight,
  ClipboardList,
  PlusCircle,
  TrendingUp,
  Sparkles,
  Award,
  Leaf,
  Scale,
  Clock,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  Filter,
  Package,
  Activity,
  ChevronRight,
  Radio,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VerifyHandoverModal from "@/components/verify-handover-modal";
import { isHandoverCompleted, generatePickupPin } from "@/lib/verification";

const dashboardCards = [
  {
    title: "Create Donation",
    description: "Add food details, pickup instructions, deadlines, and an optional photo for recipient teams.",
    href: "/donations/create",
    cta: "Create donation",
    icon: PlusCircle,
    color: "from-emerald-600 to-teal-700",
  },
  {
    title: "My Listings",
    description: "Review posted donations, check claim status, and remove listings that are no longer available.",
    href: "/donations/my-donations",
    cta: "View listings",
    icon: ClipboardList,
    color: "from-sky-600 to-blue-700",
  },
  {
    title: "Impact & Badges",
    description: "View meals saved, CO2 avoided, and check your progress towards zero-waste achievement milestones.",
    href: "/impact",
    cta: "View impact hub",
    icon: Award,
    color: "from-amber-500 to-orange-600",
  },
];

const formatDeadline = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
};

const getDeadlineStatus = (dateStr: string) => {
  try {
    const deadline = new Date(dateStr).getTime();
    const now = Date.now();
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) return { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300", urgent: true };
    if (diffHours < 3) return { label: `Urgent (${Math.ceil(diffHours)}h left)`, color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300", urgent: true };
    if (diffHours < 24) return { label: `${Math.ceil(diffHours)}h left`, color: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300", urgent: false };
    return { label: `${Math.ceil(diffHours / 24)}d left`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", urgent: false };
  } catch {
    return { label: "Active", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", urgent: false };
  }
};

export default function DonorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [verifyingDonation, setVerifyingDonation] = useState<Donation | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [meRes, donRes] = await Promise.all([
        api.me().catch(() => null),
        api.myDonations().catch(() => []),
      ]);
      if (meRes?.profile) setProfile(meRes.profile);
      const list = donRes || [];
      setDonations(list);

      const impact = calculateImpact(list, [], "donor");
      setMetrics(impact.metrics);
      setBadges(impact.badges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "Donor";
  const unlockedBadges = badges.filter((b) => b.unlocked);

  const completedCount = useMemo(
    () => donations.filter((d) => isHandoverCompleted(d.id)).length,
    [donations]
  );
  const activeCount = donations.length - completedCount;

  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const matchesSearch =
        donation.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.pickup_location?.toLowerCase().includes(searchQuery.toLowerCase());

      const isCompleted = isHandoverCompleted(donation.id);

      if (!matchesSearch) return false;
      if (statusFilter === "active") return !isCompleted;
      if (statusFilter === "completed") return isCompleted;
      return true;
    });
  }, [donations, searchQuery, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete listing "${name}"?`)) return;
    try {
      await api.deleteDonation(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
      setActionMessage(`Listing "${name}" removed successfully.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete donation.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col gap-8 overflow-hidden bg-[linear-gradient(135deg,_#f7fee7_0%,_#ecfdf5_52%,_#fff7ed_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#052e16_0%,_#064e3b_55%,_#431407_100%)]">
      <Navbar />

      <section className="mx-auto mt-28 w-full max-w-6xl px-4 pb-16 pt-6 md:pt-12">
        {/* ─── HERO & STATS ─── */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/50 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
              <TrendingUp className="h-4 w-4" /> Donor workspace
            </span>

            {loading ? (
              <div className="mt-6 flex items-center gap-3 text-slate-500">
                <Clock className="h-5 w-5 animate-spin" />
                <span className="text-lg">Loading donor workspace…</span>
              </div>
            ) : (
              <>
                <h1 className="mt-6 font-aleo text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white md:text-6xl">
                  Welcome back, {firstName}.
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                    Move surplus food faster.
                  </span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-emerald-50/80">
                  Post ready-to-share food, track your live handovers in real time, and empower nearby recipients to turn excess meals into sustenance.
                </p>
              </>
            )}
          </div>

          {/* Quick Impact Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Listings",
                value: donations.length,
                icon: ClipboardList,
                color: "bg-emerald-700 text-white shadow-emerald-900/20",
              },
              {
                label: "Meals Saved",
                value: metrics?.mealsSaved ?? 0,
                icon: Leaf,
                color: "bg-amber-500 text-white shadow-amber-900/20",
              },
              {
                label: "CO2e Avoided",
                value: metrics ? `${metrics.co2SavedKg}kg` : "0kg",
                icon: Scale,
                color: "bg-teal-600 text-white shadow-teal-900/20",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group rounded-[1.5rem] border border-white/70 bg-white/80 p-5 text-center shadow-xl shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
                >
                  <div
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-emerald-950 dark:text-white">
                    {loading ? "—" : stat.value}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-50/60">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── REAL-TIME STATUS TRACKER & DONATIONS FEED ─── */}
        <div className="mt-12 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Live Status Tracker
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white md:text-3xl">
                Active Donations & Handover Pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Track food readiness, pickup schedules, and verify 4-digit recipient PINs directly.
              </p>
            </div>

            {/* Quick Filter Tabs & Create Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    statusFilter === "all"
                      ? "bg-white text-emerald-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  All ({donations.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    statusFilter === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    statusFilter === "completed"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>

              <Link href="/donations/create">
                <Button className="flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800">
                  <PlusCircle className="h-4 w-4" /> New Donation
                </Button>
              </Link>
            </div>
          </div>

          {/* Search bar & notification message */}
          {actionMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          <div className="mt-6 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
            <Search className="mr-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search active donations by food name, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* ─── LIVE DONATIONS LIST ─── */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Clock className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="mt-3 text-sm font-medium">Syncing live donation pipeline…</p>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-white/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {searchQuery ? "No matching donations found" : "No donations in this category"}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? "Try adjusting your search terms or filter selection."
                    : "Post surplus food from your store, restaurant, or kitchen to start saving meals."}
                </p>
                <Link href="/donations/create" className="mt-5">
                  <Button className="rounded-xl bg-emerald-700 hover:bg-emerald-800">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Create Food Listing
                  </Button>
                </Link>
              </div>
            ) : (
              filteredDonations.map((donation) => {
                const isCompleted = isHandoverCompleted(donation.id);
                const deadlineInfo = getDeadlineStatus(donation.pickup_deadline);

                return (
                  <div
                    key={donation.id}
                    className={`group relative overflow-hidden rounded-3xl border p-5 transition-all hover:shadow-xl md:p-6 ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                        : "border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
                    }`}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left info & Image */}
                      <div className="flex items-start gap-4">
                        {donation.image_url ? (
                          <img
                            src={donation.image_url}
                            alt={donation.food_name}
                            className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 font-extrabold text-white shadow-md">
                            <Leaf className="h-8 w-8 opacity-80" />
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {donation.category || "General"}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Qty: {donation.quantity}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${deadlineInfo.color}`}
                            >
                              {isCompleted ? "Completed" : deadlineInfo.label}
                            </span>
                          </div>

                          <h3 className="mt-1.5 text-lg font-bold text-slate-950 dark:text-white">
                            {donation.food_name}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                            {donation.pickup_location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="max-w-[200px] truncate">{donation.pickup_location}</span>
                              </div>
                            )}
                            {donation.pickup_deadline && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Deadline: {formatDeadline(donation.pickup_deadline)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center: Live Handover Pipeline Stepper */}
                      <div className="w-full lg:max-w-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-emerald-700 dark:text-emerald-400">1. Listed</span>
                          <span className={isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            2. Pickup Ready
                          </span>
                          <span className={isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                            3. Handover Done
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-2 flex-1 rounded-full bg-emerald-500"></div>
                          <div
                            className={`h-2 flex-1 rounded-full ${
                              isCompleted ? "bg-emerald-500" : "animate-pulse bg-amber-400"
                            }`}
                          ></div>
                          <div
                            className={`h-2 flex-1 rounded-full ${
                              isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                            }`}
                          ></div>
                        </div>
                        <p className="mt-1.5 text-right text-[10px] font-semibold text-slate-500">
                          {isCompleted ? "✅ Food Rescued & Verified" : "⏳ Awaiting Recipient Pickup PIN"}
                        </p>
                      </div>

                      {/* Right: Inline Actions */}
                      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                        {isCompleted ? (
                          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Handover Verified
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setVerifyingDonation(donation)}
                            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800"
                          >
                            <ShieldCheck className="mr-1.5 h-4 w-4" /> Verify Recipient PIN
                          </Button>
                        )}

                        <div className="flex items-center gap-1">
                          <Link href={`/donations/${donation.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                              <Edit className="mr-1 h-3 w-3" /> Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(donation.id, donation.food_name)}
                            className="h-8 rounded-lg px-2 text-xs"
                            title="Delete listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── QUICK ACTION CARDS ─── */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-emerald-950 dark:text-white">
            Donor Actions & Navigation
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="group flex flex-col justify-between rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
                >
                  <div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-emerald-50/75">
                      {card.description}
                    </p>
                  </div>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    {card.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* ─── RECENT IMPACT & BADGE MINI PREVIEW ─── */}
        <div className="mt-12 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Zero-Waste Achievements & Badges
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-50/60">
                  {unlockedBadges.length} of {badges.length} badges unlocked
                </p>
              </div>
            </div>
            <Link
              href="/impact"
              className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400"
            >
              Explore Full Impact Hub →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-emerald-50/40 p-4 dark:border-white/5 dark:bg-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {badge.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      {badge.tier}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verify Handover Modal */}
      {verifyingDonation && (
        <VerifyHandoverModal
          donationId={verifyingDonation.id}
          foodName={verifyingDonation.food_name}
          isOpen={Boolean(verifyingDonation)}
          onClose={() => setVerifyingDonation(null)}
          onVerified={() => {
            setDonations([...donations]);
            setActionMessage(`Handover verified for "${verifyingDonation.food_name}"! 🎉`);
            setTimeout(() => setActionMessage(null), 5000);
          }}
        />
      )}

      <Footer />
    </main>
  );
}