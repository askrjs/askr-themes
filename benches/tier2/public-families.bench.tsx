import { bench, describe } from "vite-plus/test";

import {
  buildControlsFixture,
  buildFeedbackFixture,
  buildLayoutsFixture,
  buildNavsFixture,
  buildSurfacesFixture,
} from "../_shared/fixtures";
import { consume } from "../_shared/sink";

const BATCH = 64;

function renderBatch(builder: () => JSX.Element): void {
  for (let i = 0; i < BATCH; i += 1) {
    consume(builder());
  }
}

describe("tier2 public family render benches", () => {
  bench("controls family render", () => {
    renderBatch(buildControlsFixture);
  });

  bench("feedback family render", () => {
    renderBatch(buildFeedbackFixture);
  });

  bench("surfaces family render", () => {
    renderBatch(buildSurfacesFixture);
  });

  bench("layouts family render", () => {
    renderBatch(buildLayoutsFixture);
  });

  bench("navs family render", () => {
    renderBatch(buildNavsFixture);
  });
});
