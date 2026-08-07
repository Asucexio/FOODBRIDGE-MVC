import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ArrowRight, ClipboardList, PlusCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

const dashboardCards = [
  {
    title: "Create Donation",
    description: "Add food details, pickup instructions, deadlines, and an optional photo for recipient teams.",
    href: "/donations/create",
    cta: "Create donation",
    icon: PlusCircle,
  },
  {
    title: "My Donations",
    description: "Review posted donations, check claim status, and remove listings that are no longer available.",
    href: "/donations/my-donations",
    cta: "View listings",
    icon: ClipboardList,
  },
];

export default function DonorDashboardPage() {
  return (
    <main className="relative flex min-h-screen flex-col gap-8 overflow-hidden bg-[linear-gradient(135deg,_#f7fee7_0%,_#ecfdf5_52%,_#fff7ed_100%)] p-3 md:p-2 dark:bg-[linear-gradient(135deg,_#052e16_0%,_#064e3b_55%,_#431407_100%)]">
      <Navbar />
      <section className="mx-auto mt-28 w-full max-w-6xl px-4 pb-10 pt-6 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/50 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
              <TrendingUp className="h-4 w-4" /> Donor workspace
            </span>
            <h1 className="mt-6 font-aleo text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white md:text-6xl">
              Move surplus food faster.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-emerald-50/80">
              Post ready-to-share food, keep your active listings organized, and help nearby recipient partners plan safe pickups before food goes to waste.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="group rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-slate-950 dark:text-white">{card.title}</h2>
                  <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600 dark:text-emerald-50/75">{card.description}</p>
                  <Link href={card.href} className="mt-6 inline-flex items-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                    {card.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}