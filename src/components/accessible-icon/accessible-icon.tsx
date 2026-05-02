import type { AccessibleIconProps } from "./accessible-icon.types";

export function AccessibleIcon(props: AccessibleIconProps): JSX.Element {
  const { children, label, decorative = label ? false : true } = props;

  return (
    <span
      data-slot="accessible-icon"
      data-decorative={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
    >
      {children}
      {!decorative && label ? <span class="sr-only">{label}</span> : null}
    </span>
  );
}
