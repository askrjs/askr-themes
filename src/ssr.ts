const STYLE_REGISTRY_ATTR = "data-askr-style-registry";
const STYLE_CLASS_PREFIX = "ak-style-";
const HTML_SPACE = /[\t\n\f\r ]/;
const TEXT_ELEMENTS = new Set([
  "script",
  "style",
  "title",
  "textarea",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
]);

type HtmlTag = {
  name: string;
  closing: boolean;
  end: number;
  classValue?: string;
};

type HtmlScan = {
  classes: Set<string>;
  headEnd: number;
  bodyStart: number;
};

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeStyleRawText(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}

function readTag(html: string, start: number): HtmlTag | null {
  let index = start + 1;
  const closing = html[index] === "/";
  if (closing) index += 1;
  const nameStart = index;
  while (index < html.length && !HTML_SPACE.test(html[index]) && !"/>".includes(html[index])) {
    index += 1;
  }
  const name = html.slice(nameStart, index).toLowerCase();
  let classValue: string | undefined;
  let hasClass = false;
  while (index < html.length) {
    while (index < html.length && HTML_SPACE.test(html[index])) index += 1;
    if (html[index] === ">") return { name, closing, end: index + 1, classValue };
    if (html[index] === "/") {
      index += 1;
      continue;
    }
    const attributeStart = index;
    while (index < html.length && !HTML_SPACE.test(html[index]) && !"/=>".includes(html[index])) {
      index += 1;
    }
    const attributeName = html.slice(attributeStart, index).toLowerCase();
    while (index < html.length && HTML_SPACE.test(html[index])) index += 1;
    let value = "";
    if (html[index] === "=") {
      index += 1;
      while (index < html.length && HTML_SPACE.test(html[index])) index += 1;
      const quote = html[index];
      if (quote === '"' || quote === "'") {
        const end = html.indexOf(quote, index + 1);
        if (end < 0) return null;
        value = html.slice(index + 1, end);
        index = end + 1;
      } else {
        const valueStart = index;
        while (index < html.length && !HTML_SPACE.test(html[index]) && html[index] !== ">") {
          index += 1;
        }
        value = html.slice(valueStart, index);
      }
    }
    if (attributeName === "class" && !hasClass) {
      hasClass = true;
      classValue = value;
    }
  }
  return null;
}

function decodeClassValue(value: string): string {
  const basicEntities: Record<string, string> = {
    amp: "&",
    AMP: "&",
    lt: "<",
    LT: "<",
    gt: ">",
    GT: ">",
    quot: '"',
    QUOT: '"',
    apos: "'",
    Tab: "\t",
    NewLine: "\n",
  };
  return value.replace(
    /&#(?:[xX][\da-fA-F]+|\d+);?|&(?:amp|AMP|lt|LT|gt|GT|quot|QUOT|apos|Tab|NewLine);/g,
    (reference) => {
      if (reference[1] !== "#") return basicEntities[reference.slice(1, -1)];
      const number = reference.slice(2).replace(/;$/, "");
      const codePoint = /^[xX]/.test(number)
        ? Number.parseInt(number.slice(1), 16)
        : Number.parseInt(number, 10);
      return codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)
        ? "\ufffd"
        : String.fromCodePoint(codePoint);
    },
  );
}

// Scan serialized markup, without building or repairing an HTML tree. Text
// elements use their appropriate end tag. Foreign namespace parsing, malformed
// comment recovery, legacy double-escaped script states, arbitrary named entities
// and legacy C1 numeric-reference remapping are outside this generated-markup
// contract.
function scanDocumentHtml(html: string): HtmlScan {
  const result: HtmlScan = { classes: new Set(), headEnd: -1, bodyStart: -1 };
  let index = 0;
  while (index < html.length) {
    const start = html.indexOf("<", index);
    if (start < 0) break;
    if (html.startsWith("<!--", start)) {
      const end = html.indexOf("-->", start + 4);
      index = end < 0 ? html.length : end + 3;
      continue;
    }
    if (html[start + 1] === "!" || html[start + 1] === "?") {
      const end = html.indexOf(">", start + 2);
      index = end < 0 ? html.length : end + 1;
      continue;
    }
    const nameStart = start + (html[start + 1] === "/" ? 2 : 1);
    if (!/[a-zA-Z]/.test(html[nameStart] ?? "")) {
      index = start + 1;
      continue;
    }
    const tag = readTag(html, start);
    if (!tag) break;
    index = tag.end;
    if (tag.closing) {
      if (tag.name === "head" && result.headEnd < 0) result.headEnd = start;
      continue;
    }
    if (tag.name === "body" && result.bodyStart < 0) result.bodyStart = start;
    for (const className of decodeClassValue(tag.classValue ?? "").split(/[\t\n\f\r ]+/)) {
      if (className.startsWith(STYLE_CLASS_PREFIX)) result.classes.add(className);
    }
    if (tag.name === "plaintext") break;
    if (TEXT_ELEMENTS.has(tag.name)) {
      const endPattern = new RegExp(`</${tag.name}(?=[\\t\\n\\f\\r />])`, "ig");
      endPattern.lastIndex = index;
      const end = endPattern.exec(html);
      index = end ? end.index : html.length;
    }
  }
  return result;
}

function injectIntoHead(html: string, content: string, scan: HtmlScan): string {
  const { headEnd, bodyStart } = scan;
  if (headEnd >= 0) {
    return `${html.slice(0, headEnd)}${content}${html.slice(headEnd)}`;
  }

  if (bodyStart >= 0) {
    return `${html.slice(0, bodyStart)}<head>${content}</head>${html.slice(bodyStart)}`;
  }

  return `${content}${html}`;
}

/**
 * Wrap an Askr SSR/SSG document renderer so generated theme rules used by the
 * rendered app are available before hydration.
 */
export function withThemeStyles<
  TArgs extends {
    appHtml: string;
    context: {
      cspNonce?: string;
      styles?: readonly { id: string; cssText: string }[];
    };
  },
>(documentRenderer: (args: TArgs) => string): (args: TArgs) => string {
  return (args) => {
    const documentHtml = documentRenderer(args);
    const registeredStyles = args.context.styles;
    const scan = scanDocumentHtml(documentHtml);
    const generatedClasses = scan.classes;
    if (registeredStyles === undefined) {
      if (generatedClasses.size > 0) {
        throw new Error(
          "Generated theme classes require request-local SSR style registrations from @askrjs/askr.",
        );
      }
      return documentHtml;
    }

    const styles = new Map<string, string>();
    for (const style of registeredStyles) {
      if (!style.id || !style.cssText) {
        throw new TypeError("Invalid SSR theme style registration.");
      }
      const existing = styles.get(style.id);
      if (existing !== undefined && existing !== style.cssText) {
        throw new RangeError(`SSR style registration collision for ${JSON.stringify(style.id)}.`);
      }
      styles.set(style.id, style.cssText);
    }
    for (const className of generatedClasses) {
      if (!styles.has(className)) {
        throw new Error(
          `Missing request-local SSR style registration for ${JSON.stringify(className)}.`,
        );
      }
    }
    const rules = Array.from(styles.values());
    if (rules.length === 0) return documentHtml;

    const nonce =
      args.context.cspNonce === undefined
        ? ""
        : ` nonce="${escapeHtmlAttribute(args.context.cspNonce)}"`;
    const registry = `<style ${STYLE_REGISTRY_ATTR}="true"${nonce}>${escapeStyleRawText(rules.join("\n"))}\n</style>`;
    return injectIntoHead(documentHtml, registry, scan);
  };
}
