import type { Ref } from "@askrjs/askr/foundations/utilities";

export type AlertVariant = "default" | "info" | "success" | "warning" | "danger";
export type AlertHeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

export type AlertProps = DivProps & {
  actions?: unknown;
  children?: unknown;
  description?: unknown;
  dismissLabel?: string;
  dismissible?: boolean;
  icon?: unknown;
  onDismiss?: () => void;
  title?: unknown;
  titleAs?: AlertHeadingTag;
  variant?: AlertVariant;
  ref?: Ref<HTMLDivElement>;
};
