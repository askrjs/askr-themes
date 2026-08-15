import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { BlockSpace, ResponsiveValue } from "../_internal/block-layout";

/** Element tags {@link Grid} can render as via its `as` prop. */
export type GridElement = "div" | "section" | "ul";
/** Column definition for {@link Grid}: a track count or a raw `grid-template-columns` string. */
export type GridColumns = number | string;
/** `align-items` value applied to a {@link Grid}. */
export type GridAlign = "start" | "center" | "end" | "stretch";

type GridIntrinsicProps<TElement extends GridElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;

/** Props for the {@link Grid} component, specialized for a given {@link GridElement} `TElement`. */
export type GridProps<TElement extends GridElement = "div"> = GridIntrinsicProps<TElement> & {
  as?: TElement;
  columns?: ResponsiveValue<GridColumns>;
  gap?: ResponsiveValue<BlockSpace>;
  align?: ResponsiveValue<GridAlign>;
  children?: unknown;
  ref?: Ref<HTMLElement>;
};
