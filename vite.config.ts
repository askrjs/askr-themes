import { readdirSync } from "node:fs";
import { defineConfig } from "vite-plus";

const externalPackagePattern = /^@askrjs\/(?:askr|ui)(?:\/.*)?$/;
const componentEntries = Object.fromEntries(
  readdirSync(new URL("./src/entries", import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => [`entries/${entry.name.slice(0, -3)}`, `src/entries/${entry.name}`]),
);

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@askrjs/askr",
  },
  pack: {
    entry: {
      components: "src/components.ts",
      core: "src/core.ts",
      controls: "src/controls.ts",
      ...componentEntries,
      navs: "src/navs.ts",
      overlays: "src/overlays.ts",
      ssr: "src/ssr.ts",
      surfaces: "src/surfaces.ts",
      theme: "src/theme.ts",
    },
    format: ["esm"],
    outDir: "dist",
    platform: "neutral",
    tsconfig: "tsconfig.pack.json",
    dts: true,
    sourcemap: "hidden",
    unbundle: true,
    deps: {
      neverBundle: [/^@askrjs\/(?:askr|ui)(?:\/.*)?$/],
    },
  },
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        components: "src/components.ts",
        core: "src/core.ts",
        controls: "src/controls.ts",
        ...componentEntries,
        navs: "src/navs.ts",
        overlays: "src/overlays.ts",
        ssr: "src/ssr.ts",
        surfaces: "src/surfaces.ts",
        theme: "src/theme.ts",
      },
    },
    rollupOptions: {
      external: (id) => externalPackagePattern.test(id),
      output: [
        {
          dir: "dist",
          entryFileNames: "[name].js",
          exports: "named",
          format: "es",
          preserveModules: true,
          preserveModulesRoot: "src",
        },
      ],
    },
  },
});
