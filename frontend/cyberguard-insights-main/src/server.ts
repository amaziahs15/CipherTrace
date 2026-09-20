// Polyfill browser globals in SSR environment (prevents Leaflet and DOM-dependent libraries from crashing Node/Netlify function)
if (typeof (globalThis as any).window === "undefined") {
  const noop = () => {};
  const mockStorage: any = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: () => null,
    length: 0,
  };

  const mockDoc: any = {
    documentElement: { style: {} },
    createElement: () => ({
      style: {},
      getContext: () => null,
      setAttribute: noop,
      getAttribute: () => null,
      appendChild: noop,
      removeChild: noop,
    }),
    createElementNS: () => ({
      style: {},
      setAttribute: noop,
      getAttribute: () => null,
      appendChild: noop,
      removeChild: noop,
    }),
    getElementsByTagName: () => [],
    head: { appendChild: noop, removeChild: noop },
    body: { appendChild: noop, removeChild: noop },
    addEventListener: noop,
    removeEventListener: noop,
  };

  const mockWin: any = {
    requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
    cancelAnimationFrame: (id: any) => clearTimeout(id),
    devicePixelRatio: 1,
    screen: { deviceXDPI: 96, logicalXDPI: 96, width: 1920, height: 1080 },
    navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NodeSSR" },
    document: mockDoc,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
    location: { href: "", pathname: "/", search: "", hash: "" },
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    matchMedia: () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    }),
  };

  (globalThis as any).window = mockWin;
  (globalThis as any).self = globalThis;
  (globalThis as any).document = mockDoc;
  (globalThis as any).localStorage = mockStorage;
  (globalThis as any).sessionStorage = mockStorage;
  try {
    Object.defineProperty(globalThis, "navigator", {
      value: mockWin.navigator,
      configurable: true,
      writable: true,
    });
  } catch {
    // navigator already present in Node runtime
  }
}

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
