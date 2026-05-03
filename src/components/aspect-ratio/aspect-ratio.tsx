import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import type { AspectRatioAsChildProps, AspectRatioProps } from "./aspect-ratio.types";

function serializeStyle(base: Record<string, string | number>, user: unknown): string {
  const merged: Record<string, unknown> = { ...base };

  if (user && typeof user === "object") {
    Object.assign(merged, user as Record<string, unknown>);
  }

  if (typeof user === "string" && user.trim()) {
    return `${Object.entries(merged)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => key.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + String(value))
      .join(";")};${user.trim()}`;
  }

  return Object.entries(merged)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => key.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + String(value))
    .join(";");
}

export function AspectRatio(props: AspectRatioProps): JSX.Element;
export function AspectRatio(props: AspectRatioAsChildProps): JSX.Element;
export function AspectRatio(props: AspectRatioProps | AspectRatioAsChildProps) {
  const { asChild, children, ratio = 1, ref, style, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    "data-slot": "aspect-ratio",
    style: serializeStyle(
      {
        display: "block",
        width: "100%",
        aspectRatio: String(ratio),
        overflow: "hidden",
      },
      style,
    ),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
