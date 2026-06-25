import { describe, expect, it } from "vite-plus/test";

import { Link } from "@askrjs/askr/router";
import {
  Block,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Sidebar,
} from "../../src/core";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Nav,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../../src/navs";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("navigation contracts", () => {
  it("should renders breadcrumb primitives with stable slots", () => {
    const breadcrumb = asElement(Breadcrumb({ children: "trail" }));
    const list = asElement(BreadcrumbList({ children: "items" }));
    const item = asElement(BreadcrumbItem({ children: "item" }));
    const link = asElement(BreadcrumbLink({ href: "/docs", children: "Docs" }));
    const current = asElement(BreadcrumbCurrent({ children: "Overview" }));
    const separator = asElement(BreadcrumbSeparator({}));

    expect(breadcrumb.type).toBe("nav");
    expect(breadcrumb.props["data-slot"]).toBe("breadcrumb");
    expect(list.type).toBe("ol");
    expect(list.props["data-slot"]).toBe("breadcrumb-list");
    expect(item.type).toBe("li");
    expect(item.props["data-slot"]).toBe("breadcrumb-item");
    expect(link.type).toBe("a");
    expect(link.props["data-slot"]).toBe("breadcrumb-link");
    expect(current.type).toBe("span");
    expect(current.props["aria-current"]).toBe("page");
    expect(separator.type).toBe("span");
    expect(separator.props["data-slot"]).toBe("breadcrumb-separator");
  });

  it("should renders block-first nav primitives with canonical slots", () => {
    const nav = asElement(Nav({ children: "nav" }));
    const navbar = asElement(Navbar({ children: "navbar" }));
    const brand = asElement(NavBrand({ children: "brand" }));
    const brandLink = asElement(NavBrand({ as: "a", href: "/", children: "brand" }));
    const brandRouterLink = asElement(
      NavBrand({ asChild: true, children: Link({ href: "/", children: "brand" }) }),
    );
    const docsItem = NavLink({ href: "/docs", children: "Docs" });
    const responsiveNavbar = asElement(
      Navbar({
        collapseAt: "md",
        children: [brand, docsItem],
      }),
    );
    const responsiveNavbarChildren = responsiveNavbar.props.children as ElementLike[];
    const responsiveNavbarContent = asElement(responsiveNavbarChildren[1]);
    const group = asElement(NavGroup({ title: "Docs", children: "links" }));
    const dropdown = asElement(NavDropdown({ label: "More", children: "items" }));
    const item = asElement(
      NavItem({ href: "https://example.com/docs", active: true, children: "Docs" }),
    );
    const itemWithRouteOnlyProp = asElement(
      NavItem({
        href: "https://example.com/docs",
        match: "exact",
        children: "Docs",
      } as never),
    );
    const link = asElement(NavLink({ href: "/docs/components", children: "Components" }));
    const linkChild = asElement(link.props.children);
    const sidebar = asElement(Sidebar({ children: "sidebar" }));

    expect(nav.type).toBe("nav");
    expect(nav.props["data-slot"]).toBe("nav");
    expect(navbar.type).toBe(Block);
    expect(navbar.props.as).toBe("nav");
    expect(navbar.props["data-slot"]).toBe("navbar");
    expect(responsiveNavbar.props["data-collapse-at"]).toBe("md");
    expect(brand.type).toBe(Block);
    expect(brand.props["data-slot"]).toBe("nav-brand");
    expect(brand.props.shrink).toBe(false);
    expect(brandLink.props.as).toBe("a");
    expect(brandLink.props.href).toBe("/");
    expect(brandRouterLink.props.asChild).toBe(true);
    expect(brandRouterLink.props["data-slot"]).toBe("nav-brand");
    expect(responsiveNavbarChildren[0]).toBe(brand);
    expect(responsiveNavbarContent.props["data-slot"]).toBe("navbar-content");
    expect(responsiveNavbarContent.props.children).toEqual([docsItem]);
    expect(group.type).toBe(Block);
    expect(group.props["data-slot"]).toBe("nav-group");
    expect(dropdown.props.children).toBeTruthy();
    expect(item.type).toBe(Block);
    expect(item.props.as).toBe("a");
    expect(item.props["data-slot"]).toBe("nav-item");
    expect(item.props["data-active"]).toBe("true");
    expect(itemWithRouteOnlyProp.props.match).toBeUndefined();
    expect(link.type).toBe(Block);
    expect(link.props.asChild).toBe(true);
    expect(link.props["data-slot"]).toBe("nav-item");
    expect(linkChild.type).toBe(Link);
    expect(linkChild.props.href).toBe("/docs/components");
    expect(sidebar.type).toBe(Block);
    expect(sidebar.props.as).toBe("aside");
    expect(sidebar.props["data-slot"]).toBe("sidebar");
  });

  it("should renders pagination primitives with stable slots", () => {
    const pagination = asElement(
      Pagination({
        children: PaginationItem({
          children: PaginationLink({ href: "/docs", children: "1" }),
        }),
      }),
    );
    const paginationItem = asElement(
      PaginationItem({ children: "item", active: true, disabled: true }),
    );
    const paginationLink = asElement(
      PaginationLink({ href: "/docs", children: "1", active: true, disabled: true }),
    );
    const ellipsis = asElement(PaginationEllipsis({}));

    expect(pagination.type).toBe("nav");
    expect(pagination.props["data-slot"]).toBe("pagination");
    expect(paginationItem.type).toBe("li");
    expect(paginationItem.props["data-slot"]).toBe("pagination-item");
    expect(paginationLink.type).toBe("a");
    expect(paginationLink.props["data-slot"]).toBe("pagination-link");
    expect(paginationLink.props["data-active"]).toBe("true");
    expect(ellipsis.type).toBe("span");
    expect(ellipsis.props["data-slot"]).toBe("pagination-ellipsis");
  });
});
