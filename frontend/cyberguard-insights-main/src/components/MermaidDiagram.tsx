import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Download,
  Check,
  AlertCircle,
  RefreshCw,
  FileCode,
  ChevronDown,
  ChevronUp,
  X,
  FileImage,
  AlertTriangle,
} from "lucide-react";

// Configure Mermaid once with dark cyber/intelligence theme
let isMermaidInitialized = false;

function initMermaid() {
  if (typeof window === "undefined" || isMermaidInitialized) return;
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: '"IBM Plex Sans", "Space Grotesk", system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        background: "#0b1329",
        mainBkg: "#0f172a",
        textColor: "#f1f5f9",
        lineColor: "#22d3ee",
        primaryColor: "#0891b2",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#06b6d4",
        secondaryColor: "#1e293b",
        secondaryTextColor: "#f1f5f9",
        secondaryBorderColor: "#334155",
        tertiaryColor: "#0b1329",
        tertiaryTextColor: "#e2e8f0",
        tertiaryBorderColor: "#1e293b",
        nodeBorder: "#06b6d4",
        clusterBkg: "#091026",
        clusterBorder: "#1e293b",
        titleColor: "#38bdf8",
        edgeLabelBackground: "#0f172a",
      },
    });
    isMermaidInitialized = true;
  } catch (initErr) {
    console.error("[Mermaid.js] Initialization error:", initErr);
  }
}

/**
 * Sanitizes inner text of a Mermaid node/edge label:
 * - Strips risky single quotes / apostrophes (e.g. "Attacker's" -> "Attackers")
 * - Escapes internal quotes
 */
