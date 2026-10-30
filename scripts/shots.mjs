// README screenshots — the 2020 site (served from legacy/) next to the new one.
//   npm run build && npm run preview    (in another terminal)
//   npm run shots                       (SHOTS_URL / CHROME to override)
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const URL = process.env.SHOTS_URL ?? "http://localhost:4330/portfolio/";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(page, name, width) {
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize({ width }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  console.log(`  ✓ ${OUT}/${name}.jpg`);
}

/** Scroll so `selector` sits `offset` px below the top, then let the motion settle. */
async function goto(page, selector, offset = 0, wait = 2200) {
  await page.evaluate(
    (sel, off) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
    },
    selector,
    offset,
  );
  await sleep(wait);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--mute-audio"] });

try {
  // 2020
  const old = await browser.newPage();
  await old.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await old.goto(`${URL}legacy/`, { waitUntil: "networkidle2" });
  await sleep(2200);
  await capture(old, "before-home", 1440);
  await old.evaluate(() => document.querySelector(".navWrap .workBtn").click());
  await sleep(2400);
  await capture(old, "before-work", 1440);
  await old.evaluate(() => document.querySelector(".navWrap .aboutBtn").click());
  await sleep(2400);
  await capture(old, "before-about", 1440);

  const phoneOld = await browser.newPage();
  await phoneOld.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await phoneOld.goto(`${URL}legacy/`, { waitUntil: "networkidle2" });
  await sleep(2200);
  await capture(phoneOld, "before-mobile", 390);

  // 2026
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await sleep(3000);
  await capture(page, "after-hero", 1440);
  await goto(page, ".manifesto__text", 140);
  await goto(page, ".manifesto__text", 140, 1200);
  await capture(page, "after-about", 1440);
  await goto(page, "[data-pipe-viewport]", 0, 600);
  await page.evaluate(() => window.scrollBy(0, 900));
  await sleep(2200);
  await capture(page, "after-process", 1440);
  await goto(page, "#work", 0);
  await page.evaluate(() => window.scrollBy(0, 150));
  await sleep(1600);
  await capture(page, "after-work", 1440);
  await goto(page, "#p-malang", 90, 2600);
  await capture(page, "after-product", 1440);
  await goto(page, "#p-dearmio", 90, 2600);
  await capture(page, "after-product-2", 1440);
  await goto(page, "#harness", -40, 2800);
  await capture(page, "after-harness", 1440);
  await goto(page, "#archive", -40, 3600);
  await capture(page, "after-archive", 1440);
  await goto(page, "#contact", -20, 2400);
  await capture(page, "after-contact", 1440);

  const phone = await browser.newPage();
  await phone.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await phone.goto(URL, { waitUntil: "networkidle0" });
  await sleep(3000);
  await capture(phone, "mobile-hero", 390);
  await goto(phone, "#work", -10, 1800);
  await capture(phone, "mobile-work", 390);
  await goto(phone, "#p-malang", 60, 2600);
  await capture(phone, "mobile-product", 390);
} finally {
  await browser.close();
}
