"use client";

import { ArrowRight, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const impactStats = [
  { value: "24/7", label: "donation visibility" },
  { value: "3x", label: "faster local matching" },
  { value: "0", label: "good meals wasted" },
];

export default function Hero() {
  return (
    <section className="mx-2 mt-24 md:mx-4 lg:mx-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,_#fef3c7,_transparent_32%),linear-gradient(135deg,_#f7fee7_0%,_#ecfdf5_48%,_#fff7ed_100%)] px-6 py-14 shadow-2xl shadow-emerald-950/10 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.22),_transparent_30%),linear-gradient(135deg,_#052e16_0%,_#064e3b_55%,_#431407_100%)] md:px-12 lg:px-16 lg:py-20"
      >
        <div className="absolute -right-24 top-10 -z-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white/75 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-50"
            >
              <HeartHandshake className="h-4 w-4" />
              Community-powered food rescue
            </motion.div>

            <div className="space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
                className="max-w-4xl font-aleo text-4xl font-semibold leading-[1.02] tracking-tight text-emerald-950 dark:text-white md:text-6xl xl:text-7xl"
              >
                Bridge surplus meals to neighbors who need them most.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
                className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-emerald-50/80 md:text-xl"
              >
                FoodBridge helps restaurants, grocers, and community partners list available donations, coordinate pickup, and track impact from one warm, easy-to-use dashboard.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" className="rounded-full px-6 shadow-lg shadow-emerald-900/15">
                <Link href="/donations/browse" className="inline-flex items-center">
                  Browse donations <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full px-6">
                <Link href="/donations/create">Share surplus food</Link>
              </Button>
            </motion.div>

            <div className="grid w-full max-w-2xl grid-cols-3 gap-3 pt-2">
              {impactStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/65 p-4 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <p className="text-2xl font-bold text-emerald-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-emerald-50/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-emerald-950/15 backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Live match board</p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Today&apos;s pickups</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">12 active</span>
              </div>

              <div className="space-y-4 py-5">
                {[
                  ["Bakery boxes", "Downtown Pantry", "Ready in 18 min", "32 meals"],
                  ["Fresh produce", "Northside Shelter", "Driver assigned", "46 lbs"],
                  ["Prepared lunches", "Hope Kitchen", "Claim pending", "28 meals"],
                ].map(([title, org, status, quantity]) => (
                  <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-300"><MapPin className="h-3.5 w-3.5" /> {org}</p>
                      </div>
                      <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-100">{quantity}</p>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200"><ShieldCheck className="h-4 w-4" /> {status}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}