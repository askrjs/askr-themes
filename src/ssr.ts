import { styleRulesForHtml } from "./components/_internal/style";

const STYLE_REGISTRY_ATTR = "data-askr-style-registry";

type DocumentRenderArgsLike = {
  appHtml: string;
  context: {
    cspNonce?: string;
    styles?: readonly { id: string; cssText: string }[];
  };
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

function findHeadEnd(html: string): number {
  let index = 0;
  while (index < html.length) {
    if (html.startsWith("<!--", index)) {
      const commentEnd = html.indexOf("-->", index + 4);
      index = commentEnd < 0 ? html.length : commentEnd + 3;
      continue;
    }

    const rawTextStart = html.slice(index).match(/^<\s*(script|style|title|textarea)(?:\s|>)/i);
    if (rawTextStart) {
      const rawTextEndPattern = new RegExp(`</\\s*${rawTextStart[1]}\\s*>`, "ig");
      rawTextEndPattern.lastIndex = index + rawTextStart[0].length;
      const rawTextEnd = rawTextEndPattern.exec(html);
      if (!rawTextEnd) return -1;
      index = rawTextEnd.index + rawTextEnd[0].length;
      continue;
    }

    const headEnd = html.slice(index).match(/^<\/\s*head\s*>/i);
    if (headEnd) return index;
    index += 1;
  }
  return -1;
}

function injectIntoHead(html: string, content: string): string {
  const headEnd = findHeadEnd(html);
  if (headEnd >= 0) {
    return `${html.slice(0, headEnd)}${content}${html.slice(headEnd)}`;
  }

  const bodyStart = html.search(/<body(?:\s[^>]*)?>/i);
  if (bodyStart >= 0) {
    return `${html.slice(0, bodyStart)}<head>${content}</head>${html.slice(bodyStart)}`;
  }

  return `${content}${html}`;
}

/**
 * Wrap an Askr SSR/SSG document renderer so generated theme rules used by the
 * rendered app are available before hydration.
 */
export function withThemeStyles<TArgs extends DocumentRenderArgsLike>(
  documentRenderer: (args: TArgs) => string,
): (args: TArgs) => string {
  return (args) => {
    const documentHtml = documentRenderer(args);
    const registeredStyles = args.context.styles;
    const rules = registeredStyles
      ? (() => {
          const styles = new Map<string, string>();
          for (const style of registeredStyles) {
            if (!style.id || !style.cssText) {
              throw new TypeError("Invalid SSR theme style registration.");
            }
            const existing = styles.get(style.id);
            if (existing !== undefined && existing !== style.cssText) {
              throw new RangeError(
                `SSR style registration collision for ${JSON.stringify(style.id)}.`,
              );
            }
            styles.set(style.id, style.cssText);
          }
          return Array.from(styles.values());
        })()
      : styleRulesForHtml(args.appHtml);
    if (rules.length === 0) return documentHtml;

    const nonce =
      args.context.cspNonce === undefined
        ? ""
        : ` nonce="${escapeHtmlAttribute(args.context.cspNonce)}"`;
    const registry = `<style ${STYLE_REGISTRY_ATTR}="true"${nonce}>${escapeStyleRawText(rules.join("\n"))}\n</style>`;
    return injectIntoHead(documentHtml, registry);
  };
}
