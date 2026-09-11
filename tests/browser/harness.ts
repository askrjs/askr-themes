/// <reference types="vite/client" />
import { cleanupApp } from "@askrjs/askr/boot";

/**
 * Browser-side half of the native Playwright browser suite.
 *
 * Playwright specs run in Node and cannot hand JSX to the page, so every
 * component tree lives in a sibling scenario module under `scenarios/`. The
 * harness resolves those modules lazily — only the scenario a test asks for is
 * ever evaluated, so a scenario's CSS imports never leak into unrelated tests.
 *
 * A scenario is a function `(root, options) => controls | void`. The returned
 * `controls` record exposes any browser-side closure (a state setter, an event
 * log, a deferred promise) to the spec through `run(name, ...args)`.
 */
export type ScenarioControls = Record<string, (...args: never[]) => unknown>;
export type Scenario<Options = never> = (
  root: HTMLElement,
  options: Options,
) => ScenarioControls | void | Promise<ScenarioControls | void>;

type ScenarioModule = Record<string, Scenario<never>>;

const loaders = import.meta.glob<ScenarioModule>("./scenarios/*.tsx");

let root: HTMLElement | undefined;
let controls: ScenarioControls = {};

function teardown(): void {
  if (!root) return;
  cleanupApp(root);
  root.remove();
  root = undefined;
  controls = {};
}

async function mount(file: string, name: string, options: unknown): Promise<null> {
  teardown();

  const loader = loaders[`./scenarios/${file}.tsx`];
  if (!loader) {
    throw new Error(
      `No scenario module for "${file}". Expected tests/browser/scenarios/${file}.tsx (available: ${Object.keys(loaders).join(", ")})`,
    );
  }

  const module = await loader();
  const scenario = module[name];
  if (typeof scenario !== "function") {
    throw new Error(
      `Scenario module "${file}" has no exported scenario "${name}" (available: ${Object.keys(module).join(", ")})`,
    );
  }

  root = document.createElement("div");
  root.id = "mount-root";
  document.body.append(root);

  controls = ((await scenario(root, options as never)) as ScenarioControls | undefined) ?? {};
  return null;
}

async function run(name: string, args: unknown[]): Promise<unknown> {
  const control = controls[name];
  if (typeof control !== "function") {
    throw new Error(
      `Mounted scenario exposes no control "${name}" (available: ${Object.keys(controls).join(", ") || "none"})`,
    );
  }

  return (await control(...(args as never[]))) ?? null;
}

const harness = { mount, run, teardown };

declare global {
  interface Window {
    askrHarness: typeof harness;
  }
}

window.askrHarness = harness;
