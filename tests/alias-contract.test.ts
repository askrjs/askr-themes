import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const THEME_ROOTS = [
  join(__dirname, "..", "src", "themes", "default", "styles"),
  join(__dirname, "..", "templates", "theme", "styles"),
] as const;

const ALIAS_CONTRACTS = [
  ["actions/button.css", ".btn", '[data-slot="button"]'],
  ["actions/button.css", ".btn-primary", '[data-slot="button"][data-variant="primary"]'],
  ["actions/button.css", ".btn-secondary", '[data-slot="button"][data-variant="secondary"]'],
  ["actions/button.css", ".btn-outline", '[data-slot="button"][data-variant="outline"]'],
  ["actions/button.css", ".btn-ghost", '[data-slot="button"][data-variant="ghost"]'],
  ["actions/button.css", ".btn-destructive", '[data-slot="button"][data-variant="destructive"]'],
  ["actions/button.css", ".btn-link", '[data-slot="button"][data-variant="link"]'],
  ["actions/button.css", ".btn-sm", '[data-slot="button"][data-size="sm"]'],
  ["actions/button.css", ".btn-lg", '[data-slot="button"][data-size="lg"]'],
  ["actions/button.css", ".btn-icon", '[data-slot="button"][data-size="icon"]'],
  ["display/card.css", ".card", '[data-slot="card"]'],
  ["display/card.css", ".card-raised", '[data-slot="card"][data-variant="raised"]'],
  ["display/card.css", ".card-sm", '[data-slot="card"][data-padding="sm"]'],
  ["display/card.css", ".card-lg", '[data-slot="card"][data-padding="lg"]'],
  ["display/card.css", ".card-header", '[data-slot="card-header"]'],
  ["display/card.css", ".card-title", '[data-slot="card-title"]'],
  ["display/card.css", ".card-description", '[data-slot="card-description"]'],
  ["display/card.css", ".card-content", '[data-slot="card-content"]'],
  ["display/card.css", ".card-footer", '[data-slot="card-footer"]'],
  ["forms/input.css", ".input", '[data-slot="input"]'],
  ["forms/textarea.css", ".textarea", '[data-slot="textarea"]'],
  ["forms/label.css", ".label", '[data-slot="label"]'],
  ["display/badge.css", ".badge", '[data-slot="badge"]'],
  ["display/badge.css", ".badge-secondary", '[data-slot="badge"][data-variant="secondary"]'],
  ["display/badge.css", ".badge-outline", '[data-slot="badge"][data-variant="outline"]'],
  ["display/badge.css", ".badge-success", '[data-slot="badge"][data-variant="success"]'],
  ["display/badge.css", ".badge-warning", '[data-slot="badge"][data-variant="warning"]'],
  ["display/badge.css", ".badge-danger", '[data-slot="badge"][data-variant="danger"]'],
  ["display/badge.css", ".badge-info", '[data-slot="badge"][data-variant="info"]'],
  ["layout/patterns.css", ".empty-state", '[data-slot="empty-state"]'],
  ["layout/patterns.css", ".empty-state-icon", '[data-slot="empty-state-icon"]'],
  ["layout/patterns.css", ".empty-state-title", '[data-slot="empty-state-title"]'],
  ["layout/patterns.css", ".empty-state-description", '[data-slot="empty-state-description"]'],
  ["layout/patterns.css", ".empty-state-actions", '[data-slot="empty-state-actions"]'],
  ["shell/navbar.css", ".navbar", '[data-slot="navbar"]'],
  ["shell/navbar.css", ".navbar-brand", '[data-slot="navbar-brand"]'],
  ["shell/navbar.css", ".navbar-group", '[data-slot="navbar-group"]'],
  ["shell/navbar.css", ".navbar-item", '[data-slot="nav-item"]'],
  ["shell/navbar.css", ".navbar-item-icon", '[data-slot="nav-item"][data-variant="icon"]'],
] as const;

function selectorBlocks(css: string): string[] {
  return [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector.startsWith(":where("));
}

describe("daisy-like class aliases", () => {
  for (const root of THEME_ROOTS) {
    const label = root.includes(`${join("templates", "theme")}`) ? "template" : "default";

    for (const [relativePath, alias, canonical] of ALIAS_CONTRACTS) {
      it(`${label} ${relativePath}: ${alias} aliases ${canonical}`, () => {
        const css = readFileSync(join(root, relativePath), "utf-8");
        const hasSharedBlock = selectorBlocks(css).some(
          (selector) => selector.includes(alias) && selector.includes(canonical),
        );

        expect(hasSharedBlock).toBe(true);
      });
    }
  }

  it("documents raw class authoring examples in the alias contract", () => {
    const examples = [
      '<button class="btn btn-primary btn-sm">Save</button>',
      '<section class="card"><div class="card-header"></div><div class="card-content"></div></section>',
      '<input class="input" />',
      '<span class="badge badge-success">Live</span>',
    ];

    expect(examples.every((example) => example.includes("class="))).toBe(true);
  });
});
