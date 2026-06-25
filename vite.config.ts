import { defineConfig } from "vite-plus";

const externalPackagePattern = /^@askrjs\/(?:askr|ui)(?:\/.*)?$/;

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@askrjs/askr",
  },
  pack: {
    entry: {
      core: "src/core.ts",
      controls: "src/controls.ts",
      feedback: "src/feedback.ts",
      navs: "src/navs.ts",
      overlays: "src/overlays.ts",
      surfaces: "src/surfaces.ts",
      theme: "src/theme.ts",
    },
    format: ["esm"],
    outDir: "dist",
    platform: "neutral",
    tsconfig: "tsconfig.pack.json",
    dts: true,
    sourcemap: true,
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
        core: "src/core.ts",
        controls: "src/controls.ts",
        feedback: "src/feedback.ts",
        navs: "src/navs.ts",
        overlays: "src/overlays.ts",
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
