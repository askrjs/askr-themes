import { defineConfig } from "vite-plus";

const externalPackagePattern = /^@askrjs\/(?:askr|askr-ui)(?:\/.*)?$/;

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@askrjs/askr",
  },
  pack: {
    entry: {
      "default/card": "src/default/card.ts",
      "default/sidebar-layout": "src/default/sidebar-layout.tsx",
      "default/topbar-layout": "src/default/topbar-layout.tsx",
    },
    format: ["esm"],
    outDir: "dist",
    platform: "neutral",
    tsconfig: "tsconfig.pack.json",
    dts: true,
    sourcemap: true,
    unbundle: true,
    deps: {
      neverBundle: [/^@askrjs\/(?:askr|askr-ui)(?:\/.*)?$/],
    },
  },
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        "default/card": "src/default/card.ts",
        "default/sidebar-layout": "src/default/sidebar-layout.tsx",
        "default/topbar-layout": "src/default/topbar-layout.tsx",
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
