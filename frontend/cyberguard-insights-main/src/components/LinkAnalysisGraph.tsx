// ─── Interactive Link-Analysis Network Graph Component ────────────────────────
// Visualizes multi-hop connections between Complaints, Suspect Mule Accounts,
// Calling Phone Numbers, Financial Institutions, and Predicted Hotspot Zones.

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ShieldAlert,
  CreditCard,
  Phone,
  Building2,
  MapPin,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  Info,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  buildNetworkGraph,
  type GraphNode,
  type GraphLink,
  type NetworkGraphData,
  type ComplaintEntity,
  getStoredComplaints,
} from "@/lib/complaintsStore";

interface LinkAnalysisGraphProps {
  activeHighlightId?: string | undefined;
  onSelectComplaint?: ((id: string) => void) | undefined;
  className?: string | undefined;
}

export default function LinkAnalysisGraph({
  activeHighlightId,
  onSelectComplaint,
  className = "",
}: LinkAnalysisGraphProps) {
  const [complaints, setComplaints] = useState<ComplaintEntity[]>(getStoredComplaints);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Listen to complaint store changes
  useEffect(() => {
    const handleUpdate = () => {
      setComplaints(getStoredComplaints());
    };
    window.addEventListener("ciphertrace:complaints_updated", handleUpdate);
    return () => window.removeEventListener("ciphertrace:complaints_updated", handleUpdate);
  }, []);

  const graphData: NetworkGraphData = useMemo(() => {
    return buildNetworkGraph(complaints, activeHighlightId);
  }, [complaints, activeHighlightId]);

  // Compute 2D Positions using radial-layered topology layout for deterministic stability
  const layoutNodes = useMemo(() => {
    const width = 860;
    const height = 520;
    const cx = width / 2;
    const cy = height / 2;

    const complaintsNodes = graphData.nodes.filter((n) => n.type === "complaint");
    const accountNodes = graphData.nodes.filter((n) => n.type === "account");
    const phoneNodes = graphData.nodes.filter((n) => n.type === "phone");
    const hotspotNodes = graphData.nodes.filter((n) => n.type === "hotspot");
    const bankNodes = graphData.nodes.filter((n) => n.type === "bank");

    const posMap = new Map<string, { x: number; y: number }>();

    // 1. Center Ring: Suspect Accounts (Core Mule Hubs)
    accountNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, accountNodes.length)) * 2 * Math.PI - Math.PI / 2;
      const radius = 95;
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 2. Middle Ring: Suspect Phones
    phoneNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, phoneNodes.length)) * 2 * Math.PI;
      const radius = 175;
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 3. Outer Ring: Complaints
    complaintsNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, complaintsNodes.length)) * 2 * Math.PI - Math.PI / 4;
      const radius = 240;
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 4. Periphery Top/Bottom: Banks and Hotspots
    hotspotNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, hotspotNodes.length)) * Math.PI + Math.PI / 6;
      const radius = 220;
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle) * 0.9,
      });
    });

    bankNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, bankNodes.length)) * Math.PI - Math.PI / 6;
      const radius = 210;
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle) * 0.9,
      });
    });

    return graphData.nodes.map((node) => {
      const p = posMap.get(node.id) || { x: cx, y: cy };
      return {
        ...node,
        x: p.x,
        y: p.y,
      };
    });
  }, [graphData]);

  // Map for fast coordinate lookup
  const nodeLookup = useMemo(() => {
    const map = new Map<string, (typeof layoutNodes)[0]>();
    layoutNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [layoutNodes]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return layoutNodes.filter((n) => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(q) || (n.subLabel && n.subLabel.toLowerCase().includes(q));
      }
      return true;
    });
  }, [layoutNodes, filterType, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Pan and drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).tagName === "g") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (type: GraphNode["type"], isFlagged?: boolean, isNew?: boolean) => {
    if (isNew) return { bg: "fill-amber-500", stroke: "stroke-amber-300", text: "text-amber-400", ring: "ring-amber-500/50" };
    if (isFlagged) return { bg: "fill-rose-600", stroke: "stroke-rose-400", text: "text-rose-400", ring: "ring-rose-500/50" };
    switch (type) {
      case "complaint":
        return { bg: "fill-rose-500/80", stroke: "stroke-rose-400", text: "text-rose-400", ring: "ring-rose-500/30" };
      case "account":
        return { bg: "fill-amber-500/80", stroke: "stroke-amber-400", text: "text-amber-400", ring: "ring-amber-500/30" };
      case "phone":
        return { bg: "fill-cyan-500/80", stroke: "stroke-cyan-400", text: "text-cyan-400", ring: "ring-cyan-500/30" };
      case "hotspot":
        return { bg: "fill-purple-500/80", stroke: "stroke-purple-400", text: "text-purple-400", ring: "ring-purple-500/30" };
      case "bank":
        return { bg: "fill-blue-500/80", stroke: "stroke-blue-400", text: "text-blue-400", ring: "ring-blue-500/30" };
    }
  };

  return (
    <div className={`panel overflow-hidden border-border/70 shadow-2xl flex flex-col bg-card ${className}`}>
      
      {/* ── Graph Toolbar & Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
            <Layers className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-foreground">
                Entity Link-Analysis Network
              </h3>
              <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">
                {graphData.nodes.length} Nodes · {graphData.links.length} Links
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Visualizes cross-complaint connections across suspect accounts, phones &amp; ATM withdrawal clusters
            </p>
          </div>
        </div>

        {/* Filter Chips & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-2.5 py-1 text-xs text-foreground focus-within:border-primary">
            <Search className="size-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entity or case…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/60 focus:w-36 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filter Types */}
          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-0.5">
            {[
              { id: "all", label: "All" },
              { id: "complaint", label: "Cases" },
              { id: "account", label: "Accounts" },
              { id: "phone", label: "Phones" },
              { id: "hotspot", label: "Hotspots" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                  filterType === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l border-border/50 pl-2">
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
              title="Zoom In"
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              title="Reset View"
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div
        className="relative h-[480px] w-full select-none overflow-hidden bg-[#070b14]/90 dark:bg-[#070b14]/95 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Background Grid Lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(#06b6d4 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* SVG Network Graph */}
        <svg
          className="h-full w-full"
          viewBox="0 0 860 520"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(6, 182, 212, 0.6)" />
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links / Edges */}
          <g className="links">
            {graphData.links.map((link) => {
              const src = nodeLookup.get(link.source);
              const tgt = nodeLookup.get(link.target);
              if (!src || !tgt) return null;
              if (!visibleNodeIds.has(src.id) || !visibleNodeIds.has(tgt.id)) return null;

              const isHighlighted = link.isHighlighted || selectedNode?.id === src.id || selectedNode?.id === tgt.id;

              return (
                <g key={link.id} className="transition-all duration-300">
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlighted ? "rgba(245, 158, 11, 0.9)" : "rgba(100, 116, 139, 0.35)"}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={link.relationship === "CALLED_FROM" ? "4,3" : undefined}
                    filter={isHighlighted ? "url(#glow)" : undefined}
                  />
                  {/* Small Relationship Label on Hover/Highlight */}
                  {isHighlighted && (
                    <text
                      x={(src.x! + tgt.x!) / 2}
                      y={(src.y! + tgt.y!) / 2 - 4}
                      fill="#f59e0b"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-black/80 px-1"
                    >
                      {link.relationship}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {visibleNodes.map((node) => {
              const colors = getNodeColor(node.type, node.isFlaggedMatch, node.isNew);
              const isSelected = selectedNode?.id === node.id;
              const isMatch = node.isFlaggedMatch;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    if (node.complaintRefId && onSelectComplaint) {
                      onSelectComplaint(node.complaintRefId);
                    }
                  }}
                  className="cursor-pointer group transition-transform duration-200 hover:scale-110"
                >
                  {/* Pulsing Outer Radar Ring for New Entries or Flagged Matches */}
                  {(node.isNew || isMatch || isSelected) && (
                    <circle
                      r={node.type === "complaint" ? 22 : 18}
                      fill="none"
                      stroke={node.isNew ? "#f59e0b" : isMatch ? "#f43f5e" : "#06b6d4"}
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      className="animate-ping"
                    />
                  )}

                  {/* Base Circle */}
                  <circle
                    r={node.type === "complaint" ? 16 : 13}
                    className={`${colors.bg} ${colors.stroke} transition-all`}
                    strokeWidth={isSelected ? "3" : "1.5"}
                    filter={isSelected || node.isNew ? "url(#glow)" : undefined}
                  />

                  {/* Type Icon Glyph inside SVG */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.type === "complaint" ? "🚨" : node.type === "account" ? "💳" : node.type === "phone" ? "📱" : node.type === "hotspot" ? "📍" : "🏦"}
                  </text>

                  {/* Primary Node Label */}
                  <text
                    y={node.type === "complaint" ? 24 : 20}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  >
                    {node.label}
                  </text>

                  {/* Secondary Match Flag Indicator */}
                  {node.degree > 1 && (
                    <g transform="translate(10, -10)">
                      <circle r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {node.degree}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Syndicate Ring Badge Overlay */}
        <div className="absolute left-4 bottom-4 flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-3 text-xs shadow-xl pointer-events-auto max-w-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Active Syndicate Detection</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {graphData.summary.syndicateClusters.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Mule accounts &amp; phone numbers shared across multiple complaints are flagged in red.
          </p>
        </div>

        {/* Selected Entity Dossier Slide-Over Popover */}
        {selectedNode && (
          <div className="absolute right-4 top-4 bottom-4 w-72 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-4 shadow-2xl overflow-y-auto space-y-3 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/20 text-primary">
                  {selectedNode.type === "complaint" ? <ShieldAlert className="size-4" /> : selectedNode.type === "account" ? <CreditCard className="size-4" /> : <Phone className="size-4" />}
                </span>
                <div>
                  <h4 className="font-display text-xs font-bold text-foreground truncate max-w-[140px]">
                    {selectedNode.label}
                  </h4>
                  <p className="text-[9px] font-mono uppercase text-muted-foreground">
                    {selectedNode.type} node
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="grid size-6 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Entity Highlights */}
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Entity Role</span>
                <p className="font-semibold text-foreground">{selectedNode.subLabel || "Active Link Entity"}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Connected Dockets</span>
                <p className="font-mono text-sm font-bold text-primary">{selectedNode.degree} Cases Linked</p>
              </div>

              {/* Connected Cases Details */}
              {selectedNode.degree > 1 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>Cross-Case Mule Alert</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This entity appears across {selectedNode.degree} distinct police reports. High probability of organized syndicate mule ring.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Graph Footer Legend ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-muted/15 px-4 py-2.5 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>Complaint Case</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>Suspect Mule Account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-cyan-500" />
            <span>Suspect Phone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-purple-500" />
            <span>Predicted Hotspot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span>Bank Institution</span>
          </div>
        </div>

        <span className="font-mono text-[10px] text-primary font-bold">
          LIVE CYBER-INTELLIGENCE GRAPH
        </span>
      </div>
    </div>
  );
}
