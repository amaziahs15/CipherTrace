import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { type Hotspot, type Prediction, type TopPrediction, formatWindow } from "@/lib/hotspots";
import { SYNTHETIC_EMERGING_PATTERNS, type EmergingCoordinatedPattern } from "@/lib/collectiveThreat";
import {
  Layers,
  Flame,
  MapPin,
  Search,
  X,
  Loader2,
  Filter,
  Calendar,
  Shield,
  Clock,
  RotateCcw,
  Sparkles,
  Radio,
} from "lucide-react";
import { useTheme } from "@/components/ThemeLanguageControls";

// ─── Marker icons ─────────────────────────────────────────────────────────────

const predictionIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:30px;height:30px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.65 0.19 25/0.3);animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite"></span>
    <span style="position:absolute;inset:5px;border-radius:9999px;background:oklch(0.65 0.19 25);box-shadow:0 0 0 3px oklch(1 0 0/0.4),0 0 16px 4px oklch(0.65 0.19 25/0.6)"></span>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const prediction2Icon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px">
    <span style="position:absolute;inset:3px;border-radius:9999px;background:oklch(0.78 0.17 70);opacity:0.75;box-shadow:0 0 0 2px oklch(1 0 0/0.3)"></span>
    <span style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.78 0.17 70/0.2)"></span>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const prediction3Icon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:16px;height:16px">
    <span style="position:absolute;inset:3px;border-radius:9999px;background:oklch(0.72 0.12 200);opacity:0.6;box-shadow:0 0 0 2px oklch(1 0 0/0.25)"></span>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const RANK_ICONS = [predictionIcon, prediction2Icon, prediction3Icon];

// ─── Filterable Complaint Data Structure & Sample Generator ──────────────────

export type ComplaintPoint = {
  id: string;
  lat: number;
  lng: number;
  clusterId: number;    // 0: Mumbai, 1: Kolkata, 2: Chennai, 3: Delhi, 4: Bengaluru
  clusterName: string;
  fraudType: string;
  fraudAmount: number;
  timestamp: number;    // epoch ms
  intensity: number;    // 0.35 - 1.0
};

const FRAUD_CATEGORIES = [
  "UPI Fraud",
  "OTP Fraud",
  "Fake Investment",
  "Loan App Scam",
  "Phishing",
] as const;

const CLUSTER_METADATA = [
  { id: 0, name: "Mumbai Metro", lat: 19.0713, lng: 72.8758, baseAmount: 160000, spread: 0.08, count: 36 },
  { id: 1, name: "Kolkata Central", lat: 22.5696, lng: 88.3604, baseAmount: 140000, spread: 0.07, count: 32 },
  { id: 2, name: "Chennai North", lat: 13.0916, lng: 80.2701, baseAmount: 110000, spread: 0.065, count: 26 },
  { id: 3, name: "Delhi NCR", lat: 28.6139, lng: 77.2090, baseAmount: 210000, spread: 0.09, count: 44 },
  { id: 4, name: "Bengaluru South", lat: 12.9716, lng: 77.5946, baseAmount: 135000, spread: 0.06, count: 30 },
];

// DEMO / SAMPLE DATA GENERATION: Generates structured complaints with realistic timestamps
function generateSampleComplaints(): ComplaintPoint[] {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const items: ComplaintPoint[] = [];

  CLUSTER_METADATA.forEach((c) => {
    for (let i = 0; i < c.count; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / c.count) * c.spread;
      const lat = c.lat + r * Math.cos(angle);
      const lng = c.lng + r * Math.sin(angle);

      // Deterministic spread of fraud types
      const fraudType = FRAUD_CATEGORIES[(i + c.id * 2) % FRAUD_CATEGORIES.length] ?? "UPI Fraud";
      const fraudAmount = Math.round(c.baseAmount * (0.5 + ((i * 43) % 100) / 45));
      const intensity = Math.min(1.0, Math.max(0.35, fraudAmount / 220000));

      // Timestamps distributed over the last 30 days (more dense in recent 7 days)
      const daysAgo = (i % 6 === 0) ? (i % 2) * 0.4 : ((i * 7) % 30);
      const timestamp = now - daysAgo * ONE_DAY - (i * 3600000);

      items.push({
        id: `CMP-${c.id}${i.toString().padStart(3, "0")}`,
        lat,
        lng,
        clusterId: c.id,
        clusterName: c.name,
        fraudType,
        fraudAmount,
        timestamp,
        intensity,
      });
    }
  });

  return items;
}

