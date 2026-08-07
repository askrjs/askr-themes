import { renderToStringSync } from "@askrjs/askr/ssr";
import { describe, expect, it } from "vite-plus/test";

import {
  CommandInput,
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteTrigger,
} from "../../src/components";

describe("CommandPalette server rendering", () => {
  it("should render safely without evaluating browser-only behavior", () => {
    const html = renderToStringSync(() => (
      <CommandPalette defaultOpen>
        <CommandPaletteTrigger>Search docs</CommandPaletteTrigger>
        <CommandPaletteContent
          description="Search every documentation page"
          title="Search documentation"
        >
          <CommandInput aria-label="Search documentation" />
        </CommandPaletteContent>
      </CommandPalette>
    ));

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="true"');
  });
});
