import type { JSXElement } from "@askrjs/askr/foundations/structures";

declare global {
  namespace JSX {
    interface Element extends JSXElement {
      readonly __askrThemesJsxElementBrand?: never;
    }
  }
}

export {};
