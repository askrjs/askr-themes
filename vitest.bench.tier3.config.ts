import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["benches/tier3/**/*.bench.ts", "benches/tier3/**/*.bench.tsx"],
    setupFiles: ["tests/jsdom/setup.ts"],
  },
  resolve: {
    preserveSymlinks: true,
  },
});
