import { CopyButton } from "../../../src/controls";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/**
 * Boots the copy button on `/copy`. `resetAfter` is left to the component's own
 * default when the spec omits it, which is what the failure case asserts under.
 */
export default async function copyButton(
  root: HTMLElement,
  options: { resetAfter?: number } | null,
): Promise<void> {
  const resetAfter = options?.resetAfter;
  await mountRoute(root, "/copy", () =>
    resetAfter === undefined ? (
      <CopyButton text="resource-123" label="Copy resource ID" />
    ) : (
      <CopyButton text="resource-123" label="Copy resource ID" resetAfter={resetAfter} />
    ),
  );
}
