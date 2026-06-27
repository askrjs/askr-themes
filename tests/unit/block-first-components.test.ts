import { describe, expect, it } from "vite-plus/test";

import {
  Aside,
  Block,
  Brand,
  BrandLabel,
  BrandMark,
  Container,
  EmptyState,
  Footer,
  FooterContent,
  FooterDescription,
  FooterLink,
  FooterLinks,
  FooterSection,
  FooterTitle,
  Grid,
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
  Text,
  Toolbar,
} from "../../src/core";
import { Badge, Separator, Skeleton } from "../../src/surfaces";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

function findElementBySlot(value: unknown, slot: string): ElementLike | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findElementBySlot(child, slot);
      if (found) return found;
    }

    return undefined;
  }

  const element = asElement(value);
  if (!element || typeof element !== "object" || !("props" in element)) return undefined;
  if (element.props?.["data-slot"] === slot) return element;
  return findElementBySlot(element.props?.children, slot);
}

describe("block-first components", () => {
  it("should exposes the stable core surface", () => {
    for (const component of [
      Block,
      Brand,
      BrandLabel,
      BrandMark,
      Container,
      Footer,
      FooterContent,
      FooterDescription,
      FooterLink,
      FooterLinks,
      FooterSection,
      FooterTitle,
      Grid,
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
      Text,
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
    const brandRoot = asElement(
      Brand({ children: [BrandMark({ children: "D" }), BrandLabel({ children: "Destroyer" })] }),
    );
    const grid = asElement(Grid({ columns: { base: 1, lg: 3 }, gap: "lg", children: "grid" }));
    const footer = asElement(Footer({ children: "footer" }));
    const footerContent = asElement(FooterContent({ children: "content" }));
    const footerSection = asElement(FooterSection({ children: "section" }));
    const footerTitle = asElement(FooterTitle({ children: "Title" }));
    const footerDescription = asElement(FooterDescription({ children: "Description" }));
    const footerLinks = asElement(FooterLinks({ children: "links" }));
    const footerLink = asElement(FooterLink({ href: "#docs", children: "Docs" }));
    const header = asElement(Header({ sticky: true, children: "header" }));
    const main = asElement(Main({ children: "main" }));
    const section = asElement(Section({ children: "section" }));
    const aside = asElement(Aside({ children: "aside" }));
    const sidebar = asElement(Sidebar({ children: "sidebar" }));
    const navbar = asElement(Navbar({ children: "navbar" }));
    const brand = asElement(NavBrand({ children: "brand" }));
    const docsItem = NavLink({ href: "/docs", children: "Docs" });
    const responsiveNavbar = asElement(Navbar({ collapseAt: "lg", children: [brand, docsItem] }));
    const responsiveNavbarChildren = responsiveNavbar.props.children as ElementLike[];
    const responsiveNavbarContent = findElementBySlot(responsiveNavbarChildren, "navbar-content");

    expect(container.type).toBe(Block);
    expect(container.props["data-slot"]).toBe("container");
    expect(container.props.maxWidth).toBe("page");
    expect(brandRoot.props["data-slot"]).toBe("brand");
    expect(asElement((brandRoot.props.children as ElementLike[])[0]).props["data-slot"]).toBe(
      "brand-mark",
    );
    expect(asElement((brandRoot.props.children as ElementLike[])[1]).props["data-slot"]).toBe(
      "brand-label",
    );
    expect(grid.type).toBe("div");
    expect(grid.props["data-slot"]).toBe("grid");
    expect(String(grid.props.class)).toContain("ak-style-");
    expect(footer.props.as).toBe("footer");
    expect(footer.props["data-slot"]).toBe("footer");
    expect(footer.props.background).toBe("muted");
    expect(footer.props.borderTop).toBe(true);
    expect(footerContent.props["data-slot"]).toBe("footer-content");
    expect(footerSection.props["data-slot"]).toBe("footer-section");
    expect(footerTitle.type).toBe("h2");
    expect(footerTitle.props["data-slot"]).toBe("footer-title");
    expect(footerDescription.type).toBe("p");
    expect(footerDescription.props["data-slot"]).toBe("footer-description");
    expect(footerLinks.type).toBe("nav");
    expect(footerLinks.props["data-slot"]).toBe("footer-links");
    expect(footerLink.type).toBe("a");
    expect(footerLink.props["data-slot"]).toBe("footer-link");
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
    expect(findElementBySlot(responsiveNavbarChildren, "navbar-collapse")).toBeTruthy();
    expect(responsiveNavbarContent?.props["data-slot"]).toBe("navbar-content");
    expect(responsiveNavbarContent?.props.children).toEqual([docsItem]);
    expect(brand.props["data-slot"]).toBe("nav-brand");
  });

  it("should exposes common composition components without recipe-only layouts", () => {
    expect(Page({ children: "page" })).toBeTruthy();
    expect(
      PageHeader({ title: "Projects", description: "Manage work.", actions: "actions" }),
    ).toBeTruthy();
    expect(Toolbar({ title: "Projects", actions: "actions" })).toBeTruthy();
    expect(EmptyState({ title: "No projects", action: "Create project" })).toBeTruthy();
    expect(Text({ tone: "muted", size: "sm", children: "Copy" })).toBeTruthy();
  });

  it("should keeps visual display primitives with one separator name", () => {
    expect(Badge({ children: "new", variant: "secondary" })).toBeTruthy();
    expect(Skeleton({})).toBeTruthy();
    expect(Separator({ orientation: "vertical" })).toBeTruthy();
  });
});
