import { defineConfig } from "vite-plus";

const include = ["benches/tier1/**/*.bench.ts", "benches/tier1/**/*.bench.tsx"];

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
    environment: "node",
    include,
  },
  resolve: {
    preserveSymlinks: true,
  },
});
