import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createIsland } from "@askrjs/askr/boot";

import { CardTitle } from "../../src/components/card";

describe("card title semantics", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }
  });

  it("should preserve title styling and slots across heading levels", () => {
    createIsland({
      root: container!,
      component: () => (
        <main>
          <CardTitle>Default</CardTitle>
          <CardTitle titleAs="h1" class="page-title">
            Page
          </CardTitle>
          <CardTitle titleAs="h6">Nested</CardTitle>
        </main>
      ),
    });

    const titles = container!.querySelectorAll('[data-slot="card-title"]');
    expect(Array.from(titles, (title) => title.tagName)).toEqual(["H3", "H1", "H6"]);
    expect(titles[1]?.classList.contains("card-title")).toBe(true);
    expect(titles[1]?.classList.contains("page-title")).toBe(true);
  });
});
