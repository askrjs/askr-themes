import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanupApp, createIsland } from "@askrjs/askr/boot";
import { Block } from "../../src/core";

const roots: HTMLElement[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    cleanupApp(root);
    root.remove();
  }
});

describe("theme CSP nonce", () => {
  it("should create separate nonced style registries", () => {
    const first = "MDEyMzQ1Njc4OWFiY2RlZg";
    const second = "ZmVkY2JhOTg3NjU0MzIxMA";
    for (const [nonce, padding] of [
      [first, "sm"],
      [second, "lg"],
    ] as const) {
      const root = document.createElement("div");
      document.body.append(root);
      roots.push(root);
      createIsland({
        root,
        cspNonce: nonce,
        component: () => <Block padding={padding}>content</Block>,
      });
    }
    const styles = Array.from(
      document.querySelectorAll<HTMLStyleElement>("style[data-askr-style-registry]"),
    );
    expect(styles.some((style) => style.nonce === first)).toBe(true);
    expect(styles.some((style) => style.nonce === second)).toBe(true);
  });
});
