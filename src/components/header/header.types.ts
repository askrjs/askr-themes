import type { BlockElementProps } from "../block";

export type HeaderProps = Omit<BlockElementProps<"header">, "as" | "sticky"> & {
  position?: "sticky" | "static";
  sticky?: boolean;
};
