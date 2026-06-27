import { defineConfig } from "vite-plus";
import { askrRuntimeAliases } from "./vitest.shared";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: askrRuntimeAliases,
    dedupe: ["@askrjs/askr"],
    preserveSymlinks: true,
  },
});
