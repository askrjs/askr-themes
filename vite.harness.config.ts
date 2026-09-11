import { askr } from "@askrjs/vite";
import { defineConfig } from "vite-plus";

/**
 * Dev server used only by the native Playwright browser suite. It serves the
 * repository root so specs can reach both `tests/browser/harness.html` (the
 * component mount harness) and `visual-check.html` (the manual audit page).
 *
 * `host` is pinned to `127.0.0.1` rather than left at Vite's `localhost`
 * default: Playwright's `webServer` readiness probe polls the literal address
 * in `webServer.url`, and a `localhost`-bound server silently fails that probe
 * on CI runners that resolve `localhost` to `::1`.
 */
export default defineConfig({
  // `askr()` installs the JSX transform (automatic runtime, `@askrjs/askr`
  // import source) the component scenarios compile against.
  plugins: [askr()],
  resolve: {
    dedupe: ["@askrjs/askr"],
  },
  // Scenario modules are imported lazily, so without an explicit scan list Vite
  // would discover their dependencies mid-test and force a full page reload —
  // which destroys the execution context an in-flight `page.evaluate` is using.
  optimizeDeps: {
    entries: ["tests/browser/harness.ts", "tests/browser/scenarios/*.tsx"],
  },
  server: {
    host: "127.0.0.1",
    port: 4318,
    strictPort: true,
    // Transform the harness and every scenario up front. Without this the first
    // worker to reach a given scenario pays the transform cost inline, which
    // under full parallelism on a cold CI runner shows up as timeouts.
    warmup: {
      clientFiles: ["./tests/browser/harness.ts", "./tests/browser/scenarios/*.tsx"],
    },
  },
});
