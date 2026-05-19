import { defineConfig } from "vite-plus";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    preserveSymlinks: true,
  },
});
