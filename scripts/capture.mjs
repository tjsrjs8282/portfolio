// Screenshots of the live products, taken like a visitor would see them.
// Sources land in src/assets/shots/ and Astro turns them into AVIF/WebP at build.
//   npm run capture                 every product
//   npm run capture -- dearmio doii only some
//   CHROME=<path> to override the browser
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "src/assets/shots";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * wait: ms to let intros settle. scroll: px to scroll before the shot.
 * prep: runs in the page before the shot (close banners, skip intros).
 */
const SITES = [
  { id: "malang", url: "https://capdoii.com/play", wait: 5000 },
  { id: "dearmio", url: "https://dearmio.com", wait: 4500 },
  { id: "doii", url: "https://capdoii.com", wait: 4500 },
  { id: "ailter", url: "https://ailter.ai", wait: 6000 },
  { id: "geonyworks", url: "https://geonyworks.com", wait: 9000 },
  { id: "geonywony", url: "https://geonywony.com/ko", wait: 6000 },
];

const only = process.argv.slice(2);
const targets = only.length ? SITES.filter((s) => only.includes(s.id)) : SITES;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--mute-audio", "--lang=ko-KR"],
});

async function shoot(site, kind) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "ko-KR,ko;q=0.9" });
  if (kind === "desktop") {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  } else {
    await page.setUserAgent({
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  }
  try {
    await page.goto(site.url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch (e) {
    console.warn(`  ! ${site.id} ${kind}: ${e.message} (shooting anyway)`);
  }
  await sleep(site.wait);
  if (site.scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), site.scroll);
    await sleep(1500);
  }
  if (site.prep) await page.evaluate(site.prep);
  const png = await page.screenshot({ type: "png" });
  const file = `${OUT}/${site.id}-${kind}.jpg`;
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  console.log(`  ✓ ${file}`);
  await page.close();
}

try {
  for (const site of targets) {
    await shoot(site, "desktop");
    await shoot(site, "mobile");
  }
} finally {
  await browser.close();
}
