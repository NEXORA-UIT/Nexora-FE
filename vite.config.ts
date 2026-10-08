import { defineConfig, type UserConfig } from "vite";
import type { InlineConfig } from "vitest/node";
import react from "@vitejs/plugin-react";
import path from "path";

interface VitestConfigExport extends UserConfig {
  test?: InlineConfig;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
} as VitestConfigExport);
