import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block, type BlockProps, type BlockResponsiveValue, type BlockSpace } from "../block";

type WithoutOwnedLayout<TProps, TKey extends PropertyKey> = TProps extends unknown
  ? Omit<TProps, TKey>
  : never;

type StackSpace = BlockSpace | "none" | "1" | "2" | "3" | "4" | "5" | "6" | "8";
type StackWrap = boolean | "wrap" | "nowrap";

export type StackProps = WithoutOwnedLayout<
  BlockProps,
  "direction" | "rowFrom" | "gap" | "padding" | "wrap"
> & {
  direction?: never;
  gap?: BlockResponsiveValue<StackSpace>;
  p?: BlockResponsiveValue<StackSpace>;
  padding?: BlockResponsiveValue<StackSpace>;
  rowFrom?: never;
  wrap?: BlockResponsiveValue<StackWrap>;
};
export type ClusterProps = WithoutOwnedLayout<BlockProps, "direction" | "rowFrom" | "wrap"> & {
  direction?: never;
  rowFrom?: never;
  wrap?: never;
};
export type CenterProps = WithoutOwnedLayout<BlockProps, "align" | "justify"> & {
  align?: never;
  justify?: never;
};

const renderBlock = Block as (props: Record<string, unknown>) => JSX.Element;

function withSlot(props: object, slot: string): Record<string, unknown> {
  const values = props as Record<string, unknown>;
  return { ...values, "data-slot": values["data-slot"] ?? slot };
}

function normalizeResponsiveValue<
  TInput extends string | boolean,
  TOutput extends string | boolean,
>(
  value: BlockResponsiveValue<TInput> | undefined,
  normalize: (value: TInput) => TOutput,
): BlockResponsiveValue<TOutput> | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "object") return normalize(value);
  return Object.fromEntries(
    Object.entries(value).map(([breakpoint, entry]) => [breakpoint, normalize(entry as TInput)]),
  ) as BlockResponsiveValue<TOutput>;
}

function normalizeStackSpace(value: StackSpace): BlockSpace {
  if (value === "none") return "0";
  if (value === "1" || value === "2") return "xs";
  if (value === "3") return "sm";
  if (value === "4") return "md";
  if (value === "5") return "lg";
  if (value === "6") return "xl";
  if (value === "8") return "2xl";
  return value;
}

function normalizeStackWrap(value: StackWrap): boolean {
  if (value === "wrap") return true;
  if (value === "nowrap") return false;
  return value;
}

/** Vertical content flow with responsive, token-backed spacing. */
export function Stack(props: StackProps): JSX.Element {
  const { gap, p, padding, wrap, ...rest } = props;
  return renderBlock({
    ...withSlot(rest, "stack"),
    direction: "column",
    gap: normalizeResponsiveValue(gap, normalizeStackSpace),
    padding: normalizeResponsiveValue(padding ?? p, normalizeStackSpace),
    wrap: normalizeResponsiveValue(wrap, normalizeStackWrap),
  });
}

/** Wrapping horizontal content flow for actions, tags, and compact controls. */
export function Cluster(props: ClusterProps): JSX.Element {
  return renderBlock({ ...withSlot(props, "cluster"), direction: "row", wrap: true });
}

/** Centers content on both axes within the supplied Block dimensions. */
export function Center(props: CenterProps): JSX.Element {
  return renderBlock({ ...withSlot(props, "center"), align: "center", justify: "center" });
}
