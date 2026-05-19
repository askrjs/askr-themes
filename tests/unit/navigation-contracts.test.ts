import { describe, expect, it } from "vite-plus/test";

import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Nav,
  NavBrand,
  NavGroup,
  NavItem,
  NavLink,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  SidebarPanel,
} from "../../src/navs";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("navigation contracts", () => {
  it("renders breadcrumb primitives with stable slots", () => {
    const breadcrumb = asElement(Breadcrumb({ children: "trail" }));
    const list = asElement(BreadcrumbList({ children: "items" }));
    const item = asElement(BreadcrumbItem({ children: "item" }));
    const link = asElement(BreadcrumbLink({ href: "/docs", children: "Docs" }));
    const current = asElement(BreadcrumbCurrent({ children: "Overview" }));
    const separator = asElement(BreadcrumbSeparator({}));

    expect(breadcrumb.type).toBe("nav");
    expect(breadcrumb.props["data-slot"]).toBe("breadcrumb");
    expect(breadcrumb.props["data-breadcrumb"]).toBe("true");
    expect(breadcrumb.props["aria-label"]).toBe("Breadcrumb");
    expect(list.type).toBe("ol");
    expect(list.props["data-slot"]).toBe("breadcrumb-list");
    expect(item.type).toBe("li");
    expect(item.props["data-slot"]).toBe("breadcrumb-item");
    expect(link.type).toBe("a");
    expect(link.props["data-slot"]).toBe("breadcrumb-link");
    expect(current.type).toBe("span");
    expect(current.props["aria-current"]).toBe("page");
    expect(current.props["data-slot"]).toBe("breadcrumb-current");
    expect(separator.type).toBe("span");
    expect(separator.props["data-slot"]).toBe("breadcrumb-separator");
    expect(separator.props.children).toBe("/");
  });

  it("renders nav and pagination primitives with canonical slot contracts", () => {
    const nav = asElement(Nav({ children: "nav" }));
    const brand = asElement(NavBrand({ children: "brand" }));
    const group = asElement(NavGroup({ label: "Docs", children: "links" }));
    const item = asElement(NavItem({ href: "/docs", children: "Docs" }));
    const link = asElement(NavLink({ href: "/docs/components", children: "Components" }));
    const sidebarPanel = asElement(SidebarPanel({ children: "panel" }));
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

    expect(nav.type).toBe("nav");
    expect(nav.props["data-slot"]).toBe("nav");
    expect(brand.type).toBe("div");
    expect(brand.props["data-slot"]).toBe("navbar-brand");
    expect(group.type).toBe("div");
    expect(group.props["data-slot"]).toBe("navbar-group");
    expect(group.props["data-has-label"]).toBe("true");
    expect(group.props.role).toBe("group");
    expect(item.type).toBe("a");
    expect(item.props["data-slot"]).toBe("nav-item");
    expect(link.type).toBe("a");
    expect(link.props["data-slot"]).toBe("nav-link");
    expect(link.props.href).toBe("/docs/components");
    expect(sidebarPanel.type).toBe("div");
    expect(sidebarPanel.props["data-slot"]).toBe("sidebar-panel");
    expect(sidebarPanel.props["data-state"]).toBe("open");
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

  it("renders sidebar panels from explicit props without requiring responsive context", () => {
    const sidebarPanel = asElement(
      SidebarPanel({
        active: true,
        brand: "brand",
        children: "panel",
        collapseLabel: "Docs navigation",
        onClose: () => undefined,
        open: true,
        panelId: "docs-sidebar-panel",
      }),
    );

    expect(sidebarPanel.type).toBe("div");
    expect(sidebarPanel.props["data-slot"]).toBe("sidebar-panel");
    expect(sidebarPanel.props.role).toBe("dialog");
    expect(sidebarPanel.props["aria-label"]).toBe("Docs navigation");
  });
});
