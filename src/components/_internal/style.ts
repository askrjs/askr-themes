const cssPropertyNameCache = new Map<string, string>();

function cssPropertyName(name: string): string {
  let cached = cssPropertyNameCache.get(name);
  if (cached !== undefined) {
    return cached;
  }

  let result = "";

  for (let index = 0; index < name.length; index += 1) {
    const code = name.charCodeAt(index);

    if (code >= 65 && code <= 90) {
      result += `-${String.fromCharCode(code + 32)}`;
    } else {
      result += name[index];
    }
  }

  cssPropertyNameCache.set(name, result);
  return result;
}

export function serializeCssDeclarations(styles: Record<string, unknown>): string {
  const keys = Object.keys(styles);
  let result = "";

  for (const key of keys) {
    const value = styles[key];
    if (value === undefined || value === null) {
      continue;
    }

    const declaration = `${cssPropertyName(key)}:${String(value)}`;
    result = result ? `${result};${declaration}` : declaration;
  }

  return result;
}

export function mergeCssVar(style: unknown, name: string, value: string): string {
  const decl = `${name}:${value}`;

  if (typeof style === "string") {
    const trimmed = style.trim();
    return trimmed ? `${trimmed};${decl}` : decl;
  }

  if (style && typeof style === "object") {
    const entries = serializeCssDeclarations(style as Record<string, unknown>);
    return entries ? `${entries};${decl}` : decl;
  }

  return decl;
}

const STYLE_REGISTRY_ATTR = "data-askr-style-registry";
const STYLE_CLASS_PREFIX = "ak-style-";

const styleClassCache = new Map<string, string>();
const registeredDeclarations = new Set<string>();

let nextStyleClassId = 0;

function ensureStyleElement(): HTMLStyleElement | null {
  if (typeof document === "undefined") return null;

  const existing = document.querySelector(`style[${STYLE_REGISTRY_ATTR}]`);
  if (existing instanceof HTMLStyleElement) {
    return existing;
  }

  const styleElement = document.createElement("style");
  styleElement.setAttribute(STYLE_REGISTRY_ATTR, "true");
  (document.head ?? document.documentElement).append(styleElement);

  return styleElement;
}

function normalizeDeclarations(declarations: string): string {
  return declarations.trim().replace(/;+\s*$/, "");
}

export function styleDeclarationsToClass(declarations: string | undefined): string | undefined {
  if (typeof declarations !== "string") return undefined;

  const normalized = normalizeDeclarations(declarations);
  if (!normalized) return undefined;

  let className = styleClassCache.get(normalized);
  if (className === undefined) {
    className = `${STYLE_CLASS_PREFIX}${++nextStyleClassId}`;
    styleClassCache.set(normalized, className);
  }

  if (!registeredDeclarations.has(normalized)) {
    const styleElement = ensureStyleElement();
    if (styleElement) {
      const rule = `.${className}{${normalized}}`;
      styleElement.textContent = `${styleElement.textContent ?? ""}\n${rule}`;
      registeredDeclarations.add(normalized);
    }
  }

  return className;
}
