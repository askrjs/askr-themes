import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    dedupe: ["@askrjs/askr"],
  },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/jsdom/**/*.test.tsx"],
    setupFiles: ["tests/jsdom/setup.ts"],
  },
});
