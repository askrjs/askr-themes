import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type {
  BlockAlign,
  BlockBackground,
  BlockDirection,
  BlockJustify,
  BlockLayoutProps,
  BlockMargin,
  BlockRadius,
  BlockShadow,
  BlockSize,
  BlockSpace,
  BlockZIndex,
  ResponsiveValue,
} from "../_internal/block-layout";

export type {
  BlockAlign,
  BlockBackground,
  BlockDirection,
  BlockJustify,
  BlockMargin,
  BlockRadius,
  BlockShadow,
  BlockSize,
  BlockSpace,
  BlockZIndex,
  ResponsiveValue as BlockResponsiveValue,
};

export type BlockElement =
  | "div"
  | "span"
  | "main"
  | "header"
  | "footer"
  | "section"
  | "aside"
  | "nav"
  | "a"
  | "ul"
  | "ol"
  | "li"
  | "form"
  | "article";

export type BlockOwnProps = BlockLayoutProps & {
  as?: BlockElement;
  children?: unknown;
  className?: string;
};

export type BlockElementProps<TElement extends BlockElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
> &
  BlockOwnProps & {
    as?: TElement;
    asChild?: false;
    ref?: Ref<unknown>;
  };

export type BlockNativeProps = {
  [TElement in BlockElement]: BlockElementProps<TElement>;
}[BlockElement];

export type BlockAsChildProps = Omit<BlockOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BlockDivProps = BlockElementProps<"div">;
export type BlockSpanProps = BlockElementProps<"span">;
export type BlockProps = BlockNativeProps | BlockAsChildProps;
