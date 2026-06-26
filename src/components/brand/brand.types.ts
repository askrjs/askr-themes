import type { Ref } from "@askrjs/askr/foundations/utilities";

export type BrandElement = "div" | "a" | "span";

type BrandIntrinsicProps<TElement extends BrandElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;
type SpanProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref">;

export type BrandNativeProps<TElement extends BrandElement = "div"> =
  BrandIntrinsicProps<TElement> & {
    as?: TElement;
    asChild?: false;
    children?: unknown;
    ref?: Ref<HTMLElement>;
  };

export type BrandAsChildProps = {
  asChild: true;
  children: JSX.Element;
  class?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
};

export type BrandProps<TElement extends BrandElement = "div"> =
  | BrandNativeProps<TElement>
  | BrandAsChildProps;

export type BrandMarkProps = SpanProps & {
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};

export type BrandLabelProps = SpanProps & {
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};
