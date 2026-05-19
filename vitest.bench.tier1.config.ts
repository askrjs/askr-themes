import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "node",
    include: ["benches/tier1/**/*.bench.ts", "benches/tier1/**/*.bench.tsx"],
  },
  resolve: {
    preserveSymlinks: true,
  },
});
