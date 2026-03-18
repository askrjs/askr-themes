import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const THEMES_DIR = join(__dirname, '..', 'src', 'themes', 'default');
const TOKENS_FILE = join(THEMES_DIR, 'tokens.css');
const COMPONENTS_DIR = join(THEMES_DIR, 'components');

function extractDefinedTokens(css: string, selectorFilter?: string): Set<string> {
  const tokens = new Set<string>();
  const lines = css.split('\n');

  let inBlock = false;
  let currentSelector = '';

  for (const line of lines) {
    const selectorMatch = line.match(/^([^{]+)\{/);
    if (selectorMatch) {
      currentSelector = selectorMatch[1].trim();
      inBlock = true;
    }

    if (line.includes('}')) {
      inBlock = false;
      currentSelector = '';
    }

    if (inBlock) {
      if (selectorFilter && currentSelector !== selectorFilter) continue;
      const match = line.match(/(--ak-[a-z0-9-]+)\s*:/);
      if (match) {
        tokens.add(match[1]);
      }
    }
  }

  return tokens;
}

function extractReferencedTokens(css: string): Set<string> {
  const tokens = new Set<string>();
  const matches = css.matchAll(/var\((--ak-[a-z0-9-]+)\)/g);
  for (const match of matches) {
    tokens.add(match[1]);
  }
  return tokens;
}

function getComponentCss(): string {
  const files = readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.css'));
  return files
    .map((f) => readFileSync(join(COMPONENTS_DIR, f), 'utf-8'))
    .join('\n');
}

describe('token completeness', () => {
  const tokensCss = readFileSync(TOKENS_FILE, 'utf-8');
  const allDefinedTokens = extractDefinedTokens(tokensCss);
  const componentCss = getComponentCss();
  const referencedTokens = extractReferencedTokens(componentCss);

  it('should define tokens in :root', () => {
    expect(allDefinedTokens.size).toBeGreaterThan(0);
  });

  it('every design token referenced by components is defined in tokens.css', () => {
    // Some --ak-* variables are component-scoped (set at runtime via inline
    // styles, not design tokens). Exclude these from the check.
    const componentScopedVars = new Set([
      '--ak-progress-percentage',
      '--ak-slider-percentage',
      '--ak-contract-covered',
      '--ak-state-closed',
      '--ak-state-determinate',
      '--ak-state-inactive',
      '--ak-state-off',
      '--ak-state-unchecked',
    ]);

    const missing = [...referencedTokens].filter(
      (token) => !allDefinedTokens.has(token) && !componentScopedVars.has(token)
    );
    expect(missing).toEqual([]);
  });

  it('light and dark themes define the same color tokens', () => {
    const lightTokens = extractDefinedTokens(tokensCss, '[data-theme="light"]');
    const darkTokens = extractDefinedTokens(tokensCss, '[data-theme="dark"]');

    const lightColors = [...lightTokens].filter((t) =>
      t.startsWith('--ak-color-')
    );
    const darkColors = [...darkTokens].filter((t) =>
      t.startsWith('--ak-color-')
    );

    const missingInDark = lightColors.filter((t) => !darkTokens.has(t));
    const missingInLight = darkColors.filter((t) => !lightTokens.has(t));

    expect(
      missingInDark,
      `Color tokens in light but missing in dark: ${missingInDark.join(', ')}`
    ).toEqual([]);
    expect(
      missingInLight,
      `Color tokens in dark but missing in light: ${missingInLight.join(', ')}`
    ).toEqual([]);
  });
});
