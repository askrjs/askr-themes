import type { JSXElement } from "@askrjs/askr/foundations/structures";

declare global {
  namespace JSX {
    interface Element extends JSXElement {
      readonly __askrThemesJsxElementBrand?: never;
    }

    interface IntrinsicElements {
      // @ts-ignore The Askr source types already provide a compatible fallback index.
      [element: string]: Record<string, unknown>;
    }
  }
}

export {};
