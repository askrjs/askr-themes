import { describe, expect, it } from "vite-plus/test";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { renderToString } from "@askrjs/askr/ssr";

import { AspectRatio } from "../../src/surfaces";
import { withThemeStyles } from "../../src/ssr";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("AspectRatio", () => {
  it("should render a canonical wrapper with a generated ratio class", () => {
    const element = asElement(AspectRatio({ ratio: 16 / 9, children: "media" }));

    expect(element.type).toBe("div");
    expect(element.props["data-slot"]).toBe("aspect-ratio");
    expect(element.props.style).toBeUndefined();
    expect(String(element.props.class)).toContain("ak-style-");
  });

  it("should support asChild composition", () => {
    const registry = createRouteRegistry(() =>
      route("/", () =>
        AspectRatio({ asChild: true, ratio: "4 / 3", children: <figure data-testid="media" /> }),
      ),
    );
    const html = renderToString({
      url: "/",
      registry,
      document: withThemeStyles(
        ({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`,
      ),
    });
    expect(html).toContain('<figure data-testid="media"');
    expect(html).toContain('data-slot="aspect-ratio"');
    expect(html).toMatch(/aspect-ratio:\s*4\s*\/\s*3/);
  });
});
