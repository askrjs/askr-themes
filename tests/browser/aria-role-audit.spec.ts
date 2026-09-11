import type { AuditViolation } from "./scenarios/aria-role-audit";

import { expect, test } from "./fixtures";

test.describe("ARIA and role audit", () => {
  test("should not emit incomplete interactive ARIA patterns from styling-only components", async ({
    render,
    run,
  }) => {
    await render();

    expect(await run<AuditViolation[]>("audit")).toEqual([]);
  });
});
