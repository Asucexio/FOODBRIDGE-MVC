"use client";

import React, { useState } from "react";
import { CourierLeaderboardItem, VehicleType } from "@/lib/api";
import {
  Award,
  ShieldCheck,
  Bike,
  Car,
  Truck,
  Footprints,
  Leaf,
  Scale,
  Sparkles,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  HeartHandshake,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VolunteerPassportModalProps {
  courier?: CourierLeaderboardItem;
  onClose: () => void;
}

export default function VolunteerPassportModal({ courier, onClose }: VolunteerPassportModalProps) {
  const [copied, setCopied] = useState(false);

  const defaultCourier: CourierLeaderboardItem = {
    id: "vol_alex_1",
    name: "Alex Rivera",
    avatar: "🚴",
    role: "Lead Cargo Cyclist",
    vehicle_type: "bike",
    rating: 4.95,
    completed_missions: 38,
    total_kg_rescued: 412.5,
    co2_saved_kg: 98.4,
    badge: "Eco-Champion 🌟",
    status: "active",
  };

  const current = courier || defaultCourier;

  const handleCopyId = () => {
    navigator.clipboard.writeText(`FOODBRIDGE-COURIER-${current.id.toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <BadgeCheck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold font-aleo text-foreground">
            Official Courier Passport
          </h2>
        </div>

        {/* Digital Courier ID Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 shadow-xl border border-emerald-500/40 mb-5 overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <HeartHandshake className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                {current.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base tracking-tight">{current.name}</h3>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-200">{current.role}</p>
                <p className="text-[11px] text-emerald-300/80 font-mono">
                  ID: FB-{current.id.substring(4, 10).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[11px] font-extrabold shadow-sm">
                {current.rating} ★ Verified
              </span>
              <p className="text-[10px] text-emerald-200/90 mt-1">{current.badge}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 text-center mb-4">
            <div>
              <p className="text-xs font-bold text-amber-300">{current.total_kg_rescued} kg</p>
              <p className="text-[10px] text-emerald-200/80">Food Saved</p>
            </div>
            <div className="border-x border-white/10">
              <p className="text-xs font-bold text-emerald-300">{current.completed_missions}</p>
              <p className="text-[10px] text-emerald-200/80">Missions</p>
            </div>
            <div>
              <p className="text-xs font-bold text-teal-300">{current.co2_saved_kg} kg</p>
              <p className="text-[10px] text-emerald-200/80">CO₂ Offset</p>
            </div>
          </div>

          {/* Verification Code Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-emerald-200/90">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Dispatch Certified
            </span>
            <span className="font-mono text-[10px] tracking-wider text-emerald-300">
              EXP: 2028-12-31
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleCopyId}
            variant="outline"
            className="w-full text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> Copied Passport ID!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Verified Courier ID
              </>
            )}
          </Button>

          <Button
            onClick={() => window.print()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Print / Save PDF Passport
          </Button>
        </div>
      </div>
    </div>
  );
}
