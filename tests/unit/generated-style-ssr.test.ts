import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { createStaticGen } from "@askrjs/askr/ssg";
import { renderRouteRequestToString, renderToString } from "@askrjs/askr/ssr";
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
  it("should use request-local style registrations when the renderer provides them", () => {
    const html = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    )({
      appHtml: '<div class="ak-style-request">content</div>',
      context: {
        cspNonce: NONCE,
        styles: [{ id: "ak-style-request", cssText: ".ak-style-request{color:red}" }],
      },
    });

    expect(html).toContain(".ak-style-request{color:red}");
    expect(html).toContain(`nonce="${NONCE}"`);
  });

  it("should keep request-local style text inside the registry element", () => {
    const html = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    )({
      appHtml: '<div class="ak-style-request">content</div>',
      context: {
        styles: [
          { id: "ak-style-request", cssText: '.ak-style-request{content:"</style><script>"}' },
        ],
      },
    });

    expect(html).not.toContain("</style><script>");
    expect(html).toContain("<\\/style");
  });

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

  it("should isolate generated style registries across concurrent SSR requests", async () => {
    const registry = createRouteRegistry(() => {
      route("/small", () => Container({ size: "sm", children: "small" }));
      route("/large", () => Container({ size: "xl", children: "large" }));
    });
    const [smallResult, largeResult] = await Promise.all([
      renderRouteRequestToString({ url: "/small", registry, cspNonce: NONCE }),
      renderRouteRequestToString({ url: "/large", registry, cspNonce: SECOND_NONCE }),
    ]);

    expect(smallResult.kind).toBe("render");
    expect(largeResult.kind).toBe("render");
    if (smallResult.kind !== "render" || largeResult.kind !== "render") return;

    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );
    const small = renderDocument({
      appHtml: smallResult.html,
      context: { cspNonce: NONCE, styles: smallResult.styles },
    });
    const large = renderDocument({
      appHtml: largeResult.html,
      context: { cspNonce: SECOND_NONCE, styles: largeResult.styles },
    });

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
    expect(html).not.toContain("background-image");
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

  it("should ignore closing-head text inside raw-text elements", () => {
    const registry = createRouteRegistry(() => route("/", () => Container({ size: "sm" })));
    const html = renderToString({
      url: "/",
      registry,
      document: withThemeStyles(
        ({ appHtml }) =>
          `<html><head><script>const marker = "</head>";</script><style>const marker = "</head>";</style></head><body>${appHtml}</body></html>`,
      ),
    });
    const registryIndex = html.indexOf('<style data-askr-style-registry="true"');
    const actualHeadEnd = html.lastIndexOf("</head>");

    expect(registryIndex).toBeGreaterThan(html.indexOf("</head>"));
    expect(registryIndex).toBeLessThan(actualHeadEnd);
  });
});
