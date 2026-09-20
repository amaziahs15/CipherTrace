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
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedRing, setSelectedRing] = useState<string | null>(null);
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

  // Compute 2D Positions using radial-layered topology layout with node-count scaled dimensions
  const { layoutNodes, viewBoxWidth, viewBoxHeight } = useMemo(() => {
    const totalCount = graphData.nodes.length;
    const scaleFactor = Math.max(1, Math.sqrt(Math.max(1, totalCount) / 10));
    const width = Math.round(920 * scaleFactor);
    const height = Math.round(580 * scaleFactor);
    const cx = width / 2;
    const cy = height / 2;

    const complaintsNodes = graphData.nodes.filter((n) => n.type === "complaint");
    const accountNodes = graphData.nodes.filter((n) => n.type === "account");
    const phoneNodes = graphData.nodes.filter((n) => n.type === "phone");
    const hotspotNodes = graphData.nodes.filter((n) => n.type === "hotspot");
    const bankNodes = graphData.nodes.filter((n) => n.type === "bank");

    const posMap = new Map<string, { x: number; y: number }>();

    // 1. Center Ring: Suspect Accounts (stagger alternate radii so labels don't collide)
    accountNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, accountNodes.length)) * 2 * Math.PI - Math.PI / 2;
      const radius = Math.round((115 + (i % 2 === 0 ? 0 : 30)) * scaleFactor);
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 2. Middle Ring: Suspect Phones
    phoneNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, phoneNodes.length)) * 2 * Math.PI;
      const radius = Math.round((195 + (i % 2 === 0 ? 0 : 30)) * scaleFactor);
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 3. Outer Ring: Complaints
    complaintsNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, complaintsNodes.length)) * 2 * Math.PI - Math.PI / 4;
      const radius = Math.round((285 + (i % 2 === 0 ? 0 : 35)) * scaleFactor);
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    // 4. Periphery Top: Hotspots
    hotspotNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, hotspotNodes.length)) * Math.PI + Math.PI / 6;
      const radius = Math.round((265 + (i % 2 === 0 ? 0 : 25)) * scaleFactor);
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle) * 0.9,
      });
    });

    // 5. Periphery Bottom: Banks
    bankNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, bankNodes.length)) * Math.PI - Math.PI / 6;
      const radius = Math.round((255 + (i % 2 === 0 ? 0 : 25)) * scaleFactor);
      posMap.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle) * 0.9,
      });
    });

    const positioned = graphData.nodes.map((node) => {
      const p = posMap.get(node.id) || { x: cx, y: cy };
      return {
        ...node,
        x: p.x,
        y: p.y,
      };
    });

    return { layoutNodes: positioned, viewBoxWidth: width, viewBoxHeight: height };
  }, [graphData]);

  // Set of nodes & links belonging to the currently selected syndicate ring
  const ringEntitySet = useMemo(() => {
    if (!selectedRing) return null;
    const nodeIds = new Set<string>();

    complaints.forEach((c) => {
      if (c.syndicateTag === selectedRing) {
        nodeIds.add(`node_cmp_${c.id}`);
        if (c.suspectAccountId) nodeIds.add(`node_acc_${c.suspectAccountId}`);
        if (c.suspectPhone) nodeIds.add(`node_phone_${c.suspectPhone}`);
        if (c.predictedHotspot) {
          const cityOrHotspot = c.hotspotCity || c.predictedHotspot;
          nodeIds.add(`node_hotspot_${cityOrHotspot}`);
        }
        if (c.bank) nodeIds.add(`node_bank_${c.bank}`);
      }
    });

    const linkIds = new Set<string>();
    graphData.links.forEach((l) => {
      if (nodeIds.has(l.source) && nodeIds.has(l.target)) {
        linkIds.add(l.id);
      }
    });

    return { nodeIds, linkIds };
  }, [selectedRing, complaints, graphData.links]);

  // Active focus entity for focus mode (hovered or clicked)
  const activeFocusId = hoveredNode?.id || selectedNode?.id || null;

  const focusNeighbors = useMemo(() => {
    if (!activeFocusId) return null;
    const directLinks = new Set<string>();
    const neighborNodes = new Set<string>([activeFocusId]);

    graphData.links.forEach((l) => {
      if (l.source === activeFocusId || l.target === activeFocusId) {
        directLinks.add(l.id);
        neighborNodes.add(l.source);
        neighborNodes.add(l.target);
      }
    });

    return { directLinks, neighborNodes };
  }, [activeFocusId, graphData.links]);

  const getNodeOpacity = (nodeId: string) => {
    if (ringEntitySet && !ringEntitySet.nodeIds.has(nodeId)) {
      return 0.08;
    }
    if (focusNeighbors) {
      return focusNeighbors.neighborNodes.has(nodeId) ? 1 : 0.08;
    }
    return 1;
  };

  const getLinkOpacity = (link: GraphLink) => {
    if (ringEntitySet && !ringEntitySet.linkIds.has(link.id)) {
      return 0.08;
    }
    if (focusNeighbors) {
      return focusNeighbors.directLinks.has(link.id) ? 1 : 0.08;
    }
    return link.isHighlighted ? 0.9 : 0.15;
  };

  const getLinkStyle = (rel: string, isFocused: boolean) => {
    switch (rel) {
      case "TRANSFERRED_TO":
        return {
          stroke: isFocused ? "#f59e0b" : "#d97706",
          strokeDasharray: undefined,
          strokeWidth: isFocused ? 2.5 : 1.6,
        };
      case "CALLED":
      case "CALLED_FROM":
        return {
          stroke: isFocused ? "#06b6d4" : "#0891b2",
          strokeDasharray: "4, 3",
          strokeWidth: isFocused ? 2.2 : 1.4,
        };
      case "REGISTERED_BANK":
        return {
          stroke: isFocused ? "#3b82f6" : "#2563eb",
          strokeDasharray: "8, 4",
          strokeWidth: isFocused ? 2.2 : 1.4,
        };
      case "WITHDRAWAL_AT":
        return {
          stroke: isFocused ? "#a855f7" : "#9333ea",
          strokeDasharray: "6, 2, 2, 2",
          strokeWidth: isFocused ? 2.2 : 1.4,
        };
      default:
        return {
          stroke: isFocused ? "#cbd5e1" : "#64748b",
          strokeDasharray: undefined,
          strokeWidth: isFocused ? 2 : 1.2,
        };
    }
  };

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
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
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

              const isDirectFocus = focusNeighbors ? focusNeighbors.directLinks.has(link.id) : false;
              const isHighlighted = link.isHighlighted || activeFocusId === src.id || activeFocusId === tgt.id || isDirectFocus;
              const linkOpacity = getLinkOpacity(link);
              const style = getLinkStyle(link.relationship, isHighlighted);

              return (
                <g key={link.id} className="transition-all duration-300" style={{ opacity: linkOpacity }}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                    filter={isHighlighted ? "url(#glow)" : undefined}
                  />
                  {/* Relationship Label on Hover/Highlight */}
                  {isHighlighted && (
                    <text
                      x={(src.x! + tgt.x!) / 2}
                      y={(src.y! + tgt.y!) / 2 - 4}
                      fill={style.stroke}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-black/80 px-1 select-none pointer-events-none"
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
              const isHovered = hoveredNode?.id === node.id;
              const isMatch = node.isFlaggedMatch;
              const nodeOpacity = getNodeOpacity(node.id);

              const isComplaint = node.type === "complaint";
              const isDirectlyFocused = activeFocusId === node.id;
              const isNeighborInFocus = focusNeighbors?.neighborNodes.has(node.id) ?? false;
              const showLabel = isComplaint || isDirectlyFocused || isNeighborInFocus;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ opacity: nodeOpacity }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    if (node.complaintRefId && onSelectComplaint) {
                      onSelectComplaint(node.complaintRefId);
                    }
                  }}
                  className="cursor-pointer group transition-all duration-200 hover:scale-110"
                >
                  {/* Pulsing Outer Radar Ring for New Entries or Flagged Matches */}
                  {(node.isNew || isMatch || isSelected || isHovered) && (
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
                    strokeWidth={isSelected || isHovered ? "3" : "1.5"}
                    filter={isSelected || isHovered || node.isNew ? "url(#glow)" : undefined}
                  />

                  {/* Type Icon Glyph inside SVG */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {node.type === "complaint" ? "🚨" : node.type === "account" ? "💳" : node.type === "phone" ? "📱" : node.type === "hotspot" ? "📍" : "🏦"}
                  </text>

                  {/* Node Label: Only complaint cases permanently, or if focused/hovered/neighbor */}
                  {showLabel && (
                    <text
                      y={node.type === "complaint" ? 24 : 20}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none select-none"
                    >
                      {node.label}
                    </text>
                  )}

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
                        className="pointer-events-none select-none"
                      >
                        {node.degree}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Tooltip on hover */}
          {hoveredNode && (() => {
            const pos = nodeLookup.get(hoveredNode.id) || hoveredNode;
            const px = pos.x ?? 0;
            const py = pos.y ?? 0;
            return (
              <g
                transform={`translate(${px}, ${py - 32})`}
                className="pointer-events-none transition-all duration-150"
              >
                <rect
                  x="-80"
                  y="-28"
                  width="160"
                  height="32"
                  rx="6"
                  fill="#090d16"
                  stroke="#334155"
                  strokeWidth="1"
                  filter="url(#glow)"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="-15"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hoveredNode.label}
                </text>
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="medium"
                >
                  {hoveredNode.subLabel || `${hoveredNode.type.toUpperCase()} • ${hoveredNode.degree} links`}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Floating Syndicate Ring Badge Overlay */}
        <div className="absolute left-4 bottom-4 flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-3 text-xs shadow-xl pointer-events-auto max-w-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Active Syndicate Detection</span>
            </div>
            {selectedRing && (
              <button
                type="button"
                onClick={() => setSelectedRing(null)}
                className="text-[9px] text-muted-foreground hover:text-foreground font-mono underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <button
              type="button"
              onClick={() => setSelectedRing(null)}
              className={`rounded-lg px-2 py-0.5 font-mono text-[9px] font-bold transition-all ${
                selectedRing === null
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              Show all
            </button>
            {graphData.summary.syndicateClusters.map((tag) => {
              const isSelected = selectedRing === tag;
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setSelectedRing(isSelected ? null : tag)}
                  className={`rounded-lg border px-2 py-0.5 font-mono text-[9px] font-bold transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 scale-105"
                      : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Mule accounts &amp; phone numbers shared across multiple complaints are flagged in red. Click a ring chip to filter.
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

        {/* Link-type Legend */}
        <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-3">
          <span className="font-semibold text-foreground/80 text-[10px] uppercase">Links:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-amber-500 inline-block" />
            <span className="text-[10px]">Transfer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-b border-dashed border-cyan-400 inline-block" />
            <span className="text-[10px]">Called</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-b border-dashed border-blue-500 inline-block" />
            <span className="text-[10px]">Bank</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-b border-dotted border-purple-400 inline-block" />
            <span className="text-[10px]">Hotspot</span>
          </div>
        </div>

        <span className="font-mono text-[10px] text-primary font-bold">
          LIVE CYBER-INTELLIGENCE GRAPH
        </span>
      </div>
    </div>
  );
}