const ALL_SAMPLE_COMPLAINTS = generateSampleComplaints();

// ─── Heatmap Layer Component ─────────────────────────────────────────────────

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;

    const layer = (L as any).heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 14,
      max: 1.0,
      minOpacity: 0.35,
      gradient: {
        0.15: "#00f0ff",
        0.35: "#3b82f6",
        0.55: "#eab308",
        0.75: "#f97316",
        1.0: "#ef4444",
      },
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
}

// ─── Recenter & Auto-Resize Helpers ──────────────────────────────────────────

function MapAutoResizeController() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.invalidateSize();

    const handleResize = () => {
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 400);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("ciphertrace:layout_resize", handleResize);

    const container = map.getContainer();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("ciphertrace:layout_resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, [map]);

  return null;
}

function Recenter({
  prediction,
  flyTo,
}: {
  prediction: Prediction | null;
  flyTo: [number, number] | null;
}) {
  const map = useMap();
  const prevPrediction = useRef<Prediction | null>(null);

  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, 13, { duration: 1.1 });
    } else if (prediction && prediction !== prevPrediction.current) {
      map.flyTo([prediction.lat, prediction.lng], 12, { duration: 1.1 });
      prevPrediction.current = prediction;
    }
  }, [prediction, flyTo, map]);

  return null;
}

