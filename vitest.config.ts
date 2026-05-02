import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";

const uiSourceEntry = fileURLToPath(new URL("../askr-ui/dist/index.js", import.meta.url));
const askrSourceEntry = fileURLToPath(new URL("../askr/dist/index.js", import.meta.url));
const askrFoundationsEntry = fileURLToPath(
  new URL("../askr/dist/foundations/index.js", import.meta.url),
);
const askrJsxRuntimeEntry = fileURLToPath(new URL("../askr/dist/jsx-runtime.js", import.meta.url));
const askrJsxDevRuntimeEntry = fileURLToPath(
  new URL("../askr/dist/jsx-dev-runtime.js", import.meta.url),
);
const askrFxEntry = fileURLToPath(new URL("../askr/dist/fx/fx.js", import.meta.url));
const askrRouterEntry = fileURLToPath(new URL("../askr/dist/router/index.js", import.meta.url));
const askrResourcesEntry = fileURLToPath(new URL("../askr/dist/resources/index.js", import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@askrjs/askr",
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/**/*.browser.test.tsx"],
  },
  resolve: {
    alias: [
      { find: "@askrjs/askr/foundations", replacement: askrFoundationsEntry },
      { find: "@askrjs/askr/jsx-runtime", replacement: askrJsxRuntimeEntry },
      { find: "@askrjs/askr/jsx-dev-runtime", replacement: askrJsxDevRuntimeEntry },
      { find: "@askrjs/askr/fx", replacement: askrFxEntry },
      { find: "@askrjs/askr/router", replacement: askrRouterEntry },
      { find: "@askrjs/askr/resources", replacement: askrResourcesEntry },
      { find: "@askrjs/askr", replacement: askrSourceEntry },
      { find: "@askrjs/ui", replacement: uiSourceEntry },
    ],
    preserveSymlinks: true,
  },
});
