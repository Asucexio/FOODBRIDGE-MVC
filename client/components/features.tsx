"use client";

import { FeatureCardProps } from "@/types/components/feature";
import { HandHeart, PackageCheck, Route, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import FeatureCard from "./feature-card";

export default function Features() {
  const features: FeatureCardProps[] = [
    {
      title: "Post surplus in minutes",
      description:
        "Add food details, pickup windows, photos, and safety notes so local partners can claim with confidence.",
      icon: PackageCheck,
    },
    {
      title: "Match with trusted recipients",
      description:
        "Approved shelters and nonprofits can find nearby donations, request claims, and coordinate handoffs quickly.",
      icon: HandHeart,
    },
    {
      title: "Coordinate reliable pickup",
      description:
        "Keep donors, drivers, and recipients aligned with clear statuses from available to claimed to completed.",
      icon: Route,
    },
  ];

  return (
    <section id="how-it-works" className="flex flex-col items-center justify-center gap-8 px-4 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl space-y-4 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
          <ShieldCheck className="h-4 w-4" /> Built for accountable sharing
        </span>
        <h2 className="font-aleo text-3xl font-semibold tracking-tight md:text-5xl 4xl:text-6xl">
          A clearer path from extra food to real impact
        </h2>
        <p className="text-lg leading-8 text-muted-foreground 4xl:text-3xl">
          FoodBridge gives every participant the context they need to move fast, reduce waste, and serve more neighbors with dignity.
        </p>
      </motion.div>

      <section className="flex flex-wrap items-stretch justify-center gap-4 max-md:pt-8 md:gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="flex"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.15,
              ease: "easeOut",
            }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </section>
    </section>
  );
}