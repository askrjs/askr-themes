import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Layout direction of an {@link InputGroup}. */
export type InputGroupOrientation = "horizontal" | "vertical";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type SpanProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref">;

/** Props for the {@link InputGroup} component. */
export type InputGroupProps = DivProps & {
  children?: unknown;
  attached?: boolean;
  orientation?: InputGroupOrientation;
  ref?: Ref<HTMLDivElement>;
};

/** Props for {@link InputGroupText} rendered as its default `<span>` element. */
export type InputGroupTextProps = SpanProps & {
  asChild?: false;
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};

/** Props for {@link InputGroupText} rendered with `asChild`, merging its attributes onto a single child element. */
export type InputGroupTextAsChildProps = SpanProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
