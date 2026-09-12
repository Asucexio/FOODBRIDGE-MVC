"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Review, RatingSummary } from "@/lib/api";
import { UserRatingBadge } from "@/components/user-rating-badge";
import { ReviewModal } from "@/components/review-modal";
import {
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  MessageSquarePlus,
  Filter,
  Search,
  CheckCircle2,
  ThumbsUp,
  Building2,
  Users,
  Utensils,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMinRating, setSelectedMinRating] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviewsData = async () => {
    setIsLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        api.getCommunityReviews(),
        api.getGlobalRatingSummary(),
      ]);
      setReviews(reviewsRes.data || []);
      setSummary(summaryRes);
    } catch (err) {
      console.error("Error loading reviews", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleReviewCreated = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    // Refresh summary
    api.getGlobalRatingSummary().then((res) => setSummary(res));
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Rating filter
      if (selectedMinRating > 0 && r.rating < selectedMinRating) {
        return false;
      }
      // Tag filter
      if (selectedTag && (!r.tags || !r.tags.includes(selectedTag))) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const authorMatch = r.author_name?.toLowerCase().includes(query);
        const targetMatch = r.target_name?.toLowerCase().includes(query);
        const commentMatch = r.comment?.toLowerCase().includes(query);
        const donationMatch = r.donation_title?.toLowerCase().includes(query);
        return authorMatch || targetMatch || commentMatch || donationMatch;
      }
      return true;
    });
  }, [reviews, selectedMinRating, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-900/10 bg-gradient-to-br from-emerald-900/10 via-background to-teal-900/10 p-8 md:p-12 mb-8 shadow-sm">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-700/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Community Trust & Ratings
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-aleo">
                Community Reviews & Trust Hub
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Every donation handover is protected with mutual feedback. Read authentic experiences from donors, pantries, and shelters building a hunger-free world together.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-950/20 gap-2 h-11 px-5 rounded-xl font-medium cursor-pointer"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Leave a Handover Review
              </Button>
            </div>
          </div>
        </div>

        {/* Global Metrics & Breakdown Card */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Overall Score Card */}
            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-6 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Platform Rating
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold tracking-tight text-foreground font-aleo">
                    {summary.averageRating.toFixed(1)}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-xs"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Based on {summary.totalReviews} verified handovers
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Trust Index</p>
                    <p className="text-[11px] text-muted-foreground">Community verified</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.trustScore}%
                </span>
              </div>
            </div>

            {/* Middle: Star Distribution Bars */}
            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-6 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Rating Breakdown
              </span>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = summary.distribution[stars] || 0;
                  const percentage =
                    summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                  return (
                    <button
                      key={stars}
                      onClick={() =>
                        setSelectedMinRating(selectedMinRating === stars ? 0 : stars)
                      }
                      className={`w-full flex items-center gap-2 text-xs group text-left rounded-md px-1 py-0.5 transition-colors ${
                        selectedMinRating === stars
                          ? "bg-emerald-500/10 font-bold"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <span className="w-6 font-medium text-muted-foreground group-hover:text-foreground">
                        {stars} ★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground text-[11px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Top Compliments Tags */}
            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-6 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Top Compliments
              </span>
              <div className="flex flex-wrap gap-2">
                {summary.topTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag.name ? null : tag.name)
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTag === tag.name
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20"
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{tag.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">
                Click any tag to filter handovers praised for these attributes.
              </p>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by donor, shelter, or item..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
              <button
                onClick={() => setSelectedMinRating(0)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMinRating === 0
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Stars
              </button>
              <button
                onClick={() => setSelectedMinRating(5)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMinRating === 5
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                5★ Only
              </button>
              <button
                onClick={() => setSelectedMinRating(4)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMinRating === 4
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                4★ & Above
              </button>
            </div>

            {(selectedMinRating > 0 || selectedTag || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMinRating(0);
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Reviews Feed */}
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Loading community reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No matching reviews found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria or star filter, or be the first to leave a handover review!
            </p>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Write Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="rounded-2xl border border-border/70 bg-card/80 hover:bg-card hover:border-emerald-700/30 transition-all p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Author, Role, Target */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-700/10 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-700/20">
                          {review.author_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            {review.author_name}
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border/60">
                              {review.author_role}
                            </span>
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>reviewed</span>
                            <span className="font-semibold text-foreground">
                              {review.target_name}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatRelativeTime(review.created_at)}
                      </span>
                    </div>

                    {/* Star Rating & Donation Context */}
                    <div className="flex items-center justify-between pt-1">
                      <UserRatingBadge rating={review.rating} showCount={false} size="sm" />
                      {review.donation_title && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] italic">
                          "{review.donation_title}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-xs md:text-sm text-foreground/90 leading-relaxed italic bg-muted/20 p-3 rounded-xl border border-border/30">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer verification badge */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Handover
                    </span>
                    <span>Handover #{review.donation_id || "fb-handover"}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Review Dialog Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewCreated={handleReviewCreated}
        targetName="City Fresh Food Hub"
        donationTitle="Organic Mixed Vegetables & Fruit Crates"
      />

      <Footer />
    </div>
  );
}
