// Social card: the real hero, rendered at 1200×630 from the built site.
//   npm run build && npm run preview    (in another terminal)
//   npm run assets:og                   (OG_URL / CHROME to override)
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const URL = process.env.OG_URL ?? "http://localhost:4330/portfolio/";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--mute-audio"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle0" });
  await sleep(3200); // intro + a few seconds of cable motion
  // Card layout: no header, no buttons, no footer bar — just the type and the harness.
  await page.addStyleTag({
    content: `
      .hdr, .hero__cta, .hero__foot, .grain, .cursor { display: none !important; }
      .hero { min-height: 630px !important; height: 630px; padding-top: 0 !important; justify-content: center !important; }
      .hero__inner { padding-bottom: 0 !important; }
      .hero__kicker { margin-bottom: 26px !important; }
      .hero__title { font-size: 128px !important; }
      .hero__row { margin-top: 30px !important; }
      .hero__lead { font-size: 21px !important; max-width: 40em !important; }
    `,
  });
  await sleep(600);
  const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile("public/og.jpg");
  console.log("  ✓ public/og.jpg");
} finally {
  await browser.close();
}
