import type { HydrationGeometry } from "./scenarios/generated-style-ssr";

import { expect, test } from "./fixtures";

test.describe("generated theme style geometry", () => {
  test("should keep a centered max-width Container stable through hydration", async ({
    render,
    run,
  }) => {
    await render();
    const geometry = await run<HydrationGeometry>("geometry");

    expect(Math.round(geometry.beforeWidth)).toBe(1152);
    expect(Math.round(geometry.beforeX - geometry.rootBeforeX)).toBe(124);
    expect(geometry.afterWidth).toBeCloseTo(geometry.beforeWidth, 3);
    expect(geometry.afterX).toBeCloseTo(geometry.beforeX, 3);
    expect(geometry.shiftTotal).toBe(0);
    // The original counted the registry elements; the scenario can only hand
    // back a number, so the length assertion becomes the equivalent equality.
    expect(geometry.registryCount).toBe(1);
  });

  for (const detached of [false, true]) {
    test(`should retain generated geometry for a large ${detached ? "detached" : "connected"} subtree`, async ({
      render,
      run,
    }) => {
      await render("pendingGeneratedStyles", { detached });
      const result = await run<{
        count: number;
        availableBeforeConnection: number;
        incorrectWidths: number[];
      }>("measure");
      expect(result.count).toBe(520);
      expect(result.availableBeforeConnection).toBe(520);
      expect(result.incorrectWidths).toEqual([]);
      await run("dispose");
    });
  }

  test("should publish accepted generated geometry and preserve discarded proposals and caller refs", async ({
    render,
    run,
  }) => {
    await render("committedGeneratedStyles");
    const discarded = await run<{
      rejected: boolean;
      markupUnchanged: boolean;
      cssUnchanged: boolean;
      notifications: Record<string, Array<number | null>>;
    }>("rejectProposal");
    expect(discarded.rejected).toBe(true);
    expect(discarded.markupUnchanged).toBe(true);
    expect(discarded.cssUnchanged).toBe(true);
    for (const events of Object.values(discarded.notifications)) expect(events).toEqual([250]);
    const accepted = await run<{
      widths: number[];
      notifications: Record<string, Array<number | null>>;
    }>("acceptProposal");
    expect(accepted.widths).toEqual([260, 260, 260, 260]);
    for (const events of Object.values(accepted.notifications)) expect(events).toEqual([250]);
    const disposed = await run<Record<string, Array<number | null>>>("dispose");
    for (const events of Object.values(disposed)) expect(events).toEqual([250, null]);
  });
});
