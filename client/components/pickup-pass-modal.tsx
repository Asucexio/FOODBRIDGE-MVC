"use client";

import React, { useState } from "react";
import {
  generatePickupPin,
  formatPassId,
  generateQrMatrix,
  isHandoverCompleted,
} from "@/lib/verification";
import {
  QrCode,
  Copy,
  CheckCircle2,
  MapPin,
  Calendar,
  X,
  ShieldCheck,
  Printer,
  Sparkles,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PickupPassModalProps {
  claimId: string;
  foodName: string;
  quantity?: string;
  pickupLocation?: string;
  pickupDeadline?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PickupPassModal({
  claimId,
  foodName,
  quantity,
  pickupLocation,
  pickupDeadline,
  isOpen,
  onClose,
}: PickupPassModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pin = generatePickupPin(claimId);
  const passId = formatPassId(claimId);
  const matrix = generateQrMatrix(`foodbridge://verify/${claimId}/${pin}`);
  const isCompleted = isHandoverCompleted(claimId);

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 md:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Pass Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Official FoodBridge Pickup Pass
          </span>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {foodName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-emerald-50/60 font-mono">
            PASS ID: {passId}
          </p>
        </div>

        {/* Completed Handover Ribbon if already marked */}
        {isCompleted && (
          <div className="my-4 rounded-xl bg-emerald-100 p-3 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Handover Confirmed & Food Rescued!
          </div>
        )}

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/5 dark:bg-slate-800/50">
          <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-200/80">
            <svg
              viewBox="0 0 21 21"
              className="h-40 w-40 fill-slate-900"
              shapeRendering="crispEdges"
            >
              {matrix.map((row, y) =>
                row.map((active, x) =>
                  active ? (
                    <rect
                      key={`${x}-${y}`}
                      x={x}
                      y={y}
                      width={1}
                      height={1}
                    />
                  ) : null
                )
              )}
            </svg>
          </div>
          <p className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Show this QR code or 4-digit PIN to the donor at pickup
          </p>
        </div>

        {/* 4-Digit Verification PIN */}
        <div className="rounded-2xl bg-emerald-950 p-4 text-center text-white shadow-md">
          <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold">
            Pickup Verification PIN
          </p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="font-mono text-4xl font-extrabold tracking-widest text-white">
              {pin}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPin}
              className="h-8 border-emerald-700 bg-emerald-900/60 text-xs text-emerald-100 hover:bg-emerald-800"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-300" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Listing Details */}
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
          {quantity && (
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Quantity:</strong> {quantity}</span>
            </div>
          )}
          {pickupLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate"><strong>Location:</strong> {pickupLocation}</span>
            </div>
          )}
          {pickupDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Deadline:</strong> {new Date(pickupDeadline).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 rounded-full text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Pass
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            className="flex-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
