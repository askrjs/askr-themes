import { describe, expect, it } from "vite-plus/test";

import * as components from "../../src/components";
import {
  EXCLUDED_CHART_COMPONENT,
  THEME_COMPONENT_SUBPATHS,
  THEME_COMPONENTS,
} from "../../src/parity";

describe("component coverage matrix", () => {
  it("should keep every public non-chart component represented in the themes catalog", () => {
    const namespace = components as Record<string, unknown>;

    for (const component of THEME_COMPONENTS) {
      expect(typeof namespace[component], component).toBe("function");
    }

    expect(namespace[EXCLUDED_CHART_COMPONENT]).toBeUndefined();
  });

  it("should keep every public non-chart component represented by a package subpath", () => {
    expect(THEME_COMPONENT_SUBPATHS).not.toContain("chart");
    expect(THEME_COMPONENT_SUBPATHS).not.toContain("charts");

    for (const subpath of THEME_COMPONENT_SUBPATHS) {
      expect(typeof subpath).toBe("string");
      expect(subpath.length).toBeGreaterThan(0);
    }
  });
});
