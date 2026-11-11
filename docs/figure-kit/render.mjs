// Render a figure or cover HTML file to PNG at 2x.
// Usage: node render.mjs <in.html> <out.png> [--crop WxH]   (crop is in CSS px, centred, for the social crop)
// Needs Playwright: set PW_DIR to a directory whose node_modules holds playwright.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const [inp, out, ...rest] = process.argv.slice(2);
if (!inp || !out) { console.error("usage: render.mjs in.html out.png [--crop WxH]"); process.exit(2); }
const require = createRequire(resolve(process.env.PW_DIR || ".") + "/");
const { chromium } = require("playwright");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch(existsSync(CHROME) ? { executablePath: CHROME } : { channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2, colorScheme: "dark" });
const page = await ctx.newPage();
await page.goto(pathToFileURL(resolve(inp)).href, { waitUntil: "load" });
const el = page.locator(".fig, .cover").first();
const crop = rest[0] === "--crop" ? rest[1].split("x").map(Number) : null;
if (crop) {
  const box = await el.boundingBox();
  const [cw, ch] = crop;
  // crop is expressed on the 800 x 450 design; scale to the box then centre
  const clip = { x: box.x + (box.width - cw) / 2, y: box.y + (box.height - ch) / 2, width: cw, height: ch };
  await page.screenshot({ path: out, clip });
} else {
  await el.screenshot({ path: out });
}
await browser.close();
