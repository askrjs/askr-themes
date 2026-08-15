import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Element tags {@link Brand} can render as via its `as` prop. */
export type BrandElement = "div" | "a" | "span";

type BrandIntrinsicProps<TElement extends BrandElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;
type SpanProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref">;

/** {@link Brand} props for its native (non-`asChild`) rendering, specialized for a given {@link BrandElement} `TElement`. */
export type BrandNativeProps<TElement extends BrandElement = "div"> =
  BrandIntrinsicProps<TElement> & {
    as?: TElement;
    asChild?: false;
    children?: unknown;
    ref?: Ref<HTMLElement>;
  };

/** Props for {@link Brand} rendered with `asChild`, merging its attributes onto a single child element. */
export type BrandAsChildProps = {
  asChild: true;
  children: JSX.Element;
  class?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
};

/** Union of all prop shapes accepted by {@link Brand}. */
export type BrandProps<TElement extends BrandElement = "div"> =
  | BrandNativeProps<TElement>
  | BrandAsChildProps;

/** Props for the {@link BrandMark} component. */
export type BrandMarkProps = SpanProps & {
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};

/** Props for the {@link BrandLabel} component. */
export type BrandLabelProps = SpanProps & {
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};
