import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { createStaticGen } from "@askrjs/askr/ssg";
import { renderToString } from "@askrjs/askr/ssr";
import { describe, expect, it } from "vite-plus/test";

import { Block, Container } from "../../src/core";
import { withThemeStyles } from "../../src/ssr";

const NONCE = "MDEyMzQ1Njc4OWFiY2RlZg";
const SECOND_NONCE = "ZmVkY2JhOTg3NjU0MzIxMA";

function renderContainer(size: "sm" | "xl" = "xl", cspNonce = NONCE): string {
  const registry = createRouteRegistry(() => {
    route("/", () =>
      Container({
        size,
        class: "fixture",
        children: "content",
      }),
    );
  });

  return renderToString({
    url: "/",
    registry,
    cspNonce,
    document: withThemeStyles(
      ({ appHtml }) =>
        `<!doctype html><html><head></head><body><div id="app">${appHtml}</div></body></html>`,
    ),
  });
}

describe("generated theme styles during SSR", () => {
  it("should serialize Container layout rules into the initial document head", () => {
    const html = renderContainer();
    const className = html.match(/\b(ak-style-[a-z0-9]+)\b/)?.[1];
    const registry = html.match(
      /<style data-askr-style-registry="true" nonce="MDEyMzQ1Njc4OWFiY2RlZg">([\s\S]*?)<\/style>/,
    );

    expect(className).toBeDefined();
    expect(registry?.[1]).toContain(`.${className}{`);
    expect(registry?.[1]).toContain("--ak-px-base:var(--ak-layout-page-gutter)");
    expect(registry?.[1]).toContain("--ak-mx-base:auto");
    expect(registry?.[1]).toContain("--ak-width-base:100%");
    expect(registry?.[1]).toContain("--ak-max-width-base:var(--ak-container-4)");
    expect(html.indexOf("<style")).toBeLessThan(html.indexOf("<body"));
  });

  it("should serialize only rules used by the current server render", () => {
    const small = renderContainer("sm", NONCE);
    const large = renderContainer("xl", SECOND_NONCE);

    expect(small).toContain("--ak-max-width-base:var(--ak-container-1)");
    expect(small).not.toContain("--ak-max-width-base:var(--ak-container-4)");
    expect(small).toContain(`nonce="${NONCE}"`);
    expect(small).not.toContain(SECOND_NONCE);
    expect(large).toContain("--ak-max-width-base:var(--ak-container-4)");
    expect(large).not.toContain("--ak-max-width-base:var(--ak-container-1)");
    expect(large).toContain(`nonce="${SECOND_NONCE}"`);
    expect(large).not.toContain(NONCE);
  });

  it("should keep class identity stable regardless of prior render order", () => {
    const first = renderContainer("sm").match(/\b(ak-style-[a-z0-9]+)\b/)?.[1];
    renderContainer("xl");
    const repeated = renderContainer("sm").match(/\b(ak-style-[a-z0-9]+)\b/)?.[1];

    expect(first).toBeDefined();
    expect(repeated).toBe(first);
  });

  it("should not allow generated CSS to terminate the registry element", () => {
    const registry = createRouteRegistry(() => {
      route("/", () =>
        Block({
          style: {
            backgroundImage: 'url("</style><script data-pwned>")',
          },
          children: "content",
        }),
      );
    });
    const html = renderToString({
      url: "/",
      registry,
      document: withThemeStyles(
        ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
      ),
    });

    expect(html).not.toContain("</style><script data-pwned>");
    expect(html).toContain("<\\/style><script data-pwned>");
  });

  it("should write generated rules into SSG output", async () => {
    const outputDir = mkdtempSync(join(tmpdir(), "askr-themes-ssg-"));
    const registry = createRouteRegistry(() => {
      route("/", () => Container({ size: "sm", children: "small" }));
      route("/large", () => Container({ size: "xl", children: "large" }));
    });

    try {
      const generator = createStaticGen({
        registry,
        outputDir,
        concurrency: 2,
        document: withThemeStyles(
          ({ appHtml }) =>
            `<!doctype html><html><head></head><body><div id="app">${appHtml}</div></body></html>`,
        ),
      });
      const result = await generator.generate();
      const small = readFileSync(join(outputDir, "index.html"), "utf8");
      const large = readFileSync(join(outputDir, "large", "index.html"), "utf8");

      expect(result.failed).toBe(0);
      expect(small).toContain('data-askr-style-registry="true"');
      expect(small).toContain("--ak-max-width-base:var(--ak-container-1)");
      expect(small).not.toContain("--ak-max-width-base:var(--ak-container-4)");
      expect(large).toContain("--ak-max-width-base:var(--ak-container-4)");
      expect(large).not.toContain("--ak-max-width-base:var(--ak-container-1)");
      expect(small.indexOf("<style")).toBeLessThan(small.indexOf('<div id="app">'));
    } finally {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });
});
