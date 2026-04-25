import type { FlexAsChildProps, FlexOwnProps, FlexProps } from '../flex';

export type ClusterOwnProps = FlexOwnProps;
export type ClusterDivProps = Extract<FlexProps, { asChild?: false }>;
export type ClusterAsChildProps = FlexAsChildProps;
export type ClusterProps = ClusterDivProps | ClusterAsChildProps;
