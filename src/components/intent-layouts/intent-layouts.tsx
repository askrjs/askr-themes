import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block, type BlockProps } from "../block";

type WithoutOwnedLayout<TProps, TKey extends PropertyKey> = TProps extends unknown
  ? Omit<TProps, TKey>
  : never;

export type StackProps = WithoutOwnedLayout<BlockProps, "direction" | "rowFrom"> & {
  direction?: never;
  rowFrom?: never;
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

/** Vertical content flow with responsive, token-backed spacing. */
export function Stack(props: StackProps): JSX.Element {
  return renderBlock({ ...withSlot(props, "stack"), direction: "column" });
}

/** Wrapping horizontal content flow for actions, tags, and compact controls. */
export function Cluster(props: ClusterProps): JSX.Element {
  return renderBlock({ ...withSlot(props, "cluster"), direction: "row", wrap: true });
}

/** Centers content on both axes within the supplied Block dimensions. */
export function Center(props: CenterProps): JSX.Element {
  return renderBlock({ ...withSlot(props, "center"), align: "center", justify: "center" });
}
