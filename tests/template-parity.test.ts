import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_COMPONENTS = join(
  __dirname,
  '..',
  'src',
  'themes',
  'default',
  'components'
);
const TEMPLATE_COMPONENTS = join(
  __dirname,
  '..',
  'templates',
  'theme',
  'components'
);

function listCssFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .sort();
}

describe('template parity', () => {
  const defaultFiles = listCssFiles(DEFAULT_COMPONENTS);
  const templateFiles = listCssFiles(TEMPLATE_COMPONENTS);

  it('should find default theme component files', () => {
    expect(defaultFiles.length).toBeGreaterThan(0);
  });

  it('should find template component files', () => {
    expect(templateFiles.length).toBeGreaterThan(0);
  });

  it('template covers every component in the default theme', () => {
    const missingInTemplate = defaultFiles.filter(
      (f) => !templateFiles.includes(f)
    );
    expect(
      missingInTemplate,
      `Default theme has components missing from template: ${missingInTemplate.join(', ')}`
    ).toEqual([]);
  });

  it('template has no extra files not in the default theme', () => {
    const extraInTemplate = templateFiles.filter(
      (f) => !defaultFiles.includes(f)
    );
    expect(
      extraInTemplate,
      `Template has extra components not in default theme: ${extraInTemplate.join(', ')}`
    ).toEqual([]);
  });
});
