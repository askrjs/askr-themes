import type { BlockDivProps, BlockSize } from "../block";

/** Props for the {@link Container} component. */
export type ContainerProps = Omit<BlockDivProps, "maxWidth"> & {
  size?: BlockSize;
};
