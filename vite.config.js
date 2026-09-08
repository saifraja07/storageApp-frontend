import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    // react-router's package.json exports always point at its unminified
    // "development" build (no npm export condition selects "production" —
    // this looks like an upstream packaging gap in react-router 7.x).
    // Force the production build only for `vite build`, so local `vite dev`
    // keeps react-router's helpful console warnings.
    alias:
      command === "build"
        ? [
            { find: /^react-router$/, replacement: path.resolve(__dirname, "node_modules/react-router/dist/production/index.mjs") },
            { find: /^react-router\/dom$/, replacement: path.resolve(__dirname, "node_modules/react-router/dist/production/dom-export.mjs") },
          ]
        : [],
  },
  build: {
    // Raise warning limit slightly (default 500kB is very conservative)
    chunkSizeWarningLimit: 600,
  },
}));
