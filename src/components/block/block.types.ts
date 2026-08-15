import type { JSX } from "@askrjs/askr/jsx-runtime";
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
  BlockRowFrom,
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
  BlockRowFrom,
  BlockShadow,
  BlockSize,
  BlockSpace,
  BlockZIndex,
  ResponsiveValue as BlockResponsiveValue,
};

/** Element tags {@link Block} can render as via its `as` prop. */
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

/** Layout and structural props accepted by {@link Block}, independent of the rendered element. */
export type BlockOwnProps = BlockLayoutProps & {
  as?: BlockElement;
  children?: unknown;
  className?: string;
};

/** {@link Block} props specialized for a given {@link BlockElement} tag `TElement`. */
export type BlockElementProps<TElement extends BlockElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
> &
  BlockOwnProps & {
    as?: TElement;
    asChild?: false;
    ref?: Ref<unknown>;
  };

/** Union of {@link BlockElementProps} across every {@link BlockElement}, used for {@link Block}'s native (non-`asChild`) overload. */
export type BlockNativeProps = {
  [TElement in BlockElement]: BlockElementProps<TElement>;
}[BlockElement];

/** Props for {@link Block} rendered with `asChild`, merging layout onto a single child element. */
export type BlockAsChildProps = Omit<BlockOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

/** {@link Block} props specialized for a `<div>` element. */
export type BlockDivProps = BlockElementProps<"div">;
/** {@link Block} props specialized for a `<span>` element. */
export type BlockSpanProps = BlockElementProps<"span">;
/** Union of all prop shapes accepted by {@link Block}. */
export type BlockProps = BlockNativeProps | BlockAsChildProps;
