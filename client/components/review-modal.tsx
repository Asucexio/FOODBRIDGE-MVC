"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Sparkles, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRatingInput } from "@/components/user-rating-badge";
import { api, CreateReviewPayload, Review } from "@/lib/api";

const AVAILABLE_TAGS = [
  "Fresh Food",
  "Punctual Pickup",
  "Well Packaged",
  "Friendly Communication",
  "Generous Portion",
  "Respectful Handling",
  "Clear Instructions",
  "Easy Handover",
];

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewCreated?: (review: Review) => void;
  targetUserId?: string;
  targetName?: string;
  donationId?: string;
  donationTitle?: string;
  authorRole?: "donor" | "recipient";
}

export function ReviewModal({
  isOpen,
  onClose,
  onReviewCreated,
  targetUserId = "community",
  targetName = "Green Harvest Bakery",
  donationId = "don_sample",
  donationTitle = "Fresh Bread & Pastries",
  authorRole = "recipient",
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Fresh Food",
    "Punctual Pickup",
  ]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: CreateReviewPayload = {
        target_user_id: targetUserId,
        target_name: targetName,
        donation_id: donationId,
        donation_title: donationTitle,
        author_role: authorRole,
        rating,
        tags: selectedTags,
        comment,
      };

      const result = await api.createReview(payload);
      setIsSuccess(true);
      if (onReviewCreated) {
        onReviewCreated(result);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setComment("");
      }, 1400);
    } catch (err) {
      console.error("Failed to post review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-2xl bg-card border border-emerald-900/15 shadow-2xl p-6 overflow-hidden"
        >
          {/* Background accent glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Thank You for Your Feedback!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your review helps strengthen trust and celebrate generosity across our FoodBridge community.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  Community Feedback
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Rate Handover Experience
                </h2>
                <p className="text-xs text-muted-foreground">
                  Reviewing <span className="font-semibold text-foreground">{targetName}</span> for{" "}
                  <span className="italic">"{donationTitle}"</span>
                </p>
              </div>

              {/* Star Rating Section */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center flex flex-col items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Overall Experience
                </span>
                <StarRatingInput value={rating} onChange={setRating} />
              </div>

              {/* Compliments / Quick Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Add Compliments & Highlights
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102"
                            : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment / Review Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Written Feedback (Optional)
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how the food quality was, how the pickup went, or write a note of gratitude..."
                    className="w-full text-sm rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all resize-none"
                    maxLength={500}
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground/60">
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-950/20"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
