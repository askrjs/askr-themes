import { askr } from "@askrjs/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

const include = ["benches/tier4/**/*.bench.ts", "benches/tier4/**/*.bench.tsx"];

export default defineConfig({
  plugins: [askr()],
  optimizeDeps: {
    noDiscovery: true,
  },
  test: {
    benchmark: {
      include,
    },
    deps: {
      optimizer: {
        client: {
          enabled: false,
        },
      },
    },
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include,
  },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
    jsxInject: "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
});
