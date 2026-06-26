import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import * as components from "../../src/components";
import {
  SHADCN_CHART_COMPONENT,
  SHADCN_THEME_COMPONENT_SUBPATHS,
  SHADCN_THEME_COMPONENTS,
} from "../../src/parity";
import { ROOT_DIR } from "./test-paths";

const DIRECT_TESTS = [
  "tests/unit/components-entrypoint.test.ts",
  "tests/unit/package-surface.test.ts",
  "tests/unit/card-components.test.ts",
  "tests/unit/slot-coverage.test.ts",
] as const;

const BENCH_FILES = [
  "benches/tier2/public-families.bench.tsx",
  "benches/tier3/composition.bench.tsx",
  "benches/tier4/browser-flows.bench.tsx",
] as const;

function assertFileExists(relativePath: string, message: string): void {
  expect(existsSync(join(ROOT_DIR, relativePath)), message).toBe(true);
}

describe("component coverage matrix", () => {
  it("should keeps every non-chart shadcn component represented in the themes catalog", () => {
    const namespace = components as Record<string, unknown>;

    for (const component of SHADCN_THEME_COMPONENTS) {
      expect(typeof namespace[component], component).toBe("function");
    }

    expect(namespace[SHADCN_CHART_COMPONENT]).toBeUndefined();
  });

  it("should keeps every non-chart shadcn component represented by a package subpath", () => {
    expect(SHADCN_THEME_COMPONENT_SUBPATHS).not.toContain("chart");
    expect(SHADCN_THEME_COMPONENT_SUBPATHS).not.toContain("charts");

    for (const subpath of SHADCN_THEME_COMPONENT_SUBPATHS) {
      expect(typeof subpath).toBe("string");
      expect(subpath.length).toBeGreaterThan(0);
    }
  });

  it("should keeps direct tests and composition benches attached to the public catalog", () => {
    for (const testFile of DIRECT_TESTS) {
      assertFileExists(testFile, `missing direct test file ${testFile}`);
    }

    for (const benchFile of BENCH_FILES) {
      assertFileExists(benchFile, `missing bench file ${benchFile}`);
    }
  });
});
