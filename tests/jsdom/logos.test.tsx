import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { createLogo, GitHubLogo, GoogleLogo, MicrosoftLogo } from "../../src/logos";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("logos jsdom smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRoutes();
    window.history.replaceState({}, "", "/logos");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("renders the public logo family in a DOM mount", async () => {
    route("/logos", () => (
      <div>
        <GitHubLogo title="GitHub" class="github-logo" />
        <GoogleLogo title="Google" size="lg" class="google-logo" />
        <MicrosoftLogo title="Microsoft" size={28} class="microsoft-logo" />
        {createLogo("CustomLogo", "0 0 24 24", [["path", { d: "M0 0h24v24H0z" }]])({
          title: "Custom",
        })}
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const logos = container?.querySelectorAll('svg[data-slot="icon"]') ?? [];

    expect(logos).toHaveLength(4);
    expect(container?.querySelector('svg[data-icon="GitHubLogo"]')).not.toBeNull();
    expect(container?.querySelector('svg[data-icon="GoogleLogo"]')).not.toBeNull();
    expect(container?.querySelector('svg[data-icon="MicrosoftLogo"]')).not.toBeNull();
    expect(container?.querySelector('svg[data-icon="CustomLogo"]')).not.toBeNull();
    expect(container?.querySelector('svg[data-icon="GitHubLogo"] title')?.textContent).toBe(
      "GitHub",
    );
    expect(container?.querySelector('svg[data-icon="GoogleLogo"]')?.getAttribute("data-size")).toBe(
      "lg",
    );
    expect(
      container?.querySelector('svg[data-icon="MicrosoftLogo"]')?.getAttribute("data-decorative"),
    ).toBeNull();
  });
});
