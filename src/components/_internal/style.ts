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

type StyleRule = {
  className: string;
  declarations: string;
  rule: string;
};

const styleRulesByClass = new Map<string, StyleRule>();
type StyleRegistry = {
  element: HTMLStyleElement;
  ruleCount: number;
  rules: Map<string, StyleRule>;
};
const registries = new WeakMap<Document, Map<string, StyleRegistry>>();
const MAX_STYLE_RULES = 512;

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
  const existing = styleRulesByClass.get(className);
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
  styleRulesByClass.set(className, entry);
  return entry;
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

  const styleElement =
    Array.from(document.querySelectorAll<HTMLStyleElement>(`style[${STYLE_REGISTRY_ATTR}]`)).find(
      (element) => (element.nonce || undefined) === nonce,
    ) ?? document.createElement("style");
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
  return declarations.trim().replace(/;+\s*$/, "");
}

export function styleDeclarationsToClass(declarations: string | undefined): string | undefined {
  if (typeof declarations !== "string") return undefined;

  const normalized = normalizeDeclarations(declarations);
  if (!normalized) return undefined;

  const entry = styleRuleFor(normalized);
  const nonce = cspNonce();
  const registry = ensureStyleRegistry(nonce);
  const registered = registry?.rules.get(normalized);
  if (registered) return registered.className;

  if (registry) {
    registry.rules.set(normalized, entry);
    if (!registry.element.textContent?.includes(entry.rule)) {
      if (registry.ruleCount >= MAX_STYLE_RULES)
        throw new RangeError("Theme style registry capacity exceeded.");
      registry.element.append(entry.rule, "\n");
      registry.ruleCount += 1;
    }
  }

  return entry.className;
}

export function styleRulesForHtml(html: string): string[] {
  const rules = new Map<string, string>();
  const classAttributePattern = /\sclass=(?:"([^"]*)"|'([^']*)')/g;

  for (const attribute of html.matchAll(classAttributePattern)) {
    const value = attribute[1] ?? attribute[2] ?? "";
    for (const className of value.split(/\s+/)) {
      const entry = styleRulesByClass.get(className);
      if (entry) rules.set(className, entry.rule);
    }
  }

  if (rules.size > MAX_STYLE_RULES) {
    throw new RangeError("Theme style registry capacity exceeded.");
  }

  return Array.from(rules.values());
}