// ─── Nominatim types & Search Overlay ────────────────────────────────────────

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function LocationSearch({
  onLocate,
}: {
  onLocate: (lat: number, lon: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback((q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setNoResults(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setNoResults(false);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=7&addressdetails=0`,
      {
        signal: abortRef.current.signal,
        headers: { "Accept-Language": "en" },
      },
    )
      .then((res) => res.json())
      .then((data: NominatimResult[]) => {
        setResults(data);
        setShowDropdown(true);
        setNoResults(data.length === 0);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setResults([]);
          setNoResults(true);
          setShowDropdown(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocate(lat, lon);
      setQuery(r.display_name.split(",")[0] ?? r.display_name);
      setShowDropdown(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        zIndex: 1000,
        width: 280,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 6px 24px -4px rgba(0,0,0,0.5)",
          padding: "0 10px",
          height: 38,
          gap: 8,
        }}
      >
        <Search style={{ width: 15, height: 15, color: "var(--primary)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="Search location in India…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 12,
            color: "var(--foreground)",
            fontFamily: "inherit",
          }}
        />
        {loading && <Loader2 style={{ width: 14, height: 14, color: "var(--primary)", animation: "spin 1s linear infinite", flexShrink: 0 }} />}
        {query && !loading && (
          <button onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center" }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          style={{
            marginTop: 6,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 12px 32px -6px rgba(0,0,0,0.6)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {noResults ? (
            <div style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted-foreground)" }}>
              No locations found
            </div>
          ) : (
            results.map((r) => (
              <div
                key={r.place_id}
                onClick={() => handleSelect(r)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "var(--foreground)",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.68 0.16 248 / 0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {r.display_name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Layer View Mode Selector Overlay ────────────────────────────────────────

export type MapViewMode = "both" | "heatmap" | "markers";

function LayerControlOverlay({
  viewMode,
  setViewMode,
  showEmergingPatterns,
  setShowEmergingPatterns,
}: {
  viewMode: MapViewMode;
  setViewMode: (m: MapViewMode) => void;
  showEmergingPatterns: boolean;
  setShowEmergingPatterns: (fn: (v: boolean) => boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 3,
          gap: 2,
          boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => setViewMode("both")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 9px",
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s",
            background: viewMode === "both" ? "oklch(0.68 0.16 248 / 0.25)" : "transparent",
            color: viewMode === "both" ? "oklch(0.68 0.16 248)" : "var(--muted-foreground)",
          }}
        >
          <Layers style={{ width: 13, height: 13 }} />
          <span>Both</span>
        </button>

        <button
          onClick={() => setViewMode("heatmap")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 9px",
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s",
            background: viewMode === "heatmap" ? "oklch(0.65 0.19 25 / 0.25)" : "transparent",
            color: viewMode === "heatmap" ? "#ef4444" : "var(--muted-foreground)",
          }}
        >
          <Flame style={{ width: 13, height: 13 }} />
          <span>Heatmap</span>
        </button>

        <button
          onClick={() => setViewMode("markers")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 9px",
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s",
            background: viewMode === "markers" ? "oklch(0.68 0.16 248 / 0.25)" : "transparent",
            color: viewMode === "markers" ? "oklch(0.68 0.16 248)" : "var(--muted-foreground)",
          }}
        >
          <MapPin style={{ width: 13, height: 13 }} />
          <span>Pins</span>
        </button>

        {/* Additive Emerging Micro-Loss Patterns Layer Toggle */}
        <button
          onClick={() => setShowEmergingPatterns((v) => !v)}
          title="Toggle Additive Emerging Small-Loss Pattern Clusters Layer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 9px",
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s",
            background: showEmergingPatterns ? "rgba(245, 158, 11, 0.25)" : "transparent",
            color: showEmergingPatterns ? "#f59e0b" : "var(--muted-foreground)",
          }}
        >
          <Sparkles style={{ width: 13, height: 13 }} />
          <span>Micro-Patterns</span>
        </button>
      </div>

      {(viewMode === "both" || viewMode === "heatmap") && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "6px 10px",
            boxShadow: "0 6px 18px -4px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: 165,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
            <span>Low Risk</span>
            <span>Critical</span>
          </div>
          <div
            style={{
              height: 5,
              borderRadius: 3,
              background: "linear-gradient(to right, #00f0ff, #3b82f6, #eab308, #f97316, #ef4444)",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Map Component with Integrated Drill-Down Filters ───────────────────

export default function HotspotMap({
  hotspots,
  prediction,
  onLocate,
}: {
  hotspots: Hotspot[];
  prediction: Prediction | null;
  onLocate: (lat: number, lon: number) => void;
}) {
  const { theme } = useTheme();
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>("both");
  const [showEmergingPatterns, setShowEmergingPatterns] = useState<boolean>(true);

  // Genuinely 100% Free & Keyless Esri Canvas Tile URLs ({z}/{y}/{x} format)
  const isLight = theme === "light";
  const esriBaseUrl = isLight
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  const esriRefUrl = isLight
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}";

  // ── Drill-down filter states ──
  const [selectedFraudType, setSelectedFraudType] = useState<string>("all");
  const [selectedHotspot, setSelectedHotspot] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all"); // "24h" | "7d" | "30d" | "all"

  const handleLocate = useCallback(
    (lat: number, lon: number) => {
      setFlyTo([lat, lon]);
      onLocate(lat, lon);
      setTimeout(() => setFlyTo(null), 1600);
    },
    [onLocate],
  );

  // ── Filtered Complaints & Heatmap Points ──
  const filteredComplaints = useMemo(() => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let maxAge = Infinity;
    if (timeRange === "24h") maxAge = ONE_DAY;
    else if (timeRange === "7d") maxAge = 7 * ONE_DAY;
    else if (timeRange === "30d") maxAge = 30 * ONE_DAY;

    return ALL_SAMPLE_COMPLAINTS.filter((c) => {
      if (selectedFraudType !== "all" && c.fraudType !== selectedFraudType) return false;
      if (selectedHotspot !== "all" && String(c.clusterId) !== selectedHotspot) return false;
      if (timeRange !== "all" && now - c.timestamp > maxAge) return false;
      return true;
    });
  }, [selectedFraudType, selectedHotspot, timeRange]);

  // Combine filtered complaints into [lat, lng, intensity] array
  const heatPoints: [number, number, number][] = useMemo(() => {
    const pts: [number, number, number][] = filteredComplaints.map((c) => [c.lat, c.lng, c.intensity]);

    if (prediction) {
      // Dynamic prediction included if matching filter
      pts.push([prediction.lat, prediction.lng, 1.0]);
      prediction.topPredictions?.forEach((tp) => {
        pts.push([tp.lat, tp.lng, Math.max(0.6, tp.confidence / 100)]);
      });
    }

    return pts;
  }, [filteredComplaints, prediction]);

  // Filtered hotspot pins based on location selector
  const filteredHotspots = useMemo(() => {
    if (selectedHotspot === "all") return hotspots;
    const targetCluster = CLUSTER_METADATA.find((c) => String(c.id) === selectedHotspot);
    if (!targetCluster) return hotspots;
    return hotspots.filter((h) =>
      h.name.toLowerCase().includes(targetCluster.name.toLowerCase().split(" ")[0] ?? "") ||
      h.id.includes(String(targetCluster.id))
    );
  }, [hotspots, selectedHotspot]);

  const topPreds: TopPrediction[] = prediction?.topPredictions ?? [];
  const showHeatmap = viewMode === "both" || viewMode === "heatmap";
  const showMarkers = viewMode === "both" || viewMode === "markers";

  const handleResetFilters = () => {
    setSelectedFraudType("all");
    setSelectedHotspot("all");
    setTimeRange("all");
  };

  const hasActiveFilters = selectedFraudType !== "all" || selectedHotspot !== "all" || timeRange !== "all";

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Drill-Down Filter Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/20 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Filter className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Drill-Down:</span>
          </div>

          {/* 1. Crime / Fraud Type Dropdown */}
          <select
            value={selectedFraudType}
            onChange={(e) => setSelectedFraudType(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-card px-2.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
          >
            <option value="all">All Fraud Categories</option>
            {FRAUD_CATEGORIES.map((ft) => (
              <option key={ft} value={ft}>{ft}</option>
            ))}
          </select>

          {/* 2. Hotspot Location Dropdown */}
          <select
            value={selectedHotspot}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedHotspot(val);
              if (val !== "all") {
                const target = CLUSTER_METADATA.find((c) => String(c.id) === val);
                if (target) setFlyTo([target.lat, target.lng]);
              }
            }}
            className="h-8 rounded-lg border border-border/60 bg-card px-2.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
          >
            <option value="all">All Hotspot Zones</option>
            {CLUSTER_METADATA.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name} Zone</option>
            ))}
          </select>

          {/* 3. Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-card px-2.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
          >
            <option value="all">All Time History</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Live Filter Telemetry Count */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-mono font-bold text-foreground">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            {filteredComplaints.length}
          </span>
          <span className="text-[11px]">of {ALL_SAMPLE_COMPLAINTS.length} Incidents</span>
        </div>
      </div>

      {/* ── Interactive Leaflet Map Container ── */}
      <div className="relative flex-1 w-full min-h-[440px]">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          {/* ── Esri Base Map Layer (100% Free & Keyless) ── */}
          <TileLayer
            key={`base-${theme}`}
            url={esriBaseUrl}
            maxZoom={16}
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          />

          {/* ── Esri Reference Labels Layer (English Place Names) ── */}
          <TileLayer
            key={`ref-${theme}`}
            url={esriRefUrl}
            maxZoom={16}
            pane="shadowPane"
          />

          {/* ── Heatmap Density Layer ── */}
          {showHeatmap && <HeatmapLayer points={heatPoints} />}

          {/* ── Hotspot Markers & Prediction Pins ── */}
          {showMarkers && (
            <>
              {filteredHotspots.map((h) => (
                <CircleMarker
                  key={h.id}
                  center={[h.lat, h.lng]}
                  radius={h.withdrawals > 0 ? 9 + h.withdrawals / 40 : 11}
                  pathOptions={{
                    color: "oklch(0.68 0.16 248)",
                    fillColor: "oklch(0.68 0.16 248)",
                    fillOpacity: 0.3,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{h.id}</strong> — {h.name}
                    {h.withdrawals > 0 && <><br />{h.withdrawals.toLocaleString("en-IN")} logged withdrawals</>}
                  </Popup>
                </CircleMarker>
              ))}

              {topPreds.slice(1).map((tp) => (
                <Marker
                  key={tp.zoneId + tp.rank}
                  position={[tp.lat, tp.lng]}
                  icon={RANK_ICONS[tp.rank - 1] ?? prediction3Icon}
                >
                  <Popup>
                    <strong>#{tp.rank} {tp.zoneId}</strong>
                    <br />{tp.zoneName}
                    <br />{tp.confidence}% confidence
                  </Popup>
                </Marker>
              ))}

              {prediction && (
                <Marker position={[prediction.lat, prediction.lng]} icon={predictionIcon}>
                  <Popup>
                    <strong>#1 🎯 {prediction.zoneId}</strong>
                    <br />{prediction.zoneName}
                    <br />{prediction.confidence}% confidence · {formatWindow(prediction)}
                  </Popup>
                </Marker>
              )}
            </>
          )}

          {/* ── Additive Layer: Emerging Micro-Loss Pattern Clusters ── */}
          {showEmergingPatterns && (
            <>
              {SYNTHETIC_EMERGING_PATTERNS.map((pattern) => (
                <CircleMarker
                  key={pattern.patternId}
                  center={[pattern.lat, pattern.lng]}
                  radius={22}
                  pathOptions={{
                    color: "#f59e0b",
                    fillColor: "#f59e0b",
                    fillOpacity: 0.2,
                    weight: 2,
                    dashArray: "4, 4",
                  }}
                >
                  <Popup>
                    <div style={{ maxWidth: 260, fontSize: 11, lineHeight: 1.4, fontFamily: "sans-serif" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(245,158,11,0.3)", paddingBottom: 4, marginBottom: 6 }}>
                        <strong style={{ color: "#f59e0b", fontFamily: "monospace" }}>{pattern.patternId}</strong>
                        <span style={{ fontSize: 9, background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "1px 4px", borderRadius: 4, fontWeight: "bold" }}>
                          Emerging Pattern
                        </span>
                      </div>
                      <div style={{ fontWeight: "bold", color: "var(--foreground, #fff)", marginBottom: 4 }}>
                        {pattern.title}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "rgba(0,0,0,0.1)", padding: 4, borderRadius: 6, marginBottom: 6 }}>
                        <div>
                          <span style={{ fontSize: 9, color: "var(--muted-foreground, #888)", textTransform: "uppercase" }}>Victims:</span>
                          <div style={{ fontWeight: "bold" }}>{pattern.complaintCount} reports</div>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: "var(--muted-foreground, #888)", textTransform: "uppercase" }}>Collective Loss:</span>
                          <div style={{ fontWeight: "bold", color: "#f43f5e" }}>₹{pattern.collectiveLoss.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted-foreground, #aaa)", marginBottom: 4 }}>
                        <strong>Window:</strong> {pattern.activityTimeWindow}
                        <br />
                        <strong>Pattern Strength:</strong> {pattern.patternStrength}%
                      </div>
                      <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 9, color: "#06b6d4", fontWeight: "bold" }}>Existing XGBoost Predicted Cash-Out Zone:</span>
                        <div style={{ fontWeight: "bold", fontSize: 10 }}>{pattern.predictedCashoutZone} ({pattern.predictedZoneConfidence}%)</div>
                      </div>
                      <div style={{ marginTop: 6, padding: "3px 5px", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 4, fontSize: 9, color: "#f43f5e", fontWeight: "bold" }}>
                        {pattern.status}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}

          <Recenter prediction={prediction} flyTo={flyTo} />
          <MapAutoResizeController />
        </MapContainer>

        {/* ── Location Search Overlay ── */}
        <LocationSearch onLocate={handleLocate} />

        {/* ── Layer View Mode Selector (Both / Heatmap / Pins / Micro-Patterns) ── */}
        <LayerControlOverlay
          viewMode={viewMode}
          setViewMode={setViewMode}
          showEmergingPatterns={showEmergingPatterns}
          setShowEmergingPatterns={setShowEmergingPatterns}
        />
      </div>
    </div>
  );
}
