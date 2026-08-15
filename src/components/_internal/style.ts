import * as Askr from "@askrjs/askr";

const cssPropertyNameCache = new Map<string, string>();
const MAX_PROPERTY_CACHE = 256;

const CSS_UNSAFE_RE = /[{}<>\\]/;
const CSS_COMMENT_DELIMITER_RE = /\/\*|\*\//;
const CSS_URI_SCHEME_RE = /(?:^|[\s(,])([a-z][a-z0-9+.-]*):/i;
const CSS_FUNCTION_NAME_RE = /([a-z-][a-z0-9-]*)\s*\(/gi;
const CSS_ALLOWED_FUNCTIONS = new Set([
  "var",
  "calc",
  "min",
  "max",
  "clamp",
  "minmax",
  "repeat",
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
  "color-mix",
  "translate",
  "translatex",
  "translatey",
  "translatez",
  "scale",
  "scalex",
  "scaley",
  "scalez",
  "rotate",
  "rotatex",
  "rotatey",
  "rotatez",
  "skew",
  "skewx",
  "skewy",
  "matrix",
  "matrix3d",
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeating-conic-gradient",
  "cubic-bezier",
  "steps",
]);

function isSafeCssPropertyName(name: string): boolean {
  if (name.startsWith("--")) return /^--[a-zA-Z0-9_-]+$/.test(name);
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name);
}

function isSafeCssValue(value: string): boolean {
  if (
    CSS_UNSAFE_RE.test(value) ||
    CSS_COMMENT_DELIMITER_RE.test(value) ||
    CSS_URI_SCHEME_RE.test(value)
  ) {
    return false;
  }

  for (const match of value.matchAll(CSS_FUNCTION_NAME_RE)) {
    if (!CSS_ALLOWED_FUNCTIONS.has(match[1]!.toLowerCase())) return false;
  }

  return true;
}

function splitCssDeclarations(value: string): string[] {
  const declarations: string[] = [];
  let start = 0;
  let depth = 0;
  let quote: string | undefined;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = undefined;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")" && depth > 0) depth -= 1;
    if (char === ";" && depth === 0) {
      declarations.push(value.slice(start, index));
      start = index + 1;
    }
  }

  declarations.push(value.slice(start));
  return declarations;
}

function serializeCssString(value: string): string {
  const entries: Array<[string, string]> = [];
  for (const candidate of splitCssDeclarations(value)) {
    const separator = candidate.indexOf(":");
    if (separator <= 0) continue;
    const key = candidate.slice(0, separator).trim();
    const cssValue = candidate.slice(separator + 1).trim();
    if (key && cssValue) entries.push([key, cssValue]);
  }
  return serializeCssDeclarations(Object.fromEntries(entries));
}

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

  if (cssPropertyNameCache.size < MAX_PROPERTY_CACHE) {
    cssPropertyNameCache.set(name, result);
  }
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

    const rawProperty = key.trim();
    if (!isSafeCssPropertyName(rawProperty)) {
      continue;
    }
    const property = cssPropertyName(rawProperty).trim();
    const cssValue = String(value).trim();
    if (!cssValue || !isSafeCssValue(cssValue)) {
      continue;
    }

    const declaration = `${property}:${cssValue}`;
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
const MAX_STYLE_RULES = 512;
const MAX_COLLISION_CACHE = 4096;

type StyleRule = {
  className: string;
  declarations: string;
  rule: string;
};

