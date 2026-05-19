import { jsx, jsxs } from "@askrjs/askr/jsx-runtime";
import { bench, describe } from "vite-plus/test";

import { consume } from "../_shared/sink";
import { collectJsxElements, serializeForId } from "../../src/components/_internal/jsx";
import { mergeProps } from "../../src/components/_internal/merge-props";
import { mergeLayoutStyles } from "../../src/components/_internal/layout";
import { mergeCssVar } from "../../src/components/_internal/style";

const WORK = 256;

const mergePropsBase = {
  class: "shell",
  onClick: () => undefined,
  onKeyDown: () => undefined,
  ref: { current: null as HTMLDivElement | null },
  role: "presentation",
  title: "shell",
};

const mergePropsInjected = {
  class: "shell-injected",
  onClick: () => undefined,
  onKeyDown: () => undefined,
  ref: { current: null as HTMLDivElement | null },
  "aria-label": "Shell",
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: "var(--ak-space-2)",
};

const layoutObjectUserStyle = {
  gap: "var(--ak-space-4)",
  padding: "1rem",
};

const layoutStringUserStyle = "gap:1rem;justify-content:center";

const cssVarObjectStyle = {
  backgroundColor: "var(--ak-color-surface)",
  color: "var(--ak-color-text)",
};

const cssVarStringStyle = "background-color:var(--ak-color-surface);color:var(--ak-color-text)";

function BenchLeaf(props: { children?: unknown; label: string }): JSX.Element {
  return jsxs("article", {
    "data-label": props.label,
    children: [jsx("header", { children: props.label }), jsx("div", { children: props.children })],
  });
}

function buildSerializeBranch(label: string, items: readonly string[]): JSX.Element {
  return jsxs("article", {
    "data-label": label,
    children: [
      jsx("header", { children: label }),
      jsx("p", { children: `${label} summary` }),
      jsxs("div", {
        "data-group": label,
        children: items.map((item, index) =>
          jsxs("section", {
            "data-entry": `${label}-${index}`,
            children: [
              jsx("h3", { children: item }),
              jsxs("div", {
                children: [
                  jsx("span", { children: `${item} A` }),
                  jsx("span", { children: `${item} B` }),
                  jsx("span", { children: `${item} C` }),
                ],
              }),
            ],
          }),
        ),
      }),
    ],
  });
}

const jsxTree = jsxs("section", {
  "data-slot": "bench-root",
  children: [
    jsx(BenchLeaf, {
      label: "Alpha",
      children: buildSerializeBranch("Alpha", ["One", "Two", "Three"]),
    }),
    jsx(BenchLeaf, {
      label: "Beta",
      children: buildSerializeBranch("Beta", ["Four", "Five", "Six"]),
    }),
    jsx(BenchLeaf, {
      label: "Gamma",
      children: buildSerializeBranch("Gamma", ["Seven", "Eight", "Nine"]),
    }),
    jsxs("footer", {
      children: [
        jsx("small", { children: "Tail" }),
        jsx("em", { children: "Summary" }),
        jsx("button", { type: "button", children: "Action" }),
      ],
    }),
  ],
});

describe("tier1 helper benches", () => {
  bench("merge props", () => {
    let result: unknown;

    for (let i = 0; i < WORK; i += 1) {
      result = mergeProps(mergePropsInjected, mergePropsBase);
    }

    consume(result);
  });

  bench("merge layout styles", () => {
    let result: string | undefined;

    for (let i = 0; i < WORK; i += 1) {
      result = mergeLayoutStyles(
        layoutStyle,
        i % 2 === 0 ? layoutObjectUserStyle : layoutStringUserStyle,
      );
    }

    consume(result);
  });

  bench("merge css vars", () => {
    let result: string | undefined;

    for (let i = 0; i < WORK; i += 1) {
      result = mergeCssVar(
        i % 2 === 0 ? cssVarObjectStyle : cssVarStringStyle,
        "--ak-test",
        "1rem",
      );
    }

    consume(result);
  });

  bench("collect jsx elements", () => {
    let count = 0;

    for (let i = 0; i < WORK; i += 1) {
      count = collectJsxElements(jsxTree, (element) => typeof element.type === "string").length;
    }

    consume(count);
  });

  bench("serialize jsx ids", () => {
    let result: string | undefined;

    for (let i = 0; i < WORK; i += 1) {
      result = serializeForId(jsxTree);
    }

    consume(result);
  });
});
