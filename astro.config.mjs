// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { cp } from "node:fs/promises";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// GitHub Pages serves the site under /portfolio/; Vercel serves it from the domain root.
// Vercel sets VERCEL=1 and VERCEL_PROJECT_PRODUCTION_URL (host only, no scheme) on its builds.
const VERCEL = Boolean(process.env.VERCEL);
const SITE = VERCEL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://tjsrjs8282.github.io";
const BASE = VERCEL ? "" : "/portfolio";
const LEGACY = fileURLToPath(new URL("./legacy/", import.meta.url));

/**
 * Every character the page can show: all of src/ plus printable ASCII (for
 * the clock, counters and cursor labels). Google then builds one Hangul file
 * from exactly these glyphs instead of ~120 unicode-range slices.
 */
function pageGlyphs() {
  const chars = new Set();
  const walk = (/** @type {string} */ dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(astro|ts|css)$/.test(e.name)) for (const ch of readFileSync(p, "utf8")) chars.add(ch);
    }
  };
  walk(fileURLToPath(new URL("./src/", import.meta.url)));
  for (let c = 32; c < 127; c++) chars.add(String.fromCharCode(c));
  return [...chars].filter((ch) => /** @type {number} */ (ch.codePointAt(0)) >= 32).sort();
}

/** @type {Record<string, string>} */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

/**
 * The 2020 site lives on, untouched, at legacy/ under the base (/portfolio/legacy/ on Pages).
 * mail.php stays in the repo for history but is not shipped: Pages can't run PHP.
 * @returns {import("astro").AstroIntegration}
 */
function legacy2020() {
  return {
    name: "legacy-2020",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const prefix = `${BASE}/legacy/`;
          if (!req.url?.startsWith(prefix)) return next();
          let rel = decodeURIComponent(req.url.slice(prefix.length).split("?")[0]) || "index.html";
          const file = normalize(join(LEGACY, rel));
          if (!file.startsWith(normalize(LEGACY)) || !existsSync(file) || statSync(file).isDirectory()) return next();
          res.setHeader("Content-Type", MIME[extname(file).toLowerCase()] ?? "application/octet-stream");
          createReadStream(file).pipe(res);
        });
      },
      "astro:build:done": async ({ dir }) => {
        await cp(LEGACY, fileURLToPath(new URL("legacy/", dir)), {
          recursive: true,
          filter: (src) => !src.endsWith("mail.php"),
        });
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  base: BASE || "/",
  output: "static",
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [legacy2020()],

  fonts: [
    {
      // Variable in weight *and* width: the hero type stretches as you scroll.
      name: "Archivo",
      cssVariable: "--font-display",
      provider: fontProviders.google(),
      weights: ["100 900"],
      styles: ["normal"],
      // Vietnamese too: "Tiếng Việt" is set in Archivo (see :lang(vi) in global.css).
      subsets: ["latin", "vietnamese"],
      fallbacks: ["Arial Narrow", "Arial", "sans-serif"],
      options: { experimental: { variableAxis: { wdth: [[62, 125]] } } },
    },
    {
      // Subset to the glyphs this site uses (see pageGlyphs): one variable file
      // instead of a slice per unicode range, so text re-flows once, not dozens of times.
      name: "Noto Sans KR",
      cssVariable: "--font-sans",
      provider: fontProviders.google(),
      weights: ["100 900"],
      styles: ["normal"],
      fallbacks: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
      options: { experimental: { glyphs: pageGlyphs() } },
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      provider: fontProviders.google(),
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "Consolas", "monospace"],
    },
  ],

  image: {
    responsiveStyles: false,
  },

  // ~50 KB of CSS rides inside the HTML, so first paint waits on no extra request.
  build: {
    inlineStylesheets: "always",
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 700,
    },
  },
});
