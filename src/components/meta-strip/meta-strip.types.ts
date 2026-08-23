import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type MetaStripDensity = "inline" | "stacked";

export type MetaStripItem = {
  label: string;
  value: string | number;
  caption?: string;
  font?: "body" | "mono";
  numeric?: "normal" | "tabular";
};

export type MetaStripProps = Omit<JSX.IntrinsicElements["dl"], "children" | "ref"> & {
  items: readonly MetaStripItem[];
  density?: MetaStripDensity;
  ref?: Ref<HTMLDListElement>;
};
