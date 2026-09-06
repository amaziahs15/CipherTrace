// ─── Live Complaint Geo-Reference Map Preview ─────────────────────────────────
// Natural light street-map style (Google Maps-like) with click-to-fill coordinates,
// victim location pin, and predicted extraction zone vector interdiction line.

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, Crosshair, Navigation, Sparkles, X, Loader2 } from "lucide-react";
import { type Prediction } from "@/lib/hotspots";

// Custom Pin Icons for Natural Street Map
const victimIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
    <span style="position:absolute;width:100%;height:100%;border-radius:9999px;background:rgba(14,165,233,0.35);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite"></span>
    <div style="position:relative;width:24px;height:24px;border-radius:9999px;background:#0284c7;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:11px">
      V
    </div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const predictedZoneIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
    <span style="position:absolute;width:100%;height:100%;border-radius:9999px;background:rgba(239,68,68,0.4);animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></span>
    <div style="position:relative;width:28px;height:28px;border-radius:9999px;background:#dc2626;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:12px">
      🎯
    </div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Click Map Event Listener to Auto-Fill Coordinates
function MapClickHandler({ onSelectLocation }: { onSelectLocation: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelectLocation(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
    },
  });
  return null;
}

// Auto-Pan / Fit Bounds Controller
function MapViewController({
  victimCoords,
  prediction,
}: {
  victimCoords: [number, number] | null;
  prediction: Prediction | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.invalidateSize();

    if (victimCoords && prediction) {
      const bounds = L.latLngBounds([
        victimCoords,
        [prediction.lat, prediction.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, duration: 1.2 });
    } else if (victimCoords) {
      map.flyTo(victimCoords, 12, { duration: 1.0 });
    }
  }, [victimCoords, prediction, map]);

  return null;
}

// Nominatim Geo-Search Component
function GeoSearchBox({ onSelectLocation }: { onSelectLocation: (lat: number, lon: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val,
          )}&countrycodes=in&limit=5&addressdetails=0`,
        );
        const data = await res.json();
        setResults(data || []);
        setIsOpen(true);
      } catch (e) {
        console.warn("Geocoding failed:", e);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handlePick = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onSelectLocation(Number(lat.toFixed(4)), Number(lon.toFixed(4)));
      setQuery(item.display_name.split(",")[0] ?? item.display_name);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-[1000] w-64 sm:w-72">
      <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md dark:bg-slate-900/95">
        <Search className="size-3.5 text-slate-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Indian landmark/city…"
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
        />
        {loading && <Loader2 className="size-3 animate-spin text-primary shrink-0" />}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/80 bg-white shadow-xl dark:bg-slate-900">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handlePick(r)}
              className="w-full px-3 py-2 text-left text-xs text-slate-800 hover:bg-sky-50 dark:text-slate-200 dark:hover:bg-slate-800 border-b border-border/30 last:border-0 truncate block"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ComplaintMapPreviewProps {
  victimLat: string | number;
  victimLon: string | number;
  prediction: Prediction | null;
  onSelectLocation: (lat: number, lon: number) => void;
}

export default function ComplaintMapPreview({
  victimLat,
  victimLon,
  prediction,
  onSelectLocation,
}: ComplaintMapPreviewProps) {
  const parsedLat = parseFloat(String(victimLat));
  const parsedLon = parseFloat(String(victimLon));
  const hasValidVictimCoords = !isNaN(parsedLat) && !isNaN(parsedLon);

  const victimCoords: [number, number] | null = hasValidVictimCoords
    ? [parsedLat, parsedLon]
    : [28.6139, 77.2090]; // Default New Delhi center

  return (
    <div className="panel overflow-hidden border border-border/70 p-0 shadow-lg flex flex-col w-full h-[440px]">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
            <Navigation className="size-3.5" />
          </span>
          <div>
            <h3 className="font-display text-xs font-bold text-foreground">
              Geospatial Reference &amp; Extraction Vector
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Click anywhere on map or search landmark to pin victim location
            </p>
          </div>
        </div>

        {hasValidVictimCoords && (
          <span className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400">
            {parsedLat.toFixed(4)}°N, {parsedLon.toFixed(4)}°E
          </span>
        )}
      </div>

      {/* Map Body (Natural Light Street Map) */}
      <div className="relative flex-1 w-full min-h-[360px]">
        <MapContainer
          center={victimCoords}
          zoom={10}
          scrollWheelZoom
          style={{ height: "100%", width: "100%", background: "#e5e7eb" }}
        >
          {/* Natural Light Street Map Tiles (100% Free, Keyless, Crisp Street Visibility) */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
            maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          />

          {/* Search Box Overlay */}
          <GeoSearchBox onSelectLocation={onSelectLocation} />

          {/* Map Click Listener */}
          <MapClickHandler onSelectLocation={onSelectLocation} />

          {/* Victim Location Pin */}
          {hasValidVictimCoords && (
            <Marker position={[parsedLat, parsedLon]} icon={victimIcon}>
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sky-700">📍 Victim Incident Location</p>
                  <p className="font-mono text-[10px] text-slate-600">
                    {parsedLat.toFixed(4)}°N, {parsedLon.toFixed(4)}°E
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Predicted Withdrawal Zone Marker & Vector Line */}
          {prediction && (
            <>
              <Marker position={[prediction.lat, prediction.lng]} icon={predictedZoneIcon}>
                <Popup>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-rose-600">🎯 Predicted Withdrawal Cluster</p>
                    <p className="font-semibold text-slate-800">{prediction.zoneName}</p>
                    <p className="text-[10px] text-slate-600">
                      Confidence: <strong>{prediction.confidence}%</strong>
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Buffer Zone Ring */}
              <Circle
                center={[prediction.lat, prediction.lng]}
                radius={3500}
                pathOptions={{
                  color: "#dc2626",
                  fillColor: "#ef4444",
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: "4, 6",
                }}
              />

              {/* Interdiction Trajectory Vector Line from Victim to Zone */}
              {hasValidVictimCoords && (
                <Polyline
                  positions={[
                    [parsedLat, parsedLon],
                    [prediction.lat, prediction.lng],
                  ]}
                  pathOptions={{
                    color: "#0284c7",
                    weight: 2.5,
                    dashArray: "6, 8",
                    opacity: 0.85,
                  }}
                />
              )}
            </>
          )}

          {/* Map View Adjuster */}
          <MapViewController victimCoords={hasValidVictimCoords ? [parsedLat, parsedLon] : null} prediction={prediction} />
        </MapContainer>

        {/* Legend Hint Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-border/80 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-md backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-sky-500" />
            <span>Victim Pin</span>
          </span>
          {prediction && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Predicted Cluster</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
