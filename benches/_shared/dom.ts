import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest } from "@askrjs/askr/router";
import { vi } from "vite-plus/test";

export type MountedScenario = {
  container: HTMLDivElement;
  cleanup: () => void;
};

export function createBenchRoot(): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

export function cleanupBenchRoot(container: HTMLDivElement): void {
  cleanupApp(container);
  container.remove();
}

export async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export function stubViewport(width: number): {
  set(width: number): void;
  restore(): void;
} {
  const spy = vi.spyOn(window, "innerWidth", "get");
  spy.mockReturnValue(width);

  return {
    set(nextWidth: number) {
      spy.mockReturnValue(nextWidth);
    },
    restore() {
      spy.mockRestore();
    },
  };
}

export async function mountScenario(
  pathname: string,
  registerRoutes: () => void,
): Promise<MountedScenario> {
  clearRoutes();
  window.history.replaceState({}, "", pathname);
  registerRoutes();

  const container = createBenchRoot();
  await createSPA({ root: container, manifest: getManifest() });
  await settle();

  return {
    container,
    cleanup: () => cleanupBenchRoot(container),
  };
}
