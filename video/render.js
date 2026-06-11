/* Renders explainer.html frame-by-frame by seeking the document's
   animation timeline, then encodes with ffmpeg (run separately). */
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const fs = require("fs");

const FPS = 30;
const DURATION = 65; // seconds
const OUT = process.env.FRAMES_DIR || "/tmp/frames";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + __dirname + "/explainer.html", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  // freeze the clock: pause every animation (CSS + WAAPI)
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));

  const total = FPS * DURATION;
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const ms = (i / FPS) * 1000;
    await page.evaluate((t) => {
      document.getAnimations().forEach((a) => { a.currentTime = t; });
    }, ms);
    await page.screenshot({
      path: `${OUT}/f${String(i).padStart(5, "0")}.jpg`,
      type: "jpeg",
      quality: 92,
    });
    if (i % 150 === 0) {
      const rate = (i + 1) / ((Date.now() - t0) / 1000);
      console.log(`frame ${i}/${total} (${rate.toFixed(1)} fps render)`);
    }
  }
  await browser.close();
  console.log("DONE rendering", total, "frames in", ((Date.now() - t0) / 1000).toFixed(0) + "s");
})();
