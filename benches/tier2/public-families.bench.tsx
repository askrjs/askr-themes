import type { JSX } from "@askrjs/askr/jsx-runtime";
import { test, describe } from "vite-plus/test";

import {
  buildControlsFixture,
  buildCoreFixture,
  buildNavsFixture,
  buildStatusSurfaceFixture,
  buildSurfacesFixture,
} from "../_shared/fixtures";
import { consume } from "../_shared/sink";
import { Block, Center, Cluster, Stack } from "../../src/core";

const BATCH = 64;

function renderBatch(builder: () => JSX.Element): void {
  for (let i = 0; i < BATCH; i += 1) {
    consume(builder());
  }
}

describe("tier2 public family render benches", () => {
  test("trivial Block render", async ({ bench }) => {
    await bench("trivial Block render", () => {
      for (let i = 0; i < BATCH; i += 1) consume(Block({ children: "Content" }));
    }).run();
  });

  test("responsive Block render", async ({ bench }) => {
    await bench("responsive Block render", () => {
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
    }).run();
  });

  test("intent layouts over Block resolver", async ({ bench }) => {
    await bench("intent layouts over Block resolver", () => {
      for (let i = 0; i < BATCH; i += 1) {
        consume(Stack({ gap: "sm", children: "Flow" }));
        consume(Cluster({ gap: "xs", children: "Actions" }));
        consume(Center({ minHeight: "sm", children: "Loading" }));
      }
    }).run();
  });

  test("controls family render", async ({ bench }) => {
    await bench("controls family render", () => {
      renderBatch(buildControlsFixture);
    }).run();
  });

  test("status surface render", async ({ bench }) => {
    await bench("status surface render", () => {
      renderBatch(buildStatusSurfaceFixture);
    }).run();
  });

  test("surfaces family render", async ({ bench }) => {
    await bench("surfaces family render", () => {
      renderBatch(buildSurfacesFixture);
    }).run();
  });

  test("core family render", async ({ bench }) => {
    await bench("core family render", () => {
      renderBatch(buildCoreFixture);
    }).run();
  });

  test("navs family render", async ({ bench }) => {
    await bench("navs family render", () => {
      renderBatch(buildNavsFixture);
    }).run();
  });
});
