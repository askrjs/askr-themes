import { createIsland } from "@askrjs/askr/boot";

import { CardTitle } from "../../../src/components/card";

export default function headingLevels(root: HTMLElement): void {
  createIsland({
    root,
    component: () => (
      <main>
        <CardTitle>Default</CardTitle>
        <CardTitle titleAs="h1" class="page-title">
          Page
        </CardTitle>
        <CardTitle titleAs="h6">Nested</CardTitle>
      </main>
    ),
  });
}
