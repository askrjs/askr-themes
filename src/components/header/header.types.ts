import type { BlockElementProps } from "../block";

/** Props for the {@link Header} component. */
export type HeaderProps = Omit<BlockElementProps<"header">, "as" | "sticky"> & {
  position?: "sticky" | "static";
  sticky?: boolean;
};
