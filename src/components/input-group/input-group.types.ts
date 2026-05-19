import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type InputGroupOrientation = "horizontal" | "vertical";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type SpanProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref">;

export type InputGroupProps = DivProps & {
  children?: unknown;
  attached?: boolean;
  orientation?: InputGroupOrientation;
  ref?: Ref<HTMLDivElement>;
};

export type InputGroupTextProps = SpanProps & {
  asChild?: false;
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};

export type InputGroupTextAsChildProps = SpanProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
