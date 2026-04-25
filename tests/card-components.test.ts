import { describe, expect, it } from "vite-plus/test";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/card";
import {
  Card as DefaultCard,
  CardContent as DefaultCardContent,
  CardHeader as DefaultCardHeader,
} from "../src/components";

describe("theme card components", () => {
  it("should expose theme-agnostic card components", () => {
    expect(typeof Card).toBe("function");
    expect(Card({ children: "body", variant: "raised" })).toBeTruthy();
  });

  it("should expose a card root component", () => {
    expect(typeof DefaultCard).toBe("function");
    expect(DefaultCard({ children: "body", variant: "raised" })).toBeTruthy();
  });

  it("should expose card section components", () => {
    expect(CardHeader({ children: "header" })).toBeTruthy();
    expect(CardTitle({ children: "title" })).toBeTruthy();
    expect(CardDescription({ children: "description" })).toBeTruthy();
    expect(CardContent({ children: "content" })).toBeTruthy();
    expect(CardFooter({ children: "footer" })).toBeTruthy();
  });

  it("should expose default themed card entry components", () => {
    expect(DefaultCardHeader({ children: "header" })).toBeTruthy();
    expect(DefaultCardContent({ children: "content" })).toBeTruthy();
  });
});
