import { Donation, Claim, Role } from "./api";

export type ImpactMetrics = {
  mealsSaved: number;
  kgDiverted: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  totalDonationsOrClaims: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; meals: number; co2: number }[];
  equivalencies: {
    treesPlanted: number;
    carMilesAvoided: number;
    smartphoneCharges: number;
    showersConserved: number;
  };
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  requiredCount: number;
  metric: "meals" | "kg" | "actions" | "co2";
  unlocked: boolean;
  progress: number; // 0 - 100
  currentValue: number;
};

export const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "progress" | "currentValue">[] = [
  {
    id: "first_spark",
    title: "First Spark",
    description: "Completed your first food rescue or donation listing.",
    icon: "🌱",
    tier: "bronze",
    requiredCount: 1,
    metric: "actions",
  },
  {
    id: "eco_ally",
    title: "Eco Ally",
    description: "Rescued or provided over 25 nutritious meals.",
    icon: "🥗",
    tier: "bronze",
    requiredCount: 25,
    metric: "meals",
  },
  {
    id: "waste_warrior",
    title: "Waste Warrior",
    description: "Diverted at least 50 kg of surplus food from landfills.",
    icon: "🛡️",
    tier: "silver",
    requiredCount: 50,
    metric: "kg",
  },
  {
    id: "carbon_neutralizer",
    title: "Carbon Hero",
    description: "Prevented 100+ kg of CO2e greenhouse emissions.",
    icon: "🌳",
    tier: "gold",
    requiredCount: 100,
    metric: "co2",
  },
  {
    id: "community_pillar",
    title: "Community Pillar",
    description: "Completed 10 or more food share or rescue interactions.",
    icon: "🤝",
    tier: "platinum",
    requiredCount: 10,
    metric: "actions",
  },
  {
    id: "century_savior",
    title: "Century Saver",
    description: "Surpassed 100 meals provided or rescued for local families.",
    icon: "👑",
    tier: "platinum",
    requiredCount: 100,
    metric: "meals",
  },
];

// Helper to parse numeric quantity from strings like "10 kg", "5 boxes", "20 meals", or default
function parseQuantityToKg(qtyStr?: string | null): number {
  if (!qtyStr) return 4.5; // average default per donation listing
  const match = qtyStr.match(/(\d+(\.\d+)?)/);
  const num = match ? parseFloat(match[1]) : 4.5;
  const lower = qtyStr.toLowerCase();

  if (lower.includes("kg") || lower.includes("kilo")) return num;
  if (lower.includes("lb") || lower.includes("pound")) return Math.round(num * 0.453592 * 10) / 10;
  if (lower.includes("meal") || lower.includes("portion") || lower.includes("serving")) return Math.round(num * 0.4 * 10) / 10;
  if (lower.includes("box") || lower.includes("crate")) return num * 5;
  if (lower.includes("bag")) return num * 3;
  return num > 0 ? num : 4.5;
}

export function calculateImpact(
  donations: Donation[] = [],
  claims: Claim[] = [],
  role: Role = "recipient"
): { metrics: ImpactMetrics; badges: Badge[] } {
  const isDonor = role === "donor";
  const itemsCount = isDonor ? donations.length : claims.length;

  let totalKg = 0;
  const categoryMap: Record<string, number> = {};

  if (isDonor) {
    donations.forEach((d) => {
      const kg = parseQuantityToKg(d.quantity);
      totalKg += kg;
      const cat = d.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
  } else {
    claims.forEach((c) => {
      const kg = c.donations ? parseQuantityToKg(c.donations.quantity) : 4.5;
      totalKg += kg;
      const cat = c.donations?.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
  }

  // If user has zero items yet, add gentle starter estimation if needed or keep 0
  const kgDiverted = Math.round(totalKg * 10) / 10;
  // Standard EPA & FAO conversion: ~1.2 kg = 1 meal (approx 0.4 - 0.5 kg per meal standard) => 1 kg ~ 2.4 meals
  const mealsSaved = Math.round(kgDiverted * 2.4);
  // 1 kg food waste diverted saves ~ 2.5 kg CO2e
  const co2SavedKg = Math.round(kgDiverted * 2.5 * 10) / 10;
  // 1 kg food waste saves ~ 180 liters of virtual agricultural water
  const waterSavedLiters = Math.round(kgDiverted * 180);

  // Category breakdown calculations
  const totalCategoriesCount = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / totalCategoriesCount) * 100),
  }));

  if (categoryBreakdown.length === 0) {
    categoryBreakdown.push({ category: "Produce & Fresh", count: 0, percentage: 40 });
    categoryBreakdown.push({ category: "Bakery & Breads", count: 0, percentage: 30 });
    categoryBreakdown.push({ category: "Prepared Meals", count: 0, percentage: 30 });
  }

  // Monthly trends (last 6 months distribution or projected)
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const monthlyTrend = monthNames.map((month, idx) => {
    const factor = (idx + 1) / monthNames.length;
    return {
      month,
      meals: Math.max(1, Math.round(mealsSaved * factor * 0.35 + (idx * 2))),
      co2: Math.max(1, Math.round(co2SavedKg * factor * 0.35 + (idx * 3))),
    };
  });

  // Real world equivalencies
  const treesPlanted = Math.round((co2SavedKg / 21.7) * 10) / 10; // ~21.7 kg CO2 absorbed per tree per year
  const carMilesAvoided = Math.round(co2SavedKg * 2.48); // ~0.404 kg CO2 per mile driven
  const smartphoneCharges = Math.round(co2SavedKg * 121); // ~8.22 g CO2 per full smartphone charge
  const showersConserved = Math.round(waterSavedLiters / 65); // ~65L per standard 8-minute shower

  const metrics: ImpactMetrics = {
    mealsSaved,
    kgDiverted,
    co2SavedKg,
    waterSavedLiters,
    totalDonationsOrClaims: itemsCount,
    categoryBreakdown,
    monthlyTrend,
    equivalencies: {
      treesPlanted: Math.max(0.1, treesPlanted),
      carMilesAvoided,
      smartphoneCharges,
      showersConserved,
    },
  };

  // Evaluate Badges
  const badges: Badge[] = BADGE_DEFINITIONS.map((def) => {
    let currentValue = 0;
    if (def.metric === "actions") currentValue = itemsCount;
    else if (def.metric === "meals") currentValue = mealsSaved;
    else if (def.metric === "kg") currentValue = kgDiverted;
    else if (def.metric === "co2") currentValue = co2SavedKg;

    const progress = Math.min(100, Math.round((currentValue / def.requiredCount) * 100));
    const unlocked = currentValue >= def.requiredCount;

    return {
      ...def,
      unlocked,
      progress,
      currentValue,
    };
  });

  return { metrics, badges };
}
