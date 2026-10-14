import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cspNonce } from "@askrjs/askr";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { createStaticGen } from "@askrjs/askr/ssg";
import { renderRouteRequestToString, renderToString } from "@askrjs/askr/ssr";
import { describe, expect, it } from "vite-plus/test";

import { Block, Container } from "../../src/core";
import { withThemeStyles } from "../../src/ssr";

const NONCE = "MDEyMzQ1Njc4OWFiY2RlZg";
const SECOND_NONCE = "ZmVkY2JhOTg3NjU0MzIxMA";

const INERT_CLASS_EXAMPLES = [
  ["comment", '<!-- <div class="ak-style-fake">ignored</div> -->'],
  ["script", `<script>const example='<span class="ak-style-fake"></span>';</script>`],
  ["style", `<style>.example::before{content:' class="ak-style-fake"'}</style>`],
  ["textarea", '<textarea> class="ak-style-fake"</textarea>'],
  ["title", '<title> class="ak-style-fake"</title>'],
  ["quoted attribute", `<div data-example=' class="ak-style-fake"'>plain</div>`],
  ["quoted tag example", `<div data-example='<span class="ak-style-fake">'>plain</div>`],
  ["raw-text closing prefix", '<script></scripture><div class="ak-style-fake"></div></script>'],
  ["raw-text closing space", '<script></ script><div class="ak-style-fake"></div></script>'],
] as const;

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
  it.each(
    INERT_CLASS_EXAMPLES.flatMap(([name, fragment]) =>
      [false, true].map((hasStyles) => ({ name, fragment, hasStyles })),
    ),
  )(
    "should ignore class-like text in $name with registrations=$hasStyles",
    ({ fragment, hasStyles }) => {
      const document = `<html><head></head><body>${fragment}</body></html>`;
      const renderDocument = withThemeStyles(() => document);
      expect(renderDocument({ appHtml: "plain", context: hasStyles ? { styles: [] } : {} })).toBe(
        document,
      );
    },
  );

  it.each([
    '<div class="ak-style-real"></div>',
    "<div class='ak-style-real'></div>",
    '<DIV CLASS = "ak-style-real"></DIV>',
    "<div class=ak-style-real></div>",
    '<div class="ak-style&#45;real"></div>',
    '<div class="other&#32;ak-style-real"></div>',
    '<div class="ak-style-&#114;eal"></div>',
    '<script class="ak-style-real">const value = 1;</script>',
    '<script>ignored</script><div class="ak-style-real"></div>',
  ])("should validate actual generated element classes in %s", (appHtml) => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );
    expect(() => renderDocument({ appHtml, context: { styles: [] } })).toThrow(
      /missing request-local.*ak-style-real/i,
    );
    const html = renderDocument({
      appHtml,
      context: { styles: [{ id: "ak-style-real", cssText: ".ak-style-real{color:red}" }] },
    });
    expect(html).toContain('<style data-askr-style-registry="true">.ak-style-real{color:red}');
  });

  it("should use the first duplicate class attribute and HTML class whitespace", () => {
    const appHtml =
      '<div class="plain" class="ak-style-fake"></div><div class="plain\u00a0ak-style-fake"></div>';
    expect(
      withThemeStyles(({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`)({
        appHtml,
        context: {},
      }),
    ).toContain(appHtml);
  });

  it("should insert rules at the actual head end after quoted head-like text", () => {
    const html = withThemeStyles(
      ({ appHtml }) =>
        `<html><head><meta data-example="</head>"></head><body>${appHtml}</body></html>`,
    )({
      appHtml: '<div class="ak-style-real"></div>',
      context: { styles: [{ id: "ak-style-real", cssText: ".ak-style-real{color:red}" }] },
    });
    expect(html).toContain('<meta data-example="</head>"><style data-askr-style-registry="true">');
    expect(html).toContain('</style></head><body><div class="ak-style-real">');
  });

  it("should reject generated classes without request-local style registrations", () => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );

    expect(() =>
      renderDocument({
        appHtml: '<div class="ak-style-missing">content</div>',
        context: {},
      }),
    ).toThrow(/request-local.*style registrations/i);
    expect(() =>
      renderDocument({
        appHtml: '<div class="ak-style-missing">content</div>',
        context: { styles: [] },
      }),
    ).toThrow(/missing request-local.*ak-style-missing/i);
  });

  it("should validate generated classes added by the document renderer", () => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) =>
        `<html><head></head><body><main class="ak-style-wrapper">${appHtml}</main></body></html>`,
    );

    expect(() =>
      renderDocument({
        appHtml: "content",
        context: { styles: [] },
      }),
    ).toThrow(/missing request-local.*ak-style-wrapper/i);
  });

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

  it("should deduplicate identical registrations in their first-registration order", () => {
    const html = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    )({
      appHtml: '<div class="ak-style-second ak-style-first"></div>',
      context: {
        styles: [
          { id: "ak-style-first", cssText: ".ak-style-first{color:red}" },
          { id: "ak-style-second", cssText: ".ak-style-second{color:blue}" },
          { id: "ak-style-first", cssText: ".ak-style-first{color:red}" },
        ],
      },
    });

    expect(html.match(/data-askr-style-registry="true"/g)).toHaveLength(1);
    expect(html.match(/\.ak-style-first\{/g)).toHaveLength(1);
    expect(html.match(/\.ak-style-second\{/g)).toHaveLength(1);
    expect(html.indexOf(".ak-style-first{")).toBeLessThan(html.indexOf(".ak-style-second{"));
  });

  it("should reject conflicting CSS for one registration ID", () => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );

    expect(() =>
      renderDocument({
        appHtml: '<div class="ak-style-collision"></div>',
        context: {
          styles: [
            { id: "ak-style-collision", cssText: ".ak-style-collision{color:red}" },
            { id: "ak-style-collision", cssText: ".ak-style-collision{color:blue}" },
          ],
        },
      }),
    ).toThrow(RangeError);
  });

  it.each([
    { id: "", cssText: ".ak-style-invalid{color:red}" },
    { id: "ak-style-invalid", cssText: "" },
  ])("should reject empty registration fields: $id / $cssText", (registration) => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );

    expect(() =>
      renderDocument({ appHtml: "content", context: { styles: [registration] } }),
    ).toThrow(TypeError);
  });

  it("should keep one reusable document wrapper free of earlier rules and nonce state", () => {
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );
    const first = renderDocument({
      appHtml: '<div class="ak-style-first"></div>',
      context: {
        cspNonce: '"<&>first',
        styles: [{ id: "ak-style-first", cssText: ".ak-style-first{color:red}" }],
      },
    });
    const second = renderDocument({
      appHtml: '<div class="ak-style-second"></div>',
      context: {
        cspNonce: SECOND_NONCE,
        styles: [{ id: "ak-style-second", cssText: ".ak-style-second{color:blue}" }],
      },
    });
    const third = renderDocument({ appHtml: "plain", context: {} });
    const empty = renderDocument({ appHtml: "plain", context: { styles: [] } });

    expect(first).toContain('nonce="&quot;&lt;&amp;&gt;first"');
    expect(first).not.toContain("ak-style-second");
    expect(second).toContain(`nonce="${SECOND_NONCE}"`);
    expect(second).not.toContain("ak-style-first");
    expect(second).not.toContain("&quot;&lt;&amp;&gt;first");
    expect(third).toBe("<html><head></head><body>plain</body></html>");
    expect(empty).toBe(third);
  });

  it("should include more than 512 request-local style rules in the rendered document", () => {
    const styles = Array.from({ length: 513 }, (_, index) => {
      const id = `ak-style-${index.toString(36)}`;
      return { id, cssText: `.${id}{--value:${index}}` };
    });
    const classes = styles.map(({ id }) => id).join(" ");
    const html = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    )({
      appHtml: `<div class="${classes}"></div>`,
      context: { styles },
    });

    expect(html.match(/\.ak-style-[a-z0-9]+\{/g)).toHaveLength(513);
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

  it("should isolate rules when overlapping route loaders complete in reverse order", async () => {
    const barrier = () => {
      let release = () => {};
      const promise = new Promise<void>((resolve) => {
        release = resolve;
      });
      return { promise, release };
    };
    const smallEntered = barrier();
    const largeEntered = barrier();
    const smallGate = barrier();
    const largeGate = barrier();
    const registry = createRouteRegistry(() => {
      route(
        "/small",
        () =>
          Container({
            size: "sm",
            children: Block({ style: { marginTop: "3px" }, children: cspNonce() }),
          }),
        {
          loader: async () => {
            smallEntered.release();
            await smallGate.promise;
            return null;
          },
        },
      );
      route(
        "/large",
        () =>
          Container({
            size: "xl",
            children: Block({ style: { marginTop: "11px" }, children: cspNonce() }),
          }),
        {
          loader: async () => {
            largeEntered.release();
            await largeGate.promise;
            return null;
          },
        },
      );
    });
    let smallCompleted = false;
    const smallRequest = renderRouteRequestToString({
      url: "/small",
      registry,
      cspNonce: NONCE,
    }).then((result) => {
      smallCompleted = true;
      return result;
    });
    const largeRequest = renderRouteRequestToString({
      url: "/large",
      registry,
      cspNonce: SECOND_NONCE,
    });
    const renderDocument = withThemeStyles(
      ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
    );

    try {
      await Promise.all([smallEntered.promise, largeEntered.promise]);
      largeGate.release();
      const largeResult = await largeRequest;
      expect(largeResult.kind).toBe("render");
      if (largeResult.kind !== "render") throw new Error("Expected the large route to render");
      expect(largeResult.html).toContain(SECOND_NONCE);
      expect(largeResult.html).not.toContain(NONCE);
      const large = renderDocument({
        appHtml: largeResult.html,
        context: { styles: largeResult.styles, cspNonce: SECOND_NONCE },
      });
      expect(smallCompleted).toBe(false);
      expect(largeResult.styles).toHaveLength(2);
      expect(largeResult.styles?.[0]?.cssText).toContain("margin-top:11px");
      expect(largeResult.styles?.[1]?.cssText).toContain("--ak-container-4");
      expect(large.match(/data-askr-style-registry="true"/g)).toHaveLength(1);
      expect(large).toContain(`nonce="${SECOND_NONCE}"`);
      expect(large).not.toContain(NONCE);
      expect(large).not.toContain("margin-top:3px");
      expect(large).not.toContain("--ak-container-1");

      smallGate.release();
      const smallResult = await smallRequest;
      expect(smallResult.kind).toBe("render");
      if (smallResult.kind !== "render") throw new Error("Expected the small route to render");
      expect(smallResult.html).toContain(NONCE);
      expect(smallResult.html).not.toContain(SECOND_NONCE);
      const small = renderDocument({
        appHtml: smallResult.html,
        context: { styles: smallResult.styles, cspNonce: NONCE },
      });
      expect(smallResult.styles).toHaveLength(2);
      expect(smallResult.styles?.[0]?.cssText).toContain("margin-top:3px");
      expect(smallResult.styles?.[1]?.cssText).toContain("--ak-container-1");
      expect(small.match(/data-askr-style-registry="true"/g)).toHaveLength(1);
      expect(small).toContain(`nonce="${NONCE}"`);
      expect(small).not.toContain(SECOND_NONCE);
      expect(small).not.toContain("margin-top:11px");
      expect(small).not.toContain("--ak-container-4");

      const third = await renderRouteRequestToString({ url: "/small", registry });
      expect(third.kind).toBe("render");
      if (third.kind !== "render") throw new Error("Expected the later route to render");
      expect(third.styles).toEqual(smallResult.styles);
      expect(
        renderDocument({ appHtml: third.html, context: { styles: third.styles } }),
      ).not.toContain("nonce=");
    } finally {
      smallGate.release();
      largeGate.release();
      await Promise.allSettled([smallRequest, largeRequest]);
    }
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
