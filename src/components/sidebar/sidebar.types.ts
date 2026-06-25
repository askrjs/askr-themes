import type { BlockElementProps } from "../block";

export type SidebarProps = Omit<BlockElementProps<"aside">, "as" | "width" | "shrink"> & {
  width?: BlockElementProps<"aside">["width"];
  shrink?: BlockElementProps<"aside">["shrink"];
};
