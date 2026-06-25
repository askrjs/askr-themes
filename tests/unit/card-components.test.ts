import { describe, expect, it } from "vite-plus/test";

import { Card } from "../../src/components/card";
import { Card as DefaultCard } from "../../src/surfaces";

describe("theme card components", () => {
  it("should expose a theme-agnostic card root", () => {
    expect(typeof Card).toBe("function");
    expect(Card({ children: "body", variant: "raised" })).toBeTruthy();
  });

  it("should expose a card root component", () => {
    expect(typeof DefaultCard).toBe("function");
    expect(DefaultCard({ children: "body", variant: "raised" })).toBeTruthy();
  });
});
