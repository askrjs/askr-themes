import { styleRulesForHtml } from "./components/_internal/style";

const STYLE_REGISTRY_ATTR = "data-askr-style-registry";

type DocumentRenderArgsLike = {
  appHtml: string;
  context: {
    cspNonce?: string;
  };
};

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectIntoHead(html: string, content: string): string {
  const headEnd = html.search(/<\/head\s*>/i);
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
    const rules = styleRulesForHtml(args.appHtml);
    if (rules.length === 0) return documentHtml;

    const nonce =
      args.context.cspNonce === undefined
        ? ""
        : ` nonce="${escapeHtmlAttribute(args.context.cspNonce)}"`;
    const registry = `<style ${STYLE_REGISTRY_ATTR}="true"${nonce}>${rules.join("\n")}\n</style>`;
    return injectIntoHead(documentHtml, registry);
  };
}
