import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["cesium"],
  webpack: (config, { webpack }) => {
    // Define CESIUM_BASE_URL so CesiumJS can locate its Workers/Assets at runtime.
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );

    // Stub @zip.js/zip.js/lib/zip-no-worker.js:
    // Newer @zip.js/zip.js removed this path from its exports field,
    // but @cesium/engine still tries to import it for KML support (unused here).
    config.resolve.alias = {
      ...config.resolve.alias,
      "@zip.js/zip.js/lib/zip-no-worker.js": resolve(
        __dirname,
        "src/lib/cesium-stubs/zip-no-worker.js"
      ),
    };

    return config;
  },
};

export default nextConfig;
