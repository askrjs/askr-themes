import { defineConfig } from "vite-plus";

const include = ["benches/tier2/**/*.bench.ts", "benches/tier2/**/*.bench.tsx"];

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
  },
  test: {
    benchmark: {
      include,
    },
    environment: "jsdom",
    include,
    setupFiles: ["tests/jsdom/setup.ts"],
  },
  resolve: {
    preserveSymlinks: true,
  },
});
