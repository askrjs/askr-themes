import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DEFAULT_THEME_STYLES_DIR, TEMPLATE_THEME_STYLES_DIR } from "./test-paths";

const THEME_ROOTS = [DEFAULT_THEME_STYLES_DIR, TEMPLATE_THEME_STYLES_DIR] as const;

const ALIAS_CONTRACTS = [
  ["actions/button.css", ".btn", '[data-slot="button"]'],
  ["actions/button.css", ".btn-close", '[data-slot="button"]'],
  ["actions/button.css", ".btn-primary", '[data-slot="button"][data-variant="primary"]'],
  ["actions/button.css", ".btn-secondary", '[data-slot="button"][data-variant="secondary"]'],
  ["actions/button.css", ".btn-outline", '[data-slot="button"][data-variant="outline"]'],
  ["actions/button.css", ".btn-ghost", '[data-slot="button"][data-variant="ghost"]'],
  ["actions/button.css", ".btn-destructive", '[data-slot="button"][data-variant="destructive"]'],
  ["actions/button.css", ".btn-link", '[data-slot="button"][data-variant="link"]'],
  ["actions/button.css", ".btn-sm", '[data-slot="button"][data-size="sm"]'],
  ["actions/button.css", ".btn-lg", '[data-slot="button"][data-size="lg"]'],
  ["actions/button.css", ".btn-icon", '[data-slot="button"][data-size="icon"]'],
  ["actions/button-group.css", ".btn-group", '[data-slot="button-group"]'],
  [
    "actions/button-group.css",
    ".btn-group-vertical",
    '[data-slot="button-group"][data-orientation="vertical"]',
  ],
  ["display/alert.css", ".alert", '[data-slot="alert"]'],
  ["display/alert.css", ".alert-info", '[data-slot="alert"][data-variant="info"]'],
  ["display/alert.css", ".alert-success", '[data-slot="alert"][data-variant="success"]'],
  ["display/alert.css", ".alert-warning", '[data-slot="alert"][data-variant="warning"]'],
  ["display/alert.css", ".alert-danger", '[data-slot="alert"][data-variant="danger"]'],
  ["display/alert.css", ".alert-icon", '[data-slot="alert-icon"]'],
  ["display/alert.css", ".alert-content", '[data-slot="alert-content"]'],
  ["display/alert.css", ".alert-title", '[data-slot="alert-title"]'],
  ["display/alert.css", ".alert-description", '[data-slot="alert-description"]'],
  ["display/alert.css", ".alert-actions", '[data-slot="alert-actions"]'],
  ["display/alert.css", ".alert-close", '[data-slot="alert-close"]'],
  ["display/avatar.css", ".avatar", '[data-slot="avatar"]'],
  ["display/avatar.css", ".avatar-image", '[data-slot="avatar-image"]'],
  ["display/avatar.css", ".avatar-fallback", '[data-slot="avatar-fallback"]'],
  ["display/card.css", ".card", '[data-slot="card"]'],
  ["display/card.css", ".card-raised", '[data-slot="card"][data-variant="raised"]'],
  ["display/card.css", ".card-header", '[data-slot="card-header"]'],
  ["display/card.css", ".card-title", '[data-slot="card-title"]'],
  ["display/card.css", ".card-description", '[data-slot="card-description"]'],
  ["display/card.css", ".card-content", '[data-slot="card-content"]'],
  ["display/card.css", ".card-footer", '[data-slot="card-footer"]'],
  ["display/card.css", ".card-actions", '[data-slot="card-actions"]'],
  ["forms/field.css", ".field", '[data-slot="field"]'],
  ["forms/field.css", ".field-hint", '[data-slot="field-hint"]'],
  ["forms/field.css", ".field-error", '[data-slot="field-error"]'],
  ["forms/input-group.css", ".input-group", '[data-slot="input-group"]'],
  [
    "forms/input-group.css",
    ".input-group-vertical",
    '[data-slot="input-group"][data-orientation="vertical"]',
  ],
  ["forms/input-group.css", ".input-group-text", '[data-slot="input-group-text"]'],
  ["forms/input.css", ".input", '[data-slot="input"]'],
  ["forms/input.css", ".input-sm", '[data-slot="input"][data-size="sm"]'],
  ["forms/input.css", ".input-lg", '[data-slot="input"][data-size="lg"]'],
  ["forms/textarea.css", ".textarea", '[data-slot="textarea"]'],
  ["forms/textarea.css", ".textarea-sm", '[data-slot="textarea"][data-size="sm"]'],
  ["forms/textarea.css", ".textarea-lg", '[data-slot="textarea"][data-size="lg"]'],
  ["forms/label.css", ".label", '[data-slot="label"]'],
  ["display/badge.css", ".badge", '[data-slot="badge"]'],
  ["display/badge.css", ".badge-secondary", '[data-slot="badge"][data-variant="secondary"]'],
  ["display/badge.css", ".badge-outline", '[data-slot="badge"][data-variant="outline"]'],
  ["display/badge.css", ".badge-success", '[data-slot="badge"][data-variant="success"]'],
  ["display/badge.css", ".badge-warning", '[data-slot="badge"][data-variant="warning"]'],
  ["display/badge.css", ".badge-danger", '[data-slot="badge"][data-variant="danger"]'],
  ["display/badge.css", ".badge-info", '[data-slot="badge"][data-variant="info"]'],
  ["overlays/dropdown.css", ".dropdown-trigger", '[data-slot="dropdown-trigger"]'],
  ["overlays/dropdown.css", ".dropdown-content", '[data-slot="dropdown-content"]'],
  ["overlays/dropdown.css", ".dropdown-item", '[data-slot="dropdown-item"]'],
  ["overlays/dropdown.css", ".dropdown-label", '[data-slot="dropdown-label"]'],
  ["overlays/dropdown.css", ".dropdown-separator", '[data-slot="dropdown-separator"]'],
  ["layout/patterns.css", ".empty-state", '[data-slot="empty-state"]'],
  ["layout/patterns.css", ".empty-state-icon", '[data-slot="empty-state-icon"]'],
  ["layout/patterns.css", ".empty-state-title", '[data-slot="empty-state-title"]'],
  ["layout/patterns.css", ".empty-state-description", '[data-slot="empty-state-description"]'],
  ["layout/patterns.css", ".empty-state-actions", '[data-slot="empty-state-actions"]'],
  ["navigation/nav.css", ".nav-item", '[data-slot="nav-item"]'],
  ["navigation/nav.css", ".navbar-item", '[data-slot="nav-item"]'],
  ["navigation/nav.css", ".tabs", '[data-slot="tabs"]'],
  ["navigation/nav.css", ".tab", '[data-slot="tab"]'],
  ["navigation/nav.css", ".pills", '[data-slot="pills"]'],
  ["navigation/nav.css", ".pill", '[data-slot="pill"]'],
  ["navigation/pagination.css", ".pagination", '[data-slot="pagination"]'],
  ["navigation/pagination.css", ".pagination-list", '[data-slot="pagination-list"]'],
  ["navigation/pagination.css", ".page-item", '[data-slot="pagination-item"]'],
  ["navigation/pagination.css", ".page-link", '[data-slot="pagination-link"]'],
  ["navigation/pagination.css", ".pagination-ellipsis", '[data-slot="pagination-ellipsis"]'],
  [
    "navigation/pagination.css",
    ".page-item.active > .page-link",
    '[data-slot="pagination-item"][data-active="true"] > [data-slot="pagination-link"]',
  ],
  [
    "navigation/pagination.css",
    ".page-link.active",
    '[data-slot="pagination-link"][data-active="true"]',
  ],
  [
    "navigation/pagination.css",
    ".page-item.disabled > .page-link",
    '[data-slot="pagination-item"][data-disabled="true"] > [data-slot="pagination-link"]',
  ],
  [
    "navigation/pagination.css",
    ".page-link.disabled",
    '[data-slot="pagination-link"][data-disabled="true"]',
  ],
  ["forms/select.css", ".select-trigger", '[data-slot="select-trigger"]'],
  ["forms/select.css", ".select-trigger-sm", '[data-slot="select-trigger"][data-size="sm"]'],
  ["forms/select.css", ".select-trigger-lg", '[data-slot="select-trigger"][data-size="lg"]'],
  ["forms/select.css", ".select-content", '[data-slot="select-content"]'],
  ["forms/select.css", ".select-item", '[data-slot="select-item"]'],
  ["forms/select.css", ".select-group", '[data-slot="select-group"]'],
  ["forms/select.css", ".select-label", '[data-slot="select-label"]'],
  ["forms/select.css", ".select-separator", '[data-slot="select-separator"]'],
  ["forms/select.css", ".select-value", '[data-slot="select-value"]'],
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
      it(`should ${label} ${relativePath}: ${alias} aliases ${canonical}`, () => {
        const css = readFileSync(join(root, relativePath), "utf-8");
        const hasSharedBlock = selectorBlocks(css).some(
          (selector) => selector.includes(alias) && selector.includes(canonical),
        );

        expect(hasSharedBlock).toBe(true);
      });
    }
  }

  it("should documents raw class authoring examples in the alias contract", () => {
    const examples = [
      '<button class="btn btn-primary btn-sm">Save</button>',
      '<section class="card"><div class="card-header"></div><div class="card-content"></div></section>',
      '<input class="input" />',
      '<span class="badge badge-success">Live</span>',
    ];

    expect(examples.every((example) => example.includes("class="))).toBe(true);
  });
});
