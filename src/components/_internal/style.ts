import { cspNonce } from "@askrjs/askr";

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
type StyleRegistry = {
  element: HTMLStyleElement;
  rules: Map<string, { className: string; rule: string }>;
};
const registries = new WeakMap<Document, Map<string, StyleRegistry>>();
const MAX_STYLE_RULES = 512;

let nextStyleClassId = 0;

function ensureStyleRegistry(nonce: string | undefined): StyleRegistry | null {
  if (typeof document === "undefined") return null;
  const key = nonce ?? "";
  let documentRegistries = registries.get(document);
  if (!documentRegistries) {
    documentRegistries = new Map();
    registries.set(document, documentRegistries);
  }
  const current = documentRegistries.get(key);
  if (current?.element.isConnected) return current;

  const styleElement = document.createElement("style");
  styleElement.setAttribute(STYLE_REGISTRY_ATTR, "true");
  if (nonce !== undefined) styleElement.nonce = nonce;
  (document.head ?? document.documentElement).append(styleElement);
  const registry: StyleRegistry = { element: styleElement, rules: new Map() };
  documentRegistries.set(key, registry);
  return registry;
}

function normalizeDeclarations(declarations: string): string {
  return declarations.trim().replace(/;+\s*$/, "");
}

export function styleDeclarationsToClass(declarations: string | undefined): string | undefined {
  if (typeof declarations !== "string") return undefined;

  const normalized = normalizeDeclarations(declarations);
  if (!normalized) return undefined;

  const nonce = cspNonce();
  const registry = ensureStyleRegistry(nonce);
  const registered = registry?.rules.get(normalized);
  if (registered) return registered.className;

  let className = styleClassCache.get(normalized);
  if (className === undefined) {
    className = `${STYLE_CLASS_PREFIX}${++nextStyleClassId}`;
    if (styleClassCache.size >= MAX_STYLE_RULES) {
      const oldest = styleClassCache.keys().next().value as string | undefined;
      if (oldest !== undefined) styleClassCache.delete(oldest);
    }
    styleClassCache.set(normalized, className);
  }

  if (registry) {
    const styleElement = registry.element;
    if (styleElement) {
      if (registry.rules.size >= MAX_STYLE_RULES)
        throw new RangeError("Theme style registry capacity exceeded.");
      const rule = `.${className}{${normalized}}`;
      registry.rules.set(normalized, { className, rule });
      styleElement.textContent = Array.from(registry.rules.values(), (entry) => entry.rule).join(
        "\n",
      );
    }
  }

  return className;
}
