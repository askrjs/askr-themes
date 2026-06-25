import { describe, expect, it } from "vite-plus/test";

import {
  Aside,
  Block,
  Container,
  EmptyState,
  Header,
  Main,
  Navbar,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "../../src/core";
import { Badge, Divider, Separator, Skeleton } from "../../src/surfaces";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("block-first components", () => {
  it("should exposes the stable core surface", () => {
    for (const component of [
      Block,
      Container,
      Header,
      Main,
      Section,
      Aside,
      Sidebar,
      Navbar,
      NavBrand,
      NavDropdown,
      NavGroup,
      NavItem,
      NavLink,
      Page,
      PageHeader,
      Toolbar,
      EmptyState,
    ]) {
      expect(typeof component).toBe("function");
    }
  });

  it("should maps recipe-style Block props to generated layout classes", () => {
    const block = asElement(
      Block({
        as: "main",
        paddingX: "page",
        paddingY: "xl",
        marginX: "auto",
        maxWidth: "page",
        direction: { base: "column", lg: "row" },
        center: true,
        sticky: true,
        top: "0",
        zIndex: "header",
        background: "surface",
        borderBottom: true,
        hide: { base: true, lg: false },
        children: "content",
      }),
    );

    expect(block.type).toBe("main");
    expect(block.props["data-slot"]).toBe("block");
    expect(block.props["data-ak-layout"]).toBe("true");
    expect(block.props.style).toBeUndefined();
    expect(String(block.props.class)).toContain("ak-style-");
  });

  it("should builds semantic wrappers on Block", () => {
    const container = asElement(Container({ children: "container" }));
    const header = asElement(Header({ sticky: true, children: "header" }));
    const main = asElement(Main({ children: "main" }));
    const section = asElement(Section({ children: "section" }));
    const aside = asElement(Aside({ children: "aside" }));
    const sidebar = asElement(Sidebar({ children: "sidebar" }));
    const navbar = asElement(Navbar({ children: "navbar" }));
    const brand = asElement(NavBrand({ children: "brand" }));
    const docsItem = NavLink({ href: "/docs", children: "Docs" });
    const responsiveNavbar = asElement(
      Navbar({ collapseAt: "lg", children: [brand, docsItem] }),
    );
    const responsiveNavbarChildren = responsiveNavbar.props.children as ElementLike[];
    const responsiveNavbarContent = asElement(responsiveNavbarChildren[1]);

    expect(container.type).toBe(Block);
    expect(container.props["data-slot"]).toBe("container");
    expect(container.props.maxWidth).toBe("page");
    expect(header.props.as).toBe("header");
    expect(header.props.sticky).toBe(true);
    expect(main.props.as).toBe("main");
    expect(main.props.grow).toBe(true);
    expect(section.props.as).toBe("section");
    expect(aside.props.as).toBe("aside");
    expect(sidebar.props.as).toBe("aside");
    expect(sidebar.props.width).toBe("sidebar");
    expect(navbar.props.as).toBe("nav");
    expect(navbar.props.direction).toBe("row");
    expect(responsiveNavbar.props["data-collapse-at"]).toBe("lg");
    expect(responsiveNavbarChildren[0]).toBe(brand);
    expect(responsiveNavbarContent.props["data-slot"]).toBe("navbar-content");
    expect(responsiveNavbarContent.props.children).toEqual([docsItem]);
    expect(brand.props["data-slot"]).toBe("nav-brand");
  });

  it("should exposes common composition components without recipe-only layouts", () => {
    expect(Page({ children: "page" })).toBeTruthy();
    expect(PageHeader({ title: "Projects", description: "Manage work.", actions: "actions" })).toBeTruthy();
    expect(Toolbar({ title: "Projects", actions: "actions" })).toBeTruthy();
    expect(EmptyState({ title: "No projects", action: "Create project" })).toBeTruthy();
  });

  it("should keeps visual display primitives and divider aliases", () => {
    expect(Badge({ children: "new", variant: "secondary" })).toBeTruthy();
    expect(Skeleton({})).toBeTruthy();
    expect(Separator({ orientation: "vertical" })).toBeTruthy();
    expect(Divider({ decorative: true })).toBeTruthy();
  });
});
