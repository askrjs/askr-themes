import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Visual tone of an {@link AlertProps} alert; `"danger"`/`"warning"` render with `role="alert"`. */
export type AlertVariant = "default" | "info" | "success" | "warning" | "danger";
/** Heading tag allowed for an alert's title via `titleAs`. */
export type AlertHeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

/** Props for the {@link Alert} component. */
export type AlertProps = DivProps & {
  actions?: unknown;
  children?: unknown;
  description?: unknown;
  dismissLabel?: string;
  icon?: unknown;
  onDismiss?: () => void;
  title?: unknown;
  titleAs?: AlertHeadingTag;
  variant?: AlertVariant;
  ref?: Ref<HTMLDivElement>;
};
