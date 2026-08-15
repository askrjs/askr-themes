import { cleanupApp, hydrateSPA } from "@askrjs/askr/boot";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { renderToString } from "@askrjs/askr/ssr";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Block, Container } from "../../src/core";
import { withThemeStyles } from "../../src/ssr";
import { styleDeclarationsToClass } from "../../src/components/_internal/style";

const NONCE = "MDEyMzQ1Njc4OWFiY2RlZg";
const roots: HTMLElement[] = [];

function removeStyleRegistries(): void {
  for (const registry of document.querySelectorAll("style[data-askr-style-registry]")) {
    registry.remove();
  }
}

function cssCommentInjectionCases(): string[] {
  let state = 0x64c55a1;
  const nextToken = (): string => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0).toString(36);
  };
  const cases: string[] = [];

  for (let index = 0; index < 24; index += 1) {
    const prefix = nextToken();
    const suffix = nextToken();
    for (const delimiter of ["/*", "*/"]) {
      cases.push(
        `${delimiter}${suffix}`,
        `${prefix}${delimiter}${suffix}`,
        `${prefix}${delimiter}`,
        `"${prefix}${delimiter}${suffix}"`,
        `${prefix} ${delimiter} ${suffix}`,
        `${prefix}${delimiter}${delimiter}${suffix}`,
      );
    }
    cases.push(`${prefix}/*nested*/${suffix}`);
  }

  return cases;
}

function renderWithoutBrowserDocument(registry: ReturnType<typeof createRouteRegistry>): string {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: undefined,
  });

  try {
    return renderToString({
      url: "/",
      registry,
      cspNonce: NONCE,
      document: withThemeStyles(
        ({ appHtml }) =>
          `<!doctype html><html><head></head><body><div id="app">${appHtml}</div></body></html>`,
      ),
    });
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    cleanupApp(root);
    root.remove();
  }
  removeStyleRegistries();
});

describe("generated theme style hydration", () => {
  it("should reject generated CSS comment-delimiter injections without mutating the shared registry", () => {
    removeStyleRegistries();

    for (const [index, value] of cssCommentInjectionCases().entries()) {
      expect(styleDeclarationsToClass(`--ak-fuzz-${index}:${value}`), value).toBeUndefined();
    }

    expect(document.querySelector("style[data-askr-style-registry]")).toBeNull();
    expect(styleDeclarationsToClass("color:blue")).toMatch(/^ak-style-/);
    expect(document.querySelector("style[data-askr-style-registry]")?.textContent).toContain(
      "color:blue",
    );
    expect(document.querySelector("style[data-askr-style-registry]")?.textContent).not.toContain(
      "nested",
    );
  });

  it("should reject a new rule before exceeding the registry capacity", () => {
    removeStyleRegistries();

    for (let index = 0; index < 512; index += 1) {
      expect(styleDeclarationsToClass(`--ak-capacity-${index}:${index}`)).toMatch(/^ak-style-/);
    }

    expect(() => styleDeclarationsToClass("--ak-capacity-overflow:513")).toThrow(
      "Theme style registry capacity exceeded.",
    );
    expect(document.querySelector("style[data-askr-style-registry]")?.textContent).not.toContain(
      "--ak-capacity-overflow:513",
    );
  });

  it("should adopt the server registry and append client-only rules without duplication", async () => {
    removeStyleRegistries();
    window.history.replaceState({}, "", "/");
    const registry = createRouteRegistry(() => {
      route("/", () => <Container size="xl">content</Container>);
      route("/client", () => <Block padding="lg">client only</Block>);
    });
    const serverHtml = renderWithoutBrowserDocument(registry);
    const parsed = new DOMParser().parseFromString(serverHtml, "text/html");
    const serverRegistry = parsed.head.querySelector<HTMLStyleElement>(
      "style[data-askr-style-registry]",
    );
    const serverApp = parsed.querySelector<HTMLElement>("#app");
    const root = document.createElement("div");
    root.innerHTML = serverApp?.innerHTML ?? "";
    document.body.append(root);
    roots.push(root);

    expect(serverRegistry).not.toBeNull();
    document.head.append(serverRegistry!);
    const initialRule = serverRegistry?.textContent?.match(/\.(ak-style-[a-z0-9]+)\{[^}]+\}/)?.[0];
    expect(initialRule).toBeDefined();

    await hydrateSPA({
      root,
      registry,
      cspNonce: NONCE,
      hydrate: { verifyMarkup: true },
    });

    const adopted = document.querySelectorAll<HTMLStyleElement>("style[data-askr-style-registry]");
    expect(adopted).toHaveLength(1);
    expect(adopted[0]).toBe(serverRegistry);
    expect(adopted[0].textContent?.split(initialRule!).length - 1).toBe(1);

    expect(styleDeclarationsToClass("--ak-p-base:var(--ak-space-lg)")).toMatch(/^ak-style-/);

    expect(document.querySelectorAll("style[data-askr-style-registry]")).toHaveLength(1);
    expect(adopted[0].textContent).toContain("--ak-p-base:var(--ak-space-lg)");
    expect(adopted[0].textContent?.split(initialRule!).length - 1).toBe(1);
  });
});
