import { createSPA } from "@askrjs/askr/boot";

import { NavLink, Navbar } from "../../../src/core";
import { createTestRegistry, resetTestRoutes, settle, testGroup, testRoute } from "./_spa";

function DocsLayout({ children }: { children?: unknown }) {
  return (
    <>
      <Navbar aria-label="Docs">
        <NavLink href="/docs" match="exact">
          Overview
        </NavLink>
        <NavLink href="/docs/about">About</NavLink>
      </Navbar>
      <div id="page">{children}</div>
    </>
  );
}

/** A two-route docs group sharing one persistent layout, started at `/docs`. */
export default async function persistentLayout(root: HTMLElement): Promise<void> {
  resetTestRoutes();
  testGroup({ layout: DocsLayout }, () => {
    testRoute("/docs", () => "Docs home");
    testRoute("/docs/about", () => "Docs about");
  });

  window.history.replaceState({}, "", "/docs");
  await createSPA({ root, registry: createTestRegistry() });
  await settle();
}
