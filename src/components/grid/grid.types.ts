import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { BlockSpace, ResponsiveValue } from "../_internal/block-layout";

export type GridElement = "div" | "section" | "ul";
export type GridColumns = number | string;
export type GridAlign = "start" | "center" | "end" | "stretch";

type GridIntrinsicProps<TElement extends GridElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;

export type GridProps<TElement extends GridElement = "div"> =
  GridIntrinsicProps<TElement> & {
    as?: TElement;
    columns?: ResponsiveValue<GridColumns>;
    gap?: ResponsiveValue<BlockSpace>;
    align?: ResponsiveValue<GridAlign>;
    children?: unknown;
    ref?: Ref<HTMLElement>;
  };
