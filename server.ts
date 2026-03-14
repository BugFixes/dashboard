import { join } from "node:path";
import { statSync, readFileSync } from "node:fs";

const port = Number(process.env.PORT || 8080);
const clientDir = join(import.meta.dirname, "dist", "client");

// Import the TanStack Start server handler
const app = await import("./dist/server/server.js");

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".map": "application/json",
};

function getMimeType(path: string): string {
  const ext = path.substring(path.lastIndexOf("."));
  return mimeTypes[ext] || "application/octet-stream";
}

function tryServeStatic(pathname: string): Response | null {
  try {
    const filePath = join(clientDir, pathname);
    // Prevent directory traversal
    if (!filePath.startsWith(clientDir)) return null;
    const stat = statSync(filePath);
    if (stat.isFile()) {
      const content = readFileSync(filePath);
      const isAsset = pathname.startsWith("/assets/");
      return new Response(content, {
        headers: {
          "Content-Type": getMimeType(filePath),
          ...(isAsset
            ? { "Cache-Control": "public, max-age=31536000, immutable" }
            : {}),
        },
      });
    }
  } catch {
    // File doesn't exist, fall through
  }
  return null;
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    // Try serving static files from dist/client first
    const staticResponse = tryServeStatic(url.pathname);
    if (staticResponse) return staticResponse;

    // Fall through to TanStack Start SSR handler
    return app.default.fetch(request);
  },
});

console.log(`Server running on http://localhost:${port}`);
