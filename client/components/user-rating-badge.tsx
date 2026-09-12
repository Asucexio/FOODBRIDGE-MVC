"use client";

import React from "react";
import { Star, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRatingBadgeProps {
  rating: number;
  totalReviews?: number;
  trustScore?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  showTrustScore?: boolean;
  className?: string;
}

export function UserRatingBadge({
  rating,
  totalReviews,
  trustScore,
  size = "md",
  showCount = true,
  showTrustScore = false,
  className,
}: UserRatingBadgeProps) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 5));
  const safeCount = Number(totalReviews) || 0;
  const safeTrust = Number(trustScore) || Math.min(100, Math.round((safeRating / 5) * 100));

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 shadow-xs backdrop-blur-xs",
        className
      )}
    >
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSizes[size],
              star <= Math.round(safeRating)
                ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                : "text-amber-300/40 dark:text-amber-700/40"
            )}
          />
        ))}
      </div>

      <span className={cn("font-bold tracking-tight text-amber-950 dark:text-amber-100", textSizes[size])}>
        {safeRating.toFixed(1)}
      </span>

      {showCount && safeCount > 0 && (
        <span className="text-xs text-muted-foreground font-normal">
          ({safeCount})
        </span>
      )}

      {showTrustScore && (
        <div className="ml-1 pl-1.5 border-l border-amber-500/20 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{safeTrust}% Trust</span>
        </div>
      )}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: "md" | "lg";
}) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const starSizes = {
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const ratingDescriptions: Record<number, string> = {
    1: "Poor experience",
    2: "Fair, could be improved",
    3: "Good & satisfactory",
    4: "Great handover!",
    5: "Exceptional community hero! ⭐",
  };

  const activeVal = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeVal;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              className="p-1 transition-all duration-150 transform hover:scale-125 focus:outline-hidden"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  starSizes[size],
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-gray-300 dark:text-gray-700 hover:text-amber-300"
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs font-medium text-muted-foreground h-4 transition-all">
        {ratingDescriptions[activeVal] || "Tap a star to rate"}
      </p>
    </div>
  );
}
