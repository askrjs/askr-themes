import { createSPA } from "@askrjs/askr/boot";
import type { RouteHandler } from "@askrjs/askr/router";

import { createTestRegistry, resetTestRoutes, testRoute } from "../../router-test-utils";

/**
 * Browser-side helpers shared by the component scenarios. They exist so a
 * scenario module stays a component tree plus one mount call, with the router
 * bookkeeping that every askr-themes browser test repeats kept in one place.
 */

/** Lets pending microtasks, timers, and one animation frame flush. */
export async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

/** Boots a single-route SPA at `path` and settles the first render. */
export async function mountRoute(
  root: HTMLElement,
  path: string,
  handler: RouteHandler,
): Promise<void> {
  resetTestRoutes();
  testRoute(path, handler);
  window.history.replaceState({}, "", path);
  await createSPA({ root, registry: createTestRegistry() });
  await settle();
}

/**
 * Boots an SPA over several routes. `routes` maps pathname to handler; the
 * first entry (or `start`, when given) is the initial location.
 */
export async function mountRoutes(
  root: HTMLElement,
  routes: Record<string, RouteHandler>,
  start?: string,
): Promise<void> {
  resetTestRoutes();
  for (const [path, handler] of Object.entries(routes)) testRoute(path, handler);
  window.history.replaceState({}, "", start ?? Object.keys(routes)[0]!);
  await createSPA({ root, registry: createTestRegistry() });
  await settle();
}

export { createTestRegistry, resetTestRoutes, testGroup, testRoute } from "../../router-test-utils";
