"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Donation } from "@/lib/api";
import {
  Package,
  PlusCircle,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VerifyHandoverModal from "@/components/verify-handover-modal";
import { isHandoverCompleted } from "@/lib/verification";

const formatDeadline = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingDonation, setVerifyingDonation] = useState<Donation | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.myDonations();
      setDonations(data || []);
    } catch (err: any) {
      setError(err.message || "Unable to load donations. Please ensure you are logged in as a donor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (donation: Donation) => {
    const confirmed = window.confirm(
      `Delete “${donation.food_name}”? This cannot be undone and recipients will no longer see it.`
    );
    if (!confirmed) return;

    setDeletingId(donation.id);
    setMessage("");

    try {
      await api.deleteDonation(donation.id);
      setDonations((current) => current.filter((item) => item.id !== donation.id));
      setMessage("Donation deleted successfully.");
    } catch (err: any) {
      setError(err.message || "Unable to delete donation.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-400">
              My Food Donations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your active listings, verify recipient pickup PINs, and track completed transfers.
            </p>
          </div>
          <Link href="/donations/create">
            <Button className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" /> New Donation
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Clock className="animate-spin h-8 w-8 text-emerald-600" />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card">
            <Package className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Donations Listed Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Share surplus food from your store, restaurant, or kitchen with local communities.
            </p>
            <Link href="/donations/create">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                Create First Donation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donations.map((donation) => {
              const isCompleted = isHandoverCompleted(donation.id);

              return (
                <div
                  key={donation.id}
                  className="rounded-2xl border border-emerald-900/10 bg-card overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {donation.image_url ? (
                    <div className="h-44 w-full overflow-hidden bg-muted relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={donation.image_url}
                        alt={donation.food_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-36 w-full flex items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-600 text-white font-extrabold text-lg tracking-wider">
                      FoodBridge
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {donation.category || "General"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {donation.quantity}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-1">{donation.food_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {donation.description || "No description provided."}
                      </p>

                      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        {donation.pickup_location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{donation.pickup_location}</span>
                          </div>
                        )}
                        {donation.pickup_deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Deadline: {formatDeadline(donation.pickup_deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border space-y-3">
                      {/* Verification Status & Handover Button */}
                      <div className="flex items-center justify-between gap-2">
                        {isCompleted ? (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Handover Verified
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setVerifyingDonation(donation)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl flex items-center gap-1.5 h-8"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Verify Recipient PIN
                          </Button>
                        )}

                        <div className="flex items-center gap-1">
                          <Link href={`/donations/${donation.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs rounded-lg">
                              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingId === donation.id}
                            onClick={() => remove(donation)}
                            className="h-8 px-2.5 text-xs rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Verify Handover Modal */}
        {verifyingDonation && (
          <VerifyHandoverModal
            donationId={verifyingDonation.id}
            foodName={verifyingDonation.food_name}
            isOpen={Boolean(verifyingDonation)}
            onClose={() => setVerifyingDonation(null)}
            onVerified={() => {
              setDonations([...donations]);
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
