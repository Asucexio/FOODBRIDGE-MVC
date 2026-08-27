import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Beam from "@/components/beam";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Stats from "@/components/stats";

export default function Page() {
  return (
    <main className="relative flex min-h-screen flex-col gap-8 overflow-hidden p-3 md:p-2">
      <Navbar />
      <Hero />
      <Beam>
        <Features />
      </Beam>
      <Stats />
      <section className="mx-auto mb-8 w-full max-w-6xl px-4">
        <div className="rounded-[2rem] bg-emerald-900 px-6 py-12 text-center text-white shadow-2xl shadow-emerald-950/20 md:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-200">Ready to help?</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-aleo text-3xl font-semibold md:text-5xl">
            Turn today&apos;s surplus into tomorrow&apos;s community support.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-50/80">
            Start by browsing available donations or listing food your organization can safely share.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/donations/browse"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-amber-200"
            >
              Browse donations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/donations/create"
              className="inline-flex items-center justify-center rounded-full border border-emerald-100/40 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Create donation
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}