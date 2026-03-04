/**
 * Copies Cesium static assets (Workers, Assets, Widgets, ThirdParty)
 * from node_modules into public/cesium/ so they can be served statically.
 * This avoids the need for copy-webpack-plugin at build time.
 */
import { cpSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");
const cesiumSrc = join(root, "node_modules", "cesium", "Build", "Cesium");
const cesiumDest = join(root, "public", "cesium");

const folders = ["Workers", "Assets", "Widgets", "ThirdParty"];

console.log("📦 Copying Cesium assets to public/cesium/...");

for (const folder of folders) {
  const src = join(cesiumSrc, folder);
  const dest = join(cesiumDest, folder);

  if (!existsSync(src)) {
    console.warn(`  ⚠ Source not found: ${src}`);
    continue;
  }

  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`  ✓ Copied ${folder}`);
}

console.log("✅ Cesium assets ready.\n");
