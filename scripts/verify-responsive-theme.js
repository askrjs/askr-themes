import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function main() {
  const defaultIndex = await read('src/themes/default/index.css');
  const templateIndex = await read('templates/theme/index.css');
  const defaultResponsive = await read('src/themes/default/components/responsive-layout.css');
  const templateResponsive = await read('templates/theme/components/responsive-layout.css');
  const theming = await read('THEMING.md');

  const requiredIndexImport = '@import "./components/responsive-layout.css";';
  if (!defaultIndex.includes(requiredIndexImport)) {
    throw new Error('Default theme is missing responsive-layout.css import.');
  }
  if (!templateIndex.includes(requiredIndexImport)) {
    throw new Error('Theme template is missing responsive-layout.css import.');
  }

  const requiredResponsiveSnippets = [
    '[data-slot="sidebar-layout"]',
    '[data-slot="grid"][data-columns="2"]',
    '[data-slot="grid"][data-columns="3"]',
    '[data-slot="grid"][data-min-item-width]',
    '[data-slot="inline"][data-collapse-below="sm"]',
    '[data-slot="sidebar-layout"][data-collapse-below="md"]',
    '@media (min-width: 40rem)',
    '@media (min-width: 48rem)',
    '@media (min-width: 64rem)',
    '@media (min-width: 80rem)',
  ];

  for (const snippet of requiredResponsiveSnippets) {
    if (!defaultResponsive.includes(snippet)) {
      throw new Error(`Default responsive layout CSS is missing: ${snippet}`);
    }
  }

  if (defaultResponsive !== templateResponsive) {
    throw new Error('Template responsive layout CSS is out of sync with the default theme.');
  }

  const requiredDocs = [
    'Build mobile first.',
    '`sm`, `md`, `lg`, and `xl`',
    '`data-collapse-below`',
    '`data-min-item-width`',
  ];

  for (const snippet of requiredDocs) {
    if (!theming.includes(snippet)) {
      throw new Error(`THEMING.md is missing responsive guidance: ${snippet}`);
    }
  }

  console.log('Responsive theme contract verified.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
