import { defineConfig } from "vite-plus";

export default defineConfig({
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
