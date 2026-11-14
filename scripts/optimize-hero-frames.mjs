// Converts hero PNG frames to WebP. Originals are never modified or deleted.
// Usage: npm run optimize:hero
import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("public/landing_page_images");
const OUT = path.join(SRC, "webp");
const QUALITY = 78;
const MAX_WIDTH = 1080; // never upscale; aspect ratio is preserved

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /^frame_\d{5}\.png$/.test(f)).sort();

let before = 0;
let after = 0;
for (const f of files) {
  const out = path.join(OUT, f.replace(/\.png$/, ".webp"));
  await sharp(path.join(SRC, f))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(out);
  before += (await stat(path.join(SRC, f))).size;
  after += (await stat(out)).size;
}
const mb = (n) => (n / 1048576).toFixed(1);
console.log(`${files.length} frames: ${mb(before)}MB PNG -> ${mb(after)}MB WebP`);