const styleCollisionCache = new Map<string, StyleRule>();
type StyleRegistry = {
  element: HTMLStyleElement;
  ruleCount: number;
  rules: Map<string, StyleRule>;
};
const registries = new WeakMap<Document, Map<string, StyleRegistry>>();
function countRegisteredRules(value: string | null): number {
  return value?.match(/\.ak-style-[a-z0-9]+\{/g)?.length ?? 0;
}

function styleClassName(declarations: string): string {
  let first = 0xdeadbeef ^ declarations.length;
  let second = 0x41c6ce57 ^ declarations.length;

  for (let index = 0; index < declarations.length; index += 1) {
    const code = declarations.charCodeAt(index);
    first = Math.imul(first ^ code, 2_654_435_761);
    second = Math.imul(second ^ code, 1_597_334_677);
  }

  first =
    Math.imul(first ^ (first >>> 16), 2_246_822_507) ^
    Math.imul(second ^ (second >>> 13), 3_266_489_909);
  second =
    Math.imul(second ^ (second >>> 16), 2_246_822_507) ^
    Math.imul(first ^ (first >>> 13), 3_266_489_909);

  return `${STYLE_CLASS_PREFIX}${(second >>> 0).toString(36)}${(first >>> 0).toString(36)}`;
}

function escapeStyleRawText(value: string): string {
  return value.replace(/<\//g, "<\\/");
}

function styleRuleFor(declarations: string): StyleRule {
  const className = styleClassName(declarations);
  const existing = styleCollisionCache.get(className);
  if (existing) {
    if (existing.declarations !== declarations) {
      throw new RangeError("Theme style class collision detected.");
    }
    return existing;
  }

  const entry = {
    className,
    declarations,
    rule: `.${className}{${escapeStyleRawText(declarations)}}`,
  };
  return entry;
}

function rememberStyleRule(entry: StyleRule): void {
  styleCollisionCache.delete(entry.className);
  styleCollisionCache.set(entry.className, entry);
  while (styleCollisionCache.size > MAX_COLLISION_CACHE) {
    const oldest = styleCollisionCache.keys().next().value;
    if (oldest === undefined) break;
    styleCollisionCache.delete(oldest);
  }
}

function registerSSRStyle(entry: StyleRule): void {
  const register = (
    Askr as typeof Askr & {
      registerSSRStyle?: (id: string, cssText: string) => void;
    }
  ).registerSSRStyle;
  register?.(entry.className, entry.rule);
}

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

  const existingStyleElements = Array.from(
    document.querySelectorAll<HTMLStyleElement>(`style[${STYLE_REGISTRY_ATTR}]`),
  );
  const styleElement =
    existingStyleElements.find((element) => (element.nonce || undefined) === nonce) ??
    (nonce === undefined && existingStyleElements.length === 1
      ? existingStyleElements[0]
      : undefined) ??
    document.createElement("style");
  if (!styleElement.isConnected) {
    styleElement.setAttribute(STYLE_REGISTRY_ATTR, "true");
    if (nonce !== undefined) styleElement.nonce = nonce;
    (document.head ?? document.documentElement).append(styleElement);
  }
  const registry: StyleRegistry = {
    element: styleElement,
    ruleCount: countRegisteredRules(styleElement.textContent),
    rules: new Map(),
  };
  documentRegistries.set(key, registry);
  return registry;
}

function normalizeDeclarations(declarations: string): string {
  return serializeCssString(declarations);
}

export function styleDeclarationsToClass(declarations: string | undefined): string | undefined {
  if (typeof declarations !== "string") return undefined;

  const normalized = normalizeDeclarations(declarations);
  if (!normalized) return undefined;

  const entry = styleRuleFor(normalized);
  const nonce = Askr.cspNonce();
  const registry = ensureStyleRegistry(nonce);
  const registered = registry?.rules.get(normalized);
  if (registered) {
    registerSSRStyle(registered);
    return registered.className;
  }

  if (registry) {
    if (!registry.rules.has(normalized) && !registry.element.textContent?.includes(entry.rule)) {
      if (registry.ruleCount >= MAX_STYLE_RULES) {
        throw new RangeError("Theme style registry capacity exceeded.");
      }
    }
    if (!registry.element.textContent?.includes(entry.rule)) {
      registry.element.append(entry.rule, "\n");
      registry.ruleCount += 1;
    }
    registry.rules.set(normalized, entry);
  }

  rememberStyleRule(entry);
  registerSSRStyle(entry);

  return entry.className;
}
