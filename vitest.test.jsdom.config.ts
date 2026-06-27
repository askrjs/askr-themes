import { defineConfig } from "vite-plus";
import { askrRuntimeAliases, linkedWorkspaceDeps } from "./vitest.shared";

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
    server: {
      deps: {
        inline: linkedWorkspaceDeps,
      },
    },
  },
  resolve: {
    alias: askrRuntimeAliases,
    dedupe: ["@askrjs/askr"],
    preserveSymlinks: true,
  },
});
