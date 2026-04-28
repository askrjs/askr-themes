import { jsx as createSvgNode, jsxs as createSvgNodes } from "@askrjs/askr/jsx-runtime";
import type { IconSizeToken, LogoNode, LogoProps, LogoStyleObject } from "./types";

const ICON_SIZE_TOKENS: readonly IconSizeToken[] = ["sm", "md", "lg", "xl"];

function isIconSizeToken(value: unknown): value is IconSizeToken {
  return (
    typeof value === "string" &&
    ICON_SIZE_TOKENS.includes(value as IconSizeToken)
  );
}

function normalizeIconSizeValue(size: number | string): string {
  if (typeof size === "number") return `${size}px`;
  return size;
}

function resolveIconSizeVariable(size: number | string): string {
  if (isIconSizeToken(size)) {
    return `var(--ak-icon-size-${size}, var(--ak-icon-size-md, 1.25rem))`;
  }

  return normalizeIconSizeValue(size);
}

function camelToKebab(key: string): string {
  return key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
}

function serializeLogoStyle(style: string | LogoStyleObject | undefined): string {
  if (!style) return "";
  if (typeof style === "string") return style.trim();

  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${camelToKebab(key)}:${String(value)}`)
    .join(";");
}

function joinLogoStyle(...styles: Array<string | undefined>): string | undefined {
  const merged = styles.map((style) => style?.trim()).filter(Boolean);
  return merged.length > 0 ? merged.join(";") : undefined;
}

function getLogoContractProps({
  size = 20,
  title,
  style,
  iconName,
}: Pick<LogoProps, "iconName" | "size" | "style" | "title">) {
  const sizeToken = isIconSizeToken(size) ? size : undefined;
  const decorative = title ? undefined : "true";
  const resolvedSize = resolveIconSizeVariable(size);
  const logoStyle = joinLogoStyle(
    `--ak-icon-size:${resolvedSize}`,
    "display:inline-block",
    "flex-shrink:0",
    "width:var(--ak-icon-size)",
    "height:var(--ak-icon-size)",
    serializeLogoStyle(style),
  );

  return {
    attrs: {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      role: "img",
      "aria-hidden": title ? undefined : "true",
      style: logoStyle,
      "data-slot": "icon",
      "data-icon": iconName,
      "data-size": sizeToken,
      "data-decorative": decorative,
    },
  };
}

export function createLogo(
  displayName: string,
  viewBox: string,
  logoNode: LogoNode,
) {
  function Logo({
    size = 20,
    title,
    class: className,
    style,
    ref,
    ...rest
  }: LogoProps) {
    const { attrs } = getLogoContractProps({
      size,
      title,
      style,
      iconName: displayName,
    });

    const children = logoNode.map(([tag, nodeAttrs], index) =>
      createSvgNode(tag, nodeAttrs as Record<string, unknown>, index),
    );

    return createSvgNodes("svg", {
      ...rest,
      ...attrs,
      viewBox,
      fill: "none",
      stroke: "none",
      class: className,
      ref,
      children: title
        ? [createSvgNode("title", { children: title }), ...children]
        : children,
    });
  }

  Logo.displayName = displayName;
  return Logo;
}