function sanitizeInnerLabel(inner: string): string {
  let text = inner.trim();
  // Strip outer quotes if already present
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }

  // Strip apostrophes / single quotes from labels
  text = text.replace(/'/g, "");

  // Strip nested double quotes to maintain valid Mermaid syntax
  text = text.replace(/"/g, "");

  return text.trim();
}

/**
 * Robustly sanitizes and cleans Mermaid chart code extracted from LLM responses:
 * - Trims whitespace and markdown code fences
 * - Strips redundant 'mermaid' header keywords
 * - Strips apostrophes and automatically wraps unquoted labels containing punctuation in double quotes
 * - Fixes common LLM syntax inconsistencies
 */
function cleanMermaidCode(raw: string): string {
  if (!raw) return "";

  let code = raw.trim();

  // 1. Strip leading ``` or ```mermaid
  code = code.replace(/^```(?:mermaid)?\s*/i, "").replace(/\s*```$/i, "");

  // 2. Strip any leading "mermaid" keyword line
  code = code.replace(/^mermaid\s*\n/i, "");

  // 3. Normalize line endings
  code = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // 4. If chart does not specify diagram type, default to graph TD
  const hasTypeHeader = /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|mindmap|timeline|zenuml|sankey|block)/i.test(
    code,
  );
  if (!hasTypeHeader) {
    code = "graph TD\n" + code;
  }

  // 5. Line-by-line label sanitization (stripping apostrophes and wrapping labels in double quotes)
  const lines = code.split("\n");
  const sanitizedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("%%") ||
      /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|subgraph|end\b)/i.test(
        trimmed,
      )
    ) {
      return line;
    }

    let p = line;

    // A. Double bracket types: ([ ... ]), [( ... )], {{ ... }}, (( ... ))
    p = p.replace(
      /([a-zA-Z0-9_]+)\s*(\(\[|\[\(|\{\{|\(\()([\s\S]*?)(\]\)|\)\]|\}\}|\)\))/g,
      (_, id, open, inner, close) => `${id}${open}"${sanitizeInnerLabel(inner)}"${close}`,
    );

    // B. Single bracket types: [ ... ], { ... }, ( ... )
    p = p.replace(
      /([a-zA-Z0-9_]+)\s*(\[|\{|\()([\s\S]*?)(\]|\}|\))(?=\s*(?:-->|---|==>|-.->|\||$))/g,
      (_, id, open, inner, close) => `${id}${open}"${sanitizeInnerLabel(inner)}"${close}`,
    );

    // C. Edge labels: | ... |
    p = p.replace(/\|([^\|]+)\|/g, (_, inner) => `|"${sanitizeInnerLabel(inner)}"|`);

    // D. Safety net: remove any remaining word-level apostrophes (e.g. Attacker's -> Attackers)
    p = p.replace(/(?<=\w)'(?=\w)/g, "");

    return p;
  });

  return sanitizedLines.join("\n");
}

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    initMermaid();
    let isMounted = true;

    // Generate a strictly unique ID for EVERY render invocation to prevent DOM element ID collisions
    const renderId = `mermaid_render_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    async function renderChart() {
      if (!chart.trim()) return;

      const cleanedChart = cleanMermaidCode(chart);
      setError(null);
      setErrorDetail(null);

      // Clean up any existing elements with this ID before starting
      const existingEl =
        document.getElementById(renderId) || document.getElementById(`d${renderId}`);
      if (existingEl) existingEl.remove();

      try {
        // Step 1: Validate syntax
        try {
          await mermaid.parse(cleanedChart);
        } catch (parseErr: any) {
          console.error("[Mermaid.js] Syntax Parsing Error Encountered:", {
            error: parseErr,
            errorMessage: parseErr?.message || String(parseErr),
            errorHash: parseErr?.hash,
            errorStack: parseErr?.stack,
            rawInput: chart,
            cleanedInput: cleanedChart,
          });
          throw parseErr;
        }

        // Step 2: Render to SVG using container reference
        const { svg } = await mermaid.render(renderId, cleanedChart, containerRef.current || undefined);

        if (isMounted) {
          setSvgHtml(svg);
          setError(null);
          setErrorDetail(null);
        }
      } catch (renderErr: any) {
        const errorMsg = renderErr?.message || "Diagram syntax could not be rendered";
        console.error("[Mermaid.js] Rendering Failed:", {
          error: renderErr,
          message: errorMsg,
          rawChart: chart,
          cleanedChart,
        });

        // Clean up temporary DOM artifacts created by Mermaid during failed renders
        const danglingEl =
          document.getElementById(renderId) || document.getElementById(`d${renderId}`);
        if (danglingEl) danglingEl.remove();

        if (isMounted) {
          setError("Diagram syntax could not be parsed by Mermaid.js engine.");
          setErrorDetail(errorMsg);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
      const leftover =
        document.getElementById(renderId) || document.getElementById(`d${renderId}`);
      if (leftover) leftover.remove();
    };
  }, [chart]);

  // Client-side export of rendered diagram as PNG (Rock-Solid Data-URI conversion)
  const handleDownloadPng = async () => {
    if (!containerRef.current || downloading) return;
    setDownloading(true);
    setToast(null);

    try {
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) {
        throw new Error("SVG element not found in DOM container.");
      }

      // Clone SVG so modifications don't impact on-screen rendering
      const clone = svgEl.cloneNode(true) as SVGSVGElement;

      // Determine accurate intrinsic dimensions from viewBox or client rect
      let width = 680;
      let height = 380;

      const viewBoxAttr = svgEl.getAttribute("viewBox");
      if (viewBoxAttr) {
        const parts = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          width = Math.round(parts[2]);
          height = Math.round(parts[3]);
        }
      } else {
        const bbox = svgEl.getBoundingClientRect();
        if (bbox.width > 0 && bbox.height > 0) {
          width = Math.round(bbox.width);
          height = Math.round(bbox.height);
        }
      }

      // Ensure explicit width and height attributes on the root SVG for Image decoder
      clone.setAttribute("width", `${width}px`);
      clone.setAttribute("height", `${height}px`);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      // Remove any <link> or <script> tags from SVG clone
      const dangerousTags = clone.querySelectorAll("link, script");
      dangerousTags.forEach((el) => el.remove());

      // Serialize to XML string
      const serializer = new XMLSerializer();
      let svgXml = serializer.serializeToString(clone);

      // Strip all external font imports, @font-face rules, and remote URLs that taint the canvas
      svgXml = svgXml.replace(/@import\s+(?:url\([^)]+\)|['"][^'"]+['"])\s*;?/gi, "");
      svgXml = svgXml.replace(/@font-face\s*\{[^}]*\}/gi, "");
      svgXml = svgXml.replace(/url\(\s*['"]?(?:https?:)?\/\/[^'")]+['"]?\s*\)/gi, "none");
      svgXml = svgXml.replace(/(?:xlink:)?href\s*=\s*['"](?:https?:)?\/\/[^'"]+['"]/gi, "");
      svgXml = svgXml.replace(/<link[^>]*>/gi, "");
      svgXml = svgXml.replace(/<script[\s\S]*?<\/script>/gi, "");

      // Create high-fidelity SVG Data URI (avoids blob URL CORS security errors)
      const svgDataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgXml);

      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const scale = 2; // 2x resolution for crisp high-DPI display
            const padding = 28;
            const canvas = document.createElement("canvas");
            canvas.width = (width + padding * 2) * scale;
            canvas.height = (height + padding * 2) * scale;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not initialize HTML5 2D Canvas context.");

            ctx.scale(scale, scale);

            // Fill dark intelligence background
            ctx.fillStyle = "#0b1329";
            ctx.fillRect(0, 0, width + padding * 2, height + padding * 2);

            // Draw subtle border outline
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1;
            ctx.strokeRect(1, 1, width + padding * 2 - 2, height + padding * 2 - 2);

            // Draw SVG diagram image onto canvas
            ctx.drawImage(img, padding, padding, width, height);

            // Export as PNG
            const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
            const fileName = `CipherTrace_Flowchart_${timestamp}.png`;
            const pngDataUrl = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.download = fileName;
            link.href = pngDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setDownloaded(true);
            setToast({
              type: "success",
              message: `Flowchart downloaded successfully (${fileName})`,
            });
            setTimeout(() => setDownloaded(false), 2500);
            setTimeout(() => setToast(null), 4000);
            resolve();
          } catch (canvasErr) {
            reject(canvasErr);
          }
        };

        img.onerror = (event) => {
          const errDetail = new Error(
            `Failed to decode SVG graphic into Image bitmap. (Event: ${String(event)})`,
          );
          reject(errDetail);
        };

        img.src = svgDataUri;
      });
    } catch (exportErr: any) {
      console.error("[Mermaid.js] PNG Export Error Details:", {
        error: exportErr,
        message: exportErr?.message || String(exportErr),
        stack: exportErr?.stack,
      });

      setToast({
        type: "error",
        message: `Could not export PNG: ${exportErr?.message || "Render failure"}. Check DevTools console.`,
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="my-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertCircle className="size-4 shrink-0" />
            <span>Diagram could not be rendered</span>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors"
          >
            <FileCode className="size-3" />
            <span>{showRaw ? "Hide Syntax" : "View Syntax"}</span>
            {showRaw ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
        {errorDetail && (
          <p className="mt-1 text-[11px] text-amber-300/80 font-mono">
            {errorDetail}
          </p>
        )}
        {showRaw && (
          <pre className="mt-2.5 max-h-48 overflow-x-auto rounded-lg bg-black/40 p-2.5 font-mono text-[11px] text-muted-foreground">
            {chart.trim()}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/80 shadow-md backdrop-blur-sm transition-all hover:border-cyan-500/50">
      
      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div
          className={`flex items-center justify-between border-b px-3.5 py-2 text-xs font-mono animate-in fade-in slide-in-from-top-1 ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/70 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/70 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {toast.type === "success" ? (
              <Check className="size-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="size-3.5 shrink-0 text-rose-400" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Header with Title & Download Action ── */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/60 px-3 py-1.5 text-[11px]">
        <div className="flex items-center gap-1.5 font-mono font-medium text-cyan-400">
          <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>CipherTrace Flowchart</span>
        </div>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={downloading || !svgHtml}
          title="Download Flowchart as high-resolution PNG image"
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-all hover:border-primary/60 hover:bg-primary/20 hover:text-primary active:scale-95 disabled:opacity-50"
        >
          {downloaded ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Downloaded!</span>
            </>
          ) : downloading ? (
            <>
              <RefreshCw className="size-3 animate-spin text-primary" />
              <span>Exporting PNG…</span>
            </>
          ) : (
            <>
              <Download className="size-3" />
              <span>Export PNG</span>
            </>
          )}
        </button>
      </div>

      {/* ── Rendered SVG Container ── */}
      <div
        ref={containerRef}
        className="mermaid-wrapper flex items-center justify-center overflow-x-auto p-4 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
}
