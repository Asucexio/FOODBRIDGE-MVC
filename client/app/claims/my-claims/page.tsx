"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Claim } from "@/lib/api";
import { HeartHandshake, MapPin, Calendar, Clock, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.myClaims();
      setClaims(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load claimed donations. Please ensure you are logged in as an approved recipient.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    if (!confirm("Are you sure you want to cancel this claim? The donation will become available for others to claim.")) {
      return;
    }

    setCancelingId(claimId);
    setError("");
    setSuccess("");

    try {
      await api.cancelClaim(claimId);
      setSuccess("Claim canceled successfully.");
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch (err: any) {
      setError(err.message || "Failed to cancel claim.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-400">
              My Claimed Donations
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage food donations you have reserved for pickup.
            </p>
          </div>
          <Link href="/donations/browse">
            <Button className="bg-emerald-700 hover:bg-emerald-800">
              Browse More Donations
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Clock className="animate-spin h-8 w-8 text-emerald-600" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card">
            <HeartHandshake className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Claims Found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              You haven&apos;t claimed any food donations yet.
            </p>
            <Link href="/donations/browse">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                Browse Available Donations
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claims.map((claim) => {
              const donation = claim.donations;
              return (
                <div
                  key={claim.id}
                  className="rounded-2xl border border-emerald-900/10 bg-card overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {donation?.image_url && (
                    <div className="h-44 w-full overflow-hidden bg-muted relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={donation.image_url}
                        alt={donation.food_name || "Food donation"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {donation?.category || "General"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Claimed {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-1">
                        {donation?.food_name || "Food Donation"}
                      </h3>
                      {donation?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {donation.description}
                        </p>
                      )}

                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        {donation?.quantity && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Quantity:</span> {donation.quantity}
                          </div>
                        )}
                        {donation?.pickup_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{donation.pickup_location}</span>
                          </div>
                        )}
                        {donation?.pickup_deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Deadline: {new Date(donation.pickup_deadline).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready for pickup
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={cancelingId === claim.id}
                        onClick={() => handleCancelClaim(claim.id)}
                        className="flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {cancelingId === claim.id ? "Canceling..." : "Cancel Claim"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
