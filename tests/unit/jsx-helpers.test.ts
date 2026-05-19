import { jsx, jsxs } from "@askrjs/askr/jsx-runtime";
import { describe, expect, it } from "vite-plus/test";

import { serializeForId } from "../../src/components/_internal/jsx";

type WidgetProps = {
  [key: string]: unknown;
  children?: unknown;
};

function NamedWidget(props: WidgetProps): JSX.Element {
  return jsx("span", { children: props.children });
}

const AnonymousWidget = function (props: WidgetProps): JSX.Element {
  return jsx("span", { children: props.children });
};

Object.defineProperty(AnonymousWidget, "name", { value: "" });

describe("JSX serialization helpers", () => {
  it("serializes arrays, nested trees, and stable prop filters", () => {
    const value = jsxs("section", {
      "data-slot": "root",
      children: [
        jsx("span", { children: "One" }),
        jsx(NamedWidget, {
          active: true,
          "data-state": "open",
          id: "named",
          onClick: () => undefined,
          ref: { current: null },
          title: "Widget",
          children: jsxs("div", {
            children: [jsx("strong", { children: "Two" }), jsx("em", { children: "Three" })],
          }),
        }),
        jsx(AnonymousWidget, {
          children: undefined,
          role: "note",
        }),
      ],
    });

    expect(serializeForId(value)).toBe(
      "section[data-slot:root](span[](One)|NamedWidget[active:true,data-state:open,id:named,title:Widget](div[](strong[](Two)|em[](Three)))|component[role:note]())",
    );
  });

  it("returns stable fallbacks for unsupported values", () => {
    expect(serializeForId(undefined)).toBe("");
    expect(serializeForId(null)).toBe("");
    expect(serializeForId(false)).toBe("");
    expect(serializeForId(0)).toBe("0");
    expect(serializeForId(Symbol("id"))).toBe("symbol");
    expect(serializeForId({})).toBe("object");
  });
});
