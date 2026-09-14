"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Donation } from "@/lib/api";
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Leaflet CSS is injected dynamically or loaded via CDN/link
export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  donation: Donation;
  distanceKm?: number;
}

interface InteractiveFoodMapProps {
  donations: Donation[];
  onSelectDonation?: (donation: Donation) => void;
  selectedDonationId?: string | null;
  className?: string;
  initialRadiusKm?: number;
}

// Deterministic coordinate derivation from pickup location or ID for realistic mapping
export function getCoordinatesForLocation(locationStr: string, idStr: string): [number, number] {
  // Default center: Downtown Hub (approx NYC / Central Metropolitan area, or user location)
  const baseLat = 40.7128;
  const baseLng = -74.0060;

  let hash = 0;
  const combined = (locationStr || "Downtown") + idStr;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }

  // Generate a spread of +/- 0.06 degrees (~5-8 km radius around city center)
  const latOffset = (((hash % 1000) / 1000) - 0.5) * 0.08;
  const lngOffset = ((((hash >> 8) % 1000) / 1000) - 0.5) * 0.08;

  return [baseLat + latOffset, baseLng + lngOffset];
}

// Haversine distance formula in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function InteractiveFoodMap({
  donations,
  onSelectDonation,
  selectedDonationId,
  className = "h-[600px] w-full",
  initialRadiusKm = 15,
}: InteractiveFoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const radiusCircleRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<[number, number]>([40.7128, -74.0060]);
  const [userLocated, setUserLocated] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(initialRadiusKm);
  const [selectedItem, setSelectedItem] = useState<Donation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Format deadline for popup
  const formatDeadline = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Convert donations to map points with distance calculations
  const mapLocations = useMemo<MapLocation[]>(() => {
    return donations.map((d) => {
      const [lat, lng] = getCoordinatesForLocation(d.pickup_location, d.id);
      const distanceKm = calculateDistanceKm(userLocation[0], userLocation[1], lat, lng);
      return {
        id: d.id,
        lat,
        lng,
        donation: d,
        distanceKm,
      };
    });
  }, [donations, userLocation]);

  // Filter locations by radius and category
  const filteredLocations = useMemo(() => {
    return mapLocations.filter((loc) => {
      const matchRadius = (loc.distanceKm ?? 0) <= selectedRadius;
      const matchCategory =
        categoryFilter === "all" ||
        loc.donation.category?.toLowerCase() === categoryFilter.toLowerCase();
      return matchRadius && matchCategory;
    });
  }, [mapLocations, selectedRadius, categoryFilter]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    donations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [donations]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      // Dynamically load Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 13,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Modern tile layer: CartoDB Positron / OpenStreetMap with high performance
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // User center marker (Pulsing blue dot)
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-emerald-500 opacity-60"></span>
            <span class="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-600 shadow-md">
              <span class="h-2 w-2 rounded-full bg-white"></span>
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);
      userMarkerRef.current.bindTooltip("You are here (Hub Center)", { direction: "top", offset: [0, -10] });

      // Radius boundary circle
      radiusCircleRef.current = L.circle(userLocation, {
        radius: selectedRadius * 1000,
        color: "#059669",
        fillColor: "#10b981",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map);

      setMapLoaded(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Radius Circle and User Marker on position/radius change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setLatLng(userLocation);
        radiusCircleRef.current.setRadius(selectedRadius * 1000);
      }
    });
  }, [userLocation, selectedRadius]);

  // Update Markers when filteredLocations change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
      markersRef.current = {};

      filteredLocations.forEach((loc) => {
        const isSelected = selectedItem?.id === loc.id || selectedDonationId === loc.id;
        const categoryColor =
          loc.donation.category === "Bakery"
            ? "bg-amber-600"
            : loc.donation.category === "Produce"
            ? "bg-emerald-600"
            : loc.donation.category === "Prepared" || loc.donation.category === "Meals"
            ? "bg-teal-700"
            : "bg-emerald-700";

        const customIcon = L.divIcon({
          className: "custom-food-marker",
          html: `
            <div class="group relative flex cursor-pointer items-center justify-center transition-transform duration-200 hover:scale-125 ${
              isSelected ? "scale-125 z-50" : ""
            }">
              <div class="flex h-9 w-9 items-center justify-center rounded-2xl ${categoryColor} text-white shadow-xl shadow-emerald-950/20 border-2 ${
            isSelected ? "border-amber-400 ring-4 ring-amber-300/50 animate-bounce" : "border-white"
          }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white border border-white">
                ${loc.donation.quantity.replace(/\D/g, "") || "1"}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedItem(loc.donation);
          if (onSelectDonation) onSelectDonation(loc.donation);
          map.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
        });

        markersRef.current[loc.id] = marker;
      });
    });
  }, [filteredLocations, selectedItem, selectedDonationId, mapLoaded]);

  // Handle Locate Me GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setUserLocated(true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        alert("Unable to fetch exact GPS location. Defaulting to Central Food Hub.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950 ${className}`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Radius Filter Bar */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <span className="flex items-center gap-1 px-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <Compass className="h-3.5 w-3.5" /> Radius:
          </span>
          {[5, 10, 20, 50].map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                selectedRadius === radius
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {radius} km
            </button>
          ))}
        </div>

        {/* Categories selector */}
        {categories.length > 0 && (
          <div className="pointer-events-auto hidden sm:flex items-center gap-1 rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                categoryFilter === "all"
                  ? "bg-emerald-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              All Food
            </button>
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                  categoryFilter === cat
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Live Count & Geolocation trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold text-slate-800 shadow-xl backdrop-blur transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-white/10 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-800"
            title="Detect GPS Location"
          >
            <Navigation className={`h-3.5 w-3.5 ${userLocated ? "text-emerald-600" : "text-slate-500"}`} />
            <span>{userLocated ? "GPS Locked" : "Locate Me"}</span>
          </button>

          <div className="rounded-2xl border border-white/80 bg-emerald-800/90 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur">
            {filteredLocations.length} Available Nearby
          </div>
        </div>
      </div>

      {/* Right Side Map Navigation Controls */}
      <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-800 shadow-xl backdrop-blur transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-800 shadow-xl backdrop-blur transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Floating Active Donation Card / Drawer */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-lg animate-in slide-in-from-bottom-5 duration-300">
          <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              ✕
            </button>

            {/* Thumbnail */}
            {selectedItem.image_url ? (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.food_name}
                className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
                <Package className="h-8 w-8 opacity-80" />
              </div>
            )}

            {/* Content info */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedItem.category || "General"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedItem.quantity}
                </span>
              </div>

              <h4 className="mt-1 text-base font-bold text-slate-950 dark:text-white">
                {selectedItem.food_name}
              </h4>

              <div className="mt-1.5 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{selectedItem.pickup_location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Pickup by: {formatDeadline(selectedItem.pickup_deadline)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link href={`/donations/${selectedItem.id}`} className="flex-1">
                  <Button size="sm" className="w-full rounded-xl bg-emerald-700 text-xs font-bold hover:bg-emerald-800">
                    View & Claim <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedItem.pickup_location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Navigation className="mr-1 h-3 w-3" /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
