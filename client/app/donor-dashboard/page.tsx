"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default function DonorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "Donor";
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <main className="relative flex min-h-screen flex-col gap-8 overflow-hidden bg-[linear-gradient(135deg,_#f7fee7_0%,_#ecfdf5_52%,_#fff7ed_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#052e16_0%,_#064e3b_55%,_#431407_100%)]">
      <Navbar />

      <section className="mx-auto mt-28 w-full max-w-6xl px-4 pb-10 pt-6 md:pt-12">
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
                  Post ready-to-share food, track your environmental footprint, and empower nearby recipients to turn excess meals into sustenance.
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

        {/* ─── QUICK ACTION CARDS ─── */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-emerald-950 dark:text-white">
            Donor Actions
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
                    <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                      {card.title}
                    </h2>
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

      <Footer />
    </main>
  );
}