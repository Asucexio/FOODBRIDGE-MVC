"use client";

import React, { useState, useEffect } from "react";
import { RescueMission, VehicleType } from "@/lib/api";
import {
  Navigation,
  Compass,
  MapPin,
  Bike,
  Car,
  Truck,
  Footprints,
  Clock,
  Gauge,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Flame,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RescueRouteSimulatorProps {
  mission: RescueMission;
  onDelivered?: () => void;
}

export default function RescueRouteSimulator({ mission, onDelivered }: RescueRouteSimulatorProps) {
  const [progress, setProgress] = useState(
    mission.status === "delivered" ? 100 : mission.status === "in_transit" ? 50 : mission.status === "picked_up" ? 25 : 5
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x

  const distanceKm = mission.distance_km || 3.2;
  const remainingKm = Math.max(0, Number((distanceKm * (1 - progress / 100)).toFixed(1)));
  const remainingMins = Math.max(0, Math.ceil((mission.est_duration_mins || 15) * (1 - progress / 100)));

  // Health and Eco calculations based on vehicle
  const caloriesBurned = Math.round(
    mission.vehicle_required === "bike" ? distanceKm * 32 : mission.vehicle_required === "walk" ? distanceKm * 55 : 0
  );
  const co2SavedKg = Number((mission.weight_kg * 2.5).toFixed(1));
  const gasSavingsUsd = Number((distanceKm * 0.18).toFixed(2));

  // Turn by turn directions
  const directions = [
    {
      step: 1,
      instruction: `Depart from ${mission.donor_name} at ${mission.pickup_address}`,
      distance: "0.2 km",
      icon: MapPin,
      completed: progress >= 20,
    },
    {
      step: 2,
      instruction: "Head toward Main Arterial & merge onto Green Corridor",
      distance: `${(distanceKm * 0.4).toFixed(1)} km`,
      icon: Compass,
      completed: progress >= 50,
    },
    {
      step: 3,
      instruction: `Approach destination: ${mission.recipient_name}`,
      distance: `${(distanceKm * 0.3).toFixed(1)} km`,
      icon: Navigation,
      completed: progress >= 80,
    },
    {
      step: 4,
      instruction: `Arrive at loading bay: ${mission.dropoff_address}. Request 4-digit PIN.`,
      distance: "0.1 km",
      icon: CheckCircle2,
      completed: progress >= 100,
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1.5 * simSpeed;
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress, simSpeed]);

  const getVehicleIcon = () => {
    switch (mission.vehicle_required) {
      case "car":
        return <Car className="h-5 w-5 text-sky-500" />;
      case "van":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "walk":
        return <Footprints className="h-5 w-5 text-amber-500" />;
      default:
        return <Bike className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Live GPS Route & Dispatch Radar</h4>
            <p className="text-xs text-muted-foreground">
              {mission.donor_name} &rarr; {mission.recipient_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs font-semibold rounded-lg h-8"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" /> Pause
              </>
            ) : progress >= 100 ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Replay Route
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1" /> Simulate GPS
              </>
            )}
          </Button>

          {progress >= 100 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProgress(5)}
              className="text-xs h-8 px-2"
            >
              Reset
            </Button>
          )}

          <div className="flex gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/40">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  simSpeed === speed
                    ? "bg-emerald-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Interactive Route Map Visualizer Canvas */}
      <div className="relative h-44 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950 p-4 overflow-hidden border border-emerald-800/40 shadow-inner flex flex-col justify-between text-white">
        {/* Radar grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Radar Info */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE TELEMETRY: {Math.round(progress)}% EN ROUTE
          </span>
          <span className="text-emerald-200/80">
            ETA: <strong>{remainingMins} mins</strong> ({remainingKm} km left)
          </span>
        </div>

        {/* Animated Polyline & Waypoint nodes */}
        <div className="relative z-10 my-auto py-2">
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Courier Position Marker */}
          <div
            className="absolute -top-1 transition-all duration-300 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.min(96, Math.max(4, progress))}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white text-emerald-950 shadow-xl flex items-center justify-center border-2 border-emerald-400">
              {getVehicleIcon()}
            </div>
            <span className="text-[10px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-emerald-300 mt-1">
              Courier
            </span>
          </div>

          {/* Start and End nodes */}
          <div className="flex justify-between items-center text-[11px] font-semibold text-emerald-100/90 px-1">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-900" />
              <span>{mission.donor_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{mission.recipient_name}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-900" />
            </div>
          </div>
        </div>

        {/* Eco & Impact Telemetry Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-200/90 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            CO₂ Averted: <strong>{co2SavedKg} kg</strong>
          </span>
          {caloriesBurned > 0 && (
            <span className="flex items-center gap-1 text-amber-300">
              <Flame className="h-3.5 w-3.5" />
              Calories: <strong>~{caloriesBurned} kcal</strong>
            </span>
          )}
          <span className="flex items-center gap-1 text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Fuel Saved: <strong>${gasSavingsUsd}</strong>
          </span>
        </div>
      </div>

      {/* Turn by Turn Directions List */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Turn-by-Turn Navigation Cues
        </h5>
        <div className="space-y-1.5">
          {directions.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.step}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition border ${
                  d.completed
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-foreground"
                    : "bg-muted/30 border-border/40 text-muted-foreground"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    d.completed
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${d.completed ? "text-emerald-950 dark:text-emerald-200" : ""}`}>
                    {d.instruction}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold shrink-0">{d.distance}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
