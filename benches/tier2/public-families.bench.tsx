import { bench, describe } from "vite-plus/test";

import {
  buildControlsFixture,
  buildCoreFixture,
  buildNavsFixture,
  buildStatusSurfaceFixture,
  buildSurfacesFixture,
} from "../_shared/fixtures";
import { consume } from "../_shared/sink";
import { Block } from "../../src/core";

const BATCH = 64;

function renderBatch(builder: () => JSX.Element): void {
  for (let i = 0; i < BATCH; i += 1) {
    consume(builder());
  }
}

describe("tier2 public family render benches", () => {
  bench("trivial Block render", () => {
    for (let i = 0; i < BATCH; i += 1) consume(Block({ children: "Content" }));
  });

  bench("responsive Block render", () => {
    for (let i = 0; i < BATCH; i += 1) {
      consume(
        Block({
          direction: { base: "column", lg: "row" },
          gap: { base: "sm", lg: "xl" },
          padding: { base: "sm", lg: "lg" },
          width: "full",
          children: "Content",
        }),
      );
    }
  });

  bench("controls family render", () => {
    renderBatch(buildControlsFixture);
  });

  bench("status surface render", () => {
    renderBatch(buildStatusSurfaceFixture);
  });

  bench("surfaces family render", () => {
    renderBatch(buildSurfacesFixture);
  });

  bench("core family render", () => {
    renderBatch(buildCoreFixture);
  });

  bench("navs family render", () => {
    renderBatch(buildNavsFixture);
  });
});
