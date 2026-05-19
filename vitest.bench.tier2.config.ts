import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["benches/tier2/**/*.bench.ts", "benches/tier2/**/*.bench.tsx"],
    setupFiles: ["tests/jsdom/setup.ts"],
  },
  resolve: {
    preserveSymlinks: true,
  },
});
