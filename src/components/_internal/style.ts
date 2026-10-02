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
  leases: Map<string, number>;
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

function evictUnusedStyleRule(registry: StyleRegistry): boolean {
  const doc = registry.element.ownerDocument;
  for (const [declarations, entry] of registry.rules) {
    if (registry.leases.has(declarations)) continue;
    if (doc.querySelector(`.${entry.className}`)) continue;

    const cssText = registry.element.textContent ?? "";
    const index = cssText.indexOf(entry.rule);
    if (index >= 0) {
      const end = index + entry.rule.length;
      const suffix = cssText[end] === "\n" ? end + 1 : end;
      registry.element.textContent = cssText.slice(0, index) + cssText.slice(suffix);
      registry.ruleCount = countRegisteredRules(registry.element.textContent);
    }
    registry.rules.delete(declarations);
    return true;
  }
  return false;
}

function registerSSRStyle(entry: StyleRule): void {
  const register = (
    Askr as typeof Askr & {
      registerSSRStyle?: (id: string, cssText: string) => void;
    }
  ).registerSSRStyle;
  register?.(entry.className, entry.rule);
}

function ensureStyleRegistry(
  nonce: string | undefined,
  doc: Document | undefined = typeof document === "undefined" ? undefined : document,
): StyleRegistry | null {
  if (!doc) return null;
  const key = nonce ?? "";
  let documentRegistries = registries.get(doc);
  if (!documentRegistries) {
    documentRegistries = new Map();
    registries.set(doc, documentRegistries);
  }
  const current = documentRegistries.get(key);
  if (current?.element.isConnected) return current;

  const existingStyleElements = Array.from(
    doc.querySelectorAll<HTMLStyleElement>(`style[${STYLE_REGISTRY_ATTR}]`),
  );
  const styleElement =
    existingStyleElements.find((element) => (element.nonce || undefined) === nonce) ??
    (nonce === undefined && existingStyleElements.length === 1
      ? existingStyleElements[0]
      : undefined) ??
    doc.createElement("style");
  if (!styleElement.isConnected) {
    styleElement.setAttribute(STYLE_REGISTRY_ATTR, "true");
    if (nonce !== undefined) styleElement.nonce = nonce;
    (doc.head ?? doc.documentElement).append(styleElement);
  }
  const registry: StyleRegistry = {
    element: styleElement,
    ruleCount: countRegisteredRules(styleElement.textContent),
    rules: new Map(),
    leases: new Map(),
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
  publishStyleRule(entry, registry);
  registerSSRStyle(entry);
  return entry.className;
}

function publishStyleRule(entry: StyleRule, registry: StyleRegistry | null): void {
  const normalized = entry.declarations;
  const registered = registry?.rules.get(normalized);
  if (registry && registered) {
    registry.rules.delete(normalized);
    registry.rules.set(normalized, registered);
    return;
  }

  if (registry) {
    if (!registry.rules.has(normalized) && !registry.element.textContent?.includes(entry.rule)) {
      // Keep rules still used by mounted elements; a later insertion can reclaim stale ones.
      if (registry.ruleCount >= MAX_STYLE_RULES) evictUnusedStyleRule(registry);
    }
    if (!registry.element.textContent?.includes(entry.rule)) {
      registry.element.append(entry.rule, "\n");
      registry.ruleCount += 1;
    }
    registry.rules.set(normalized, entry);
  }

  rememberStyleRule(entry);
}

type GeneratedStyleAttachment = {
  node: Element | null;
  root: Node | null;
  ref: unknown;
  registry: StyleRegistry | null;
  rule: StyleRule | undefined;
  pendingDetach: number;
  owner: AbortSignal | null;
  binding: object | null;
};
const generatedStyleAttachments = new WeakMap<
  Element,
  Map<AbortSignal, GeneratedStyleAttachment>
>();
const generatedStyleOwners = new WeakMap<AbortSignal, Set<GeneratedStyleAttachment>>();

function setGeneratedStyleRef(ref: unknown, node: Element | null): void {
  if (typeof ref === "function") {
    (ref as (node: Element | null) => void)(node);
  } else if (ref && typeof ref === "object") {
    try {
      (ref as { current: Element | null }).current = node;
    } catch {
      // Like native refs, read-only object refs are ignored.
    }
  }
}

function releaseGeneratedStyle(attachment: GeneratedStyleAttachment): void {
  const { registry, rule } = attachment;
  attachment.registry = null;
  attachment.rule = undefined;
  if (!registry || !rule) return;
  const count = registry.leases.get(rule.declarations) ?? 0;
  if (count > 1) registry.leases.set(rule.declarations, count - 1);
  else registry.leases.delete(rule.declarations);
}

function releaseGeneratedStyleAttachment(attachment: GeneratedStyleAttachment): void {
  const ref = attachment.ref;
  const hadNode = attachment.node !== null;
  if (attachment.node && attachment.owner) {
    const bindings = generatedStyleAttachments.get(attachment.node);
    if (bindings?.get(attachment.owner) === attachment) {
      bindings.delete(attachment.owner);
      if (bindings.size === 0) generatedStyleAttachments.delete(attachment.node);
    }
  }
  if (attachment.owner) generatedStyleOwners.get(attachment.owner)?.delete(attachment);
  attachment.owner = null;
  attachment.binding = null;
  attachment.node = null;
  attachment.root = null;
  attachment.ref = undefined;
  attachment.pendingDetach += 1;
  releaseGeneratedStyle(attachment);
  if (hadNode) setGeneratedStyleRef(ref, null);
}

function retainGeneratedStyleOwner(
  attachment: GeneratedStyleAttachment,
  signal: AbortSignal,
): void {
  if (attachment.owner === signal) return;
  if (attachment.owner) generatedStyleOwners.get(attachment.owner)?.delete(attachment);
  let owned = generatedStyleOwners.get(signal);
  if (!owned) {
    owned = new Set();
    generatedStyleOwners.set(signal, owned);
    const attachments = owned;
    signal.addEventListener(
      "abort",
      () => {
        for (const current of Array.from(attachments)) releaseGeneratedStyleAttachment(current);
      },
      { once: true },
    );
  }
  attachment.owner = signal;
  owned.add(attachment);
}

/** Prepare component styles now; publish and retain them only from a committed ref. */
export function generatedStyleBinding(
  declarations: string | undefined,
  ref: unknown,
): { className: string | undefined; ref: unknown } {
  let signal: AbortSignal;
  try {
    signal = Askr.getSignal();
  } catch {
    // Direct component construction also supports callers without a render owner.
    return { className: styleDeclarationsToClass(declarations), ref };
  }

  const normalized = typeof declarations === "string" ? normalizeDeclarations(declarations) : "";
  const rule = normalized ? styleRuleFor(normalized) : undefined;
  const nonce = Askr.cspNonce();
  // The runtime ignores registrations outside SSR; an available document does
  // not turn a request-local render into browser stylesheet publication.
  if (rule) registerSSRStyle(rule);
  // Direct component calls inside a parent render must remain hook-free.
  // Attachment state is adopted only for native elements that actually commit.
  const binding = {};
  let committedAttachment: GeneratedStyleAttachment | undefined;
  const commitRef = (node: Element | null) => {
    if (!node) {
      const attachment = committedAttachment;
      if (!attachment?.node || attachment.binding !== binding) return;
      if (signal.aborted || attachment.node.getRootNode() !== attachment.root) {
        releaseGeneratedStyleAttachment(attachment);
      } else {
        // Replacing the private render callback leaves an unchanged caller ref
        // attached. A missing replacement still releases the old attachment.
        const pendingDetach = ++attachment.pendingDetach;
        queueMicrotask(() => {
          if (attachment.pendingDetach === pendingDetach)
            releaseGeneratedStyleAttachment(attachment);
        });
      }
      return;
    }

    if (signal.aborted) return;
    let bindings = generatedStyleAttachments.get(node);
    if (!bindings) {
      bindings = new Map();
      generatedStyleAttachments.set(node, bindings);
    }
    // asChild can compose several component owners onto the same native node.
    const attachment = bindings.get(signal) ?? {
      node: null,
      root: null,
      ref: undefined,
      registry: null,
      rule: undefined,
      pendingDetach: 0,
      owner: null,
      binding: null,
    };
    bindings.set(signal, attachment);
    committedAttachment = attachment;
    retainGeneratedStyleOwner(attachment, signal);
    attachment.binding = binding;
    attachment.pendingDetach += 1;
    const bindingChanged = attachment.node !== node || attachment.ref !== ref;
    const registry = rule ? ensureStyleRegistry(nonce, node.ownerDocument) : null;
    if (attachment.registry !== registry || attachment.rule?.declarations !== rule?.declarations) {
      if (registry && rule) {
        registry.leases.set(rule.declarations, (registry.leases.get(rule.declarations) ?? 0) + 1);
        try {
          publishStyleRule(rule, registry);
        } catch (error) {
          const count = registry.leases.get(rule.declarations)!;
          if (count > 1) registry.leases.set(rule.declarations, count - 1);
          else registry.leases.delete(rule.declarations);
          throw error;
        }
      }
      releaseGeneratedStyle(attachment);
      attachment.registry = registry;
      attachment.rule = rule;
    }
    if (bindingChanged) {
      const previousRef = attachment.ref;
      const hadNode = attachment.node !== null;
      attachment.node = node;
      attachment.ref = ref;
      attachment.root = node.getRootNode();
      if (hadNode) setGeneratedStyleRef(previousRef, null);
      setGeneratedStyleRef(ref, node);
    }
    attachment.root = node.getRootNode();
  };

  return { className: rule?.className, ref: commitRef };
}
