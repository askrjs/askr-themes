import { Flex } from '../flex';
import type { ClusterAsChildProps, ClusterDivProps } from './cluster.types';

export function Cluster(props: ClusterDivProps): JSX.Element;
export function Cluster(props: ClusterAsChildProps): JSX.Element;
export function Cluster(props: ClusterDivProps | ClusterAsChildProps) {
  const { children, wrap = 'wrap', ...rest } = props;
  return (
    <Flex
      {...(rest as Record<string, unknown>)}
      data-slot="cluster"
      wrap={wrap}
    >
      {children}
    </Flex>
  );
}
