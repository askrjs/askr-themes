import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  Box,
  Cluster,
  Container,
  Divider,
  Flex,
  Grid,
  Inline,
  Section,
  Separator,
  SidebarLayout,
  Skeleton,
  Spacer,
  Stack,
  TopbarLayout,
} from "../src/components";

describe("moved visual components", () => {
  it("exposes layout and composition primitives from themes", () => {
    expect(Box({ children: "box", p: "2" })).toBeTruthy();
    expect(Flex({ children: "flex", gap: "2" })).toBeTruthy();
    expect(Inline({ children: "inline", gap: "2" })).toBeTruthy();
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Cluster({ children: "cluster", gap: "2" })).toBeTruthy();
    expect(typeof Grid).toBe("function");
    expect(Container({ children: "container", size: "2" })).toBeTruthy();
    expect(Section({ children: "section", size: "2" })).toBeTruthy();
    expect(Spacer({ basis: "1rem" })).toBeTruthy();
  });

  it("exposes visual display primitives and divider aliases", () => {
    expect(Badge({ children: "new", variant: "secondary" })).toBeTruthy();
    expect(Skeleton({})).toBeTruthy();
    expect(Separator({ orientation: "vertical" })).toBeTruthy();
    expect(Divider({ decorative: true })).toBeTruthy();
  });

  it("keeps layout patterns in themes", () => {
    expect(SidebarLayout({ sidebar: "nav", children: "main" })).toBeTruthy();
    expect(TopbarLayout({ topbar: "header", children: "main" })).toBeTruthy();
  });
});
