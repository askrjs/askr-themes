import { askr } from "@askrjs/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";
import { askrRuntimeAliases } from "./vitest.shared";

function seedBrowserPort() {
  return {
    name: "seed-browser-port",
    enforce: "pre",
    configureVitest(context: { vitest: { state: { _data: { browserLastPort: number } } } }) {
      context.vitest.state._data.browserLastPort = 0;
    },
  };
}

export default defineConfig({
  plugins: [seedBrowserPort(), askr()],
  test: {
    api: {
      host: "127.0.0.1",
    },
    globals: true,
    browser: {
      api: {
        host: "127.0.0.1",
        port: 0,
      },
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/browser/**/*.test.tsx"],
  },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
    jsxInject: "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
  resolve: {
    alias: askrRuntimeAliases,
    dedupe: ["@askrjs/askr"],
    preserveSymlinks: true,
  },
});
