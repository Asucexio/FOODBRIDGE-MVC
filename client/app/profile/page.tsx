"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { api, Profile, Donation, Claim } from "@/lib/api";
import { User, KeyRound, Phone, MapPin, Mail, ShieldCheck, Clock, CheckCircle2, AlertCircle, Award, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { calculateImpact, Badge } from "@/lib/impact";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback messages
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.me();
      if (res.profile) {
        setProfile(res.profile);
        setName(res.profile.name || "");
        setPhone(res.profile.phone || "");
        setAddress(res.profile.address || "");

        // Fetch donations/claims to compute badges
        let donations: Donation[] = [];
        let claims: Claim[] = [];
        if (res.profile.role === "donor") {
          donations = await api.myDonations().catch(() => []);
        } else {
          const claimsRes = await api.myClaims().catch(() => ({ data: [] }));
          claims = claimsRes.data || [];
        }
        const impact = calculateImpact(donations, claims, res.profile.role);
        setBadges(impact.badges);
      }
    } catch (err: any) {
      setProfileError("Failed to load user profile. Please log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await api.updateProfile({ name, phone, address });
      if (res.profile) {
        setProfile(res.profile);
        setProfileSuccess("Profile updated successfully!");
      }
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword({ newPassword });
      setPasswordSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-400">
            Account & Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal profile details and security preferences.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Clock className="animate-spin h-8 w-8 text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Profile Overview Card */}
            {profile && (
              <div className="p-6 rounded-2xl border border-emerald-900/10 bg-card shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xl font-bold">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 capitalize">
                    Role: {profile.role}
                  </span>
                  {profile.role === "recipient" && (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                        profile.approved
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {profile.approved ? "Approved Recipient" : "Approval Pending"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Badges & Impact Showcase */}
            <div className="p-6 rounded-2xl border border-emerald-900/10 bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Earned Badges & Achievements</h3>
                </div>
                <Link
                  href="/impact"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  View Full Impact Hub <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      badge.unlocked
                        ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20"
                        : "border-slate-200 dark:border-white/5 opacity-60 grayscale"
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{badge.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{badge.description}</p>
                      <div className="mt-1 h-1 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Details Form */}
            <div className="p-6 rounded-2xl border border-emerald-900/10 bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <User className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              {profileSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-muted text-muted-foreground text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Main St, City, Country"
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={savingProfile} className="bg-emerald-700 hover:bg-emerald-800">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="p-6 rounded-2xl border border-emerald-900/10 bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Change Password</h3>
              </div>

              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="outline" disabled={savingPassword}>
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
