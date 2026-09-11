import { createIsland } from "@askrjs/askr/boot";

import { Block } from "../../../src/core";

/**
 * Two islands booted with different CSP nonces, so the spec can assert that the
 * style registry kept a separate nonced `<style>` element for each of them.
 */
export default function noncedIslands(root: HTMLElement): void {
  for (const [nonce, padding] of [
    ["MDEyMzQ1Njc4OWFiY2RlZg", "sm"],
    ["ZmVkY2JhOTg3NjU0MzIxMA", "lg"],
  ] as const) {
    const island = document.createElement("div");
    root.append(island);
    createIsland({
      root: island,
      cspNonce: nonce,
      component: () => <Block padding={padding}>content</Block>,
    });
  }
}
