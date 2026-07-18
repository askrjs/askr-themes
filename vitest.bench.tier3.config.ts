import { defineConfig } from "vite-plus";

const include = ["benches/tier3/**/*.bench.ts", "benches/tier3/**/*.bench.tsx"];

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
});
