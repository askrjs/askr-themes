import "../../../src/themes/default/index.css";

/**
 * Shared scenario behind the `markup` fixture: the default theme stylesheet
 * plus caller-supplied HTML. Theme contracts that assert on computed styles of
 * plain slot markup need nothing more than this.
 */
export default function markup(root: HTMLElement, options: { html: string }): void {
  root.innerHTML = options.html;
}
