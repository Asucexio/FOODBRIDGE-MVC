"use client";

import { motion } from "motion/react";
import Counter from "@/components/counter";

export default function Stats() {
  const stats: { value: number; suffix?: string; description: string }[] = [
    { value: 1200, suffix: "+", description: "Meals ready to reroute" },
    { value: 85, suffix: "%", description: "Less coordination time" },
    { value: 18, description: "Partner pickup zones" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl space-y-4 text-center 4xl:max-w-4xl"
      >
        <h2 className="font-aleo text-3xl font-semibold tracking-tight md:text-5xl 4xl:text-6xl">
          Designed to make every donation count
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground 4xl:text-3xl">
          See what is available, who needs it, and where it is headed—without spreadsheets, phone tag, or missed pickup windows.
        </p>
      </motion.div>

      <div className="grid w-full gap-4 rounded-[2rem] border border-emerald-900/10 bg-white/70 p-4 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/5 md:grid-cols-3 md:p-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.description}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: 0.1 + index * 0.15,
              ease: "easeOut",
            }}
            className="rounded-3xl bg-gradient-to-br from-emerald-50 to-amber-50 p-6 text-center dark:from-emerald-950/50 dark:to-amber-950/30"
          >
            <p className="mb-2 text-4xl font-semibold tracking-tight text-emerald-900 dark:text-emerald-50 md:text-5xl 4xl:text-6xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="font-medium text-slate-600 dark:text-slate-300 4xl:text-2xl">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}