import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type BlockSize = "xs" | "sm" | "md" | "lg" | "xl";

export type BlockSpace =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export type BlockAlign = "start" | "end" | "center" | "stretch" | "baseline";

export type BlockJustify = "start" | "end" | "center" | "between";

export type BlockOwnProps = {
  gap?: BlockSpace;
  gapX?: BlockSpace;
  gapY?: BlockSpace;
  align?: BlockAlign;
  justify?: BlockJustify;
  size?: BlockSize;
  as?: "div" | "span";
  children?: unknown;
};

export type BlockNativeProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  BlockOwnProps & {
    as?: "div";
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type BlockSpanProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref"> &
  BlockOwnProps & {
    as: "span";
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type BlockAsChildProps = Omit<BlockOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BlockDivProps = BlockNativeProps;
export type BlockProps = BlockDivProps | BlockSpanProps | BlockAsChildProps;
