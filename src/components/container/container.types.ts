import type { BlockDivProps, BlockSize } from "../block";

export type ContainerProps = Omit<BlockDivProps, "maxWidth"> & {
  size?: BlockSize;
};
