import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // This allows network access
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  base: "/", // Use '/' for absolute paths in SPA
});
