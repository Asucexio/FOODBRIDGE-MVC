"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Claim, Profile, Donation } from "@/lib/api";
import {
  ArrowRight,
  Bookmark,
  Clock,
  HeartHandshake,
  MapPin,
  Calendar,
  Search,
  ShieldCheck,
  User,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ─── helpers ─── */
const getHoursRemaining = (deadline: string) => {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60));
};

const getDeadlineLabel = (deadline: string) => {
  const hrs = getHoursRemaining(deadline);
  if (Number.isNaN(hrs)) return "Pending";
  if (hrs <= 0) return "Due now";
  if (hrs < 24) return `${hrs}h left`;
  return `${Math.ceil(hrs / 24)}d left`;
};

const urgencyClass = (deadline: string) => {
  const hrs = getHoursRemaining(deadline);
  if (Number.isNaN(hrs)) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  if (hrs <= 0) return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  if (hrs <= 24) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
};

/* ─── quick-action cards config ─── */
const quickActions = [
  {
    title: "Browse Donations",
    description:
      "Discover available food near you and claim what your community needs before it goes to waste.",
    href: "/donations/browse",
    cta: "Browse now",
    icon: Search,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    title: "My Claims",
    description:
      "Track every donation you've reserved — see pickup locations, deadlines, and manage your claims.",
    href: "/claims/my-claims",
    cta: "View claims",
    icon: HeartHandshake,
    accent: "from-sky-500 to-blue-600",
  },
  {
    title: "Saved Donations",
    description:
      "Your bookmarked donations waiting for the right moment. Save now, claim when ready.",
    href: "/donations/saved",
    cta: "View saved",
    icon: Bookmark,
    accent: "from-amber-500 to-orange-600",
  },
  {
    title: "My Profile",
    description:
      "Keep your contact details, phone, and address up to date so donors can reach you easily.",
    href: "/profile",
    cta: "Edit profile",
    icon: User,
    accent: "from-violet-500 to-purple-600",
  },
];

/* ─── page component ─── */
export default function RecipientDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, claimsRes] = await Promise.all([
          api.me(),
          api.myClaims(),
        ]);
        setProfile(meRes.profile);
        setClaims(claimsRes.data || []);
        setSavedCount(api.getSavedDonations().length);
      } catch (err: any) {
        setError(
          err.message || "Unable to load dashboard. Please log in as a recipient."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelClaim = async (claimId: string) => {
    if (
      !confirm(
        "Cancel this claim? The donation will become available for others."
      )
    )
      return;

    setCancelingId(claimId);
    setError("");
    setSuccess("");

    try {
      await api.cancelClaim(claimId);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      setSuccess("Claim canceled successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to cancel claim.");
    } finally {
      setCancelingId(null);
    }
  };

  /* derived stats */
  const urgentCount = claims.filter(
    (c) => c.donations?.pickup_deadline && getHoursRemaining(c.donations.pickup_deadline) <= 24
  ).length;

  /* sort upcoming pickups: most urgent first */
  const upcomingPickups = [...claims]
    .filter((c) => c.donations)
    .sort((a, b) => {
      const aTime = new Date(a.donations!.pickup_deadline).getTime();
      const bTime = new Date(b.donations!.pickup_deadline).getTime();
      return aTime - bTime;
    })
    .slice(0, 6);

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <main className="relative flex min-h-screen flex-col gap-8 overflow-hidden bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_40%,_#eff6ff_70%,_#fefce8_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#022c22_0%,_#064e3b_35%,_#1e1b4b_70%,_#422006_100%)]">
      <Navbar />

      <section className="mx-auto mt-28 w-full max-w-6xl px-4 pb-4 pt-6 md:pt-12">
        {/* ─── HERO ─── */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/50 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-800 dark:bg-sky-400/15 dark:text-sky-100">
              <ShieldCheck className="h-4 w-4" /> Recipient workspace
            </span>

            {loading ? (
              <div className="mt-6 flex items-center gap-3 text-slate-500">
                <Clock className="h-5 w-5 animate-spin" />
                <span className="text-lg">Loading your dashboard…</span>
              </div>
            ) : error && !profile ? (
              <div className="mt-6">
                <h1 className="font-aleo text-3xl font-semibold tracking-tight text-red-700 dark:text-red-400 md:text-4xl">
                  Oops!
                </h1>
                <p className="mt-3 text-lg leading-8 text-slate-700 dark:text-slate-300">
                  {error}
                </p>
              </div>
            ) : (
              <>
                <h1 className="mt-6 font-aleo text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white md:text-6xl">
                  Hey {firstName},
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                    let&apos;s reduce waste.
                  </span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-emerald-50/80">
                  Claim available food, track your pickups, and help your
                  community turn surplus into sustenance — one meal at a time.
                </p>
              </>
            )}
          </div>

          {/* ─── STATS ─── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Active Claims",
                value: claims.length,
                icon: HeartHandshake,
                color:
                  "bg-emerald-700 text-white shadow-emerald-900/20",
              },
              {
                label: "Saved",
                value: savedCount,
                icon: Bookmark,
                color:
                  "bg-amber-500 text-white shadow-amber-900/20",
              },
              {
                label: "Urgent",
                value: urgentCount,
                icon: AlertTriangle,
                color:
                  urgentCount > 0
                    ? "bg-red-600 text-white shadow-red-900/20"
                    : "bg-slate-500 text-white shadow-slate-900/20",
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

        {/* ─── QUICK ACTIONS ─── */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-emerald-950 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="group flex flex-col rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-emerald-50/75">
                    {card.description}
                  </p>
                  <Link
                    href={card.href}
                    className="mt-5 inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    {card.cta}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* ─── UPCOMING PICKUPS ─── */}
        <div className="mt-12 mb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-white">
              Upcoming Pickups
            </h2>
            {claims.length > 0 && (
              <Link
                href="/claims/my-claims"
                className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                View all claims →
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Clock className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : upcomingPickups.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 py-14 text-center backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Package className="mx-auto h-12 w-12 text-emerald-600/60" />
              <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-white">
                No upcoming pickups
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-emerald-50/60">
                You haven&apos;t claimed any donations yet. Browse available food
                and claim what your community needs.
              </p>
              <Link href="/donations/browse">
                <Button className="mt-5 bg-emerald-700 hover:bg-emerald-800">
                  Browse Donations
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingPickups.map((claim) => {
                const d = claim.donations!;
                return (
                  <div
                    key={claim.id}
                    className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 shadow-xl shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
                  >
                    {/* image */}
                    {d.image_url ? (
                      <div className="h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={d.image_url}
                          alt={d.food_name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-600 text-lg font-extrabold tracking-widest text-white/80">
                        FoodBridge
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      {/* top bar */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {d.category || "General"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${urgencyClass(d.pickup_deadline)}`}
                        >
                          {getDeadlineLabel(d.pickup_deadline)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {d.food_name}
                      </h3>

                      {d.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-emerald-50/60">
                          {d.description}
                        </p>
                      )}

                      {/* meta */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-emerald-50/60">
                        {d.pickup_location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">{d.pickup_location}</span>
                          </div>
                        )}
                        {d.pickup_deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <span>
                              {new Date(d.pickup_deadline).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* actions */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Link
                          href={`/donations/${d.id}`}
                          className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400"
                        >
                          View Details →
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelingId === claim.id}
                          onClick={() => handleCancelClaim(claim.id)}
                          className="flex items-center gap-1.5 rounded-full text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {cancelingId === claim.id ? "…" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
