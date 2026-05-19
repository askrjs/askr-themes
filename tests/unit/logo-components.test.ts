import { describe, expect, it } from "vite-plus/test";

import { createLogo, GitHubLogo, GoogleLogo, MicrosoftLogo } from "../../src/logos";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

function childElements(value: unknown): ElementLike[] {
  if (!Array.isArray(value)) return [];
  return value as ElementLike[];
}

describe("brand logo components", () => {
  it("exports the custom logo factory", () => {
    const CustomLogo = createLogo("CustomLogo", "0 0 24 24", [
      ["path", { d: "M0 0h24v24H0z", fill: "currentColor" }],
    ]);
    const element = asElement(CustomLogo({ title: "Custom", class: "brand-logo" }));
    const children = childElements(element.props.children);

    expect(typeof createLogo).toBe("function");
    expect(element.type).toBe("svg");
    expect(element.props["data-icon"]).toBe("CustomLogo");
    expect(element.props.class).toBe("brand-logo");
    expect(element.props["aria-hidden"]).toBeUndefined();
    expect(children[0]?.type).toBe("title");
    expect(children[0]?.props.children).toBe("Custom");
  });

  it("renders the shared icon slot contract with brand fills intact", () => {
    const element = asElement(GoogleLogo({ title: "Google", size: "lg", class: "brand-logo" }));
    const children = childElements(element.props.children);

    expect(element.type).toBe("svg");
    expect(element.props["data-slot"]).toBe("icon");
    expect(element.props["data-icon"]).toBe("GoogleLogo");
    expect(element.props["data-size"]).toBe("lg");
    expect(element.props.class).toBe("brand-logo");
    expect(element.props["aria-hidden"]).toBeUndefined();
    expect(String(element.props.style)).toContain("--ak-icon-size:var(--ak-icon-size-lg");
    expect(children[0]?.type).toBe("title");
    expect(children[0]?.props.children).toBe("Google");
    expect(children.slice(1).map((child) => child.props.fill)).toEqual([
      "#4285F4",
      "#34A853",
      "#FBBC05",
      "#EA4335",
    ]);
  });

  it("stays decorative by default when no title is provided", () => {
    const element = asElement(GitHubLogo({}));
    const children = childElements(element.props.children);

    expect(element.props["data-decorative"]).toBe("true");
    expect(element.props["aria-hidden"]).toBe("true");
    expect(children).toHaveLength(1);
    expect(children[0]?.type).toBe("path");
    expect(children[0]?.props.fill).toBe("currentColor");
  });

  it("renders multi-shape brand marks with explicit fills", () => {
    const element = asElement(MicrosoftLogo({ size: 28, class: "mark" }));
    const children = childElements(element.props.children);

    expect(element.props.class).toBe("mark");
    expect(String(element.props.style)).toContain("--ak-icon-size:28px");
    expect(children).toHaveLength(4);
    expect(children.map((child) => child.type)).toEqual(["rect", "rect", "rect", "rect"]);
    expect(children.map((child) => child.props.fill)).toEqual([
      "#F25022",
      "#7FBA00",
      "#00A4EF",
      "#FFB900",
    ]);
  });
});
