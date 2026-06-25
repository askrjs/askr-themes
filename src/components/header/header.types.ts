import type { BlockElementProps } from "../block";

export type HeaderProps = Omit<BlockElementProps<"header">, "as" | "sticky"> & {
  sticky?: boolean;
};
