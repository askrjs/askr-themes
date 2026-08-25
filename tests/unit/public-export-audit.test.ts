import { basename } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { PUBLIC_EXPORT_OWNERSHIP, type PublicExportOwner } from "../fixtures/public-export-audit";

const entryModules = import.meta.glob("../../src/entries/*.ts", { eager: true });
const topLevelModules = import.meta.glob(
  ["../../src/components.ts", "../../src/theme.ts", "../../src/ssr.ts"],
  {
    eager: true,
  },
);
const modules = { ...entryModules, ...topLevelModules };

function subpath(path: string): string {
  return basename(path).replace(/\.(?:ts|tsx)$/u, "");
}

function ownerFor(name: string): PublicExportOwner | undefined {
  return (
    Object.entries(PUBLIC_EXPORT_OWNERSHIP) as [PublicExportOwner, ReadonlySet<string>][]
  ).find(([, names]) => names.has(name))?.[0];
}

describe("public export audit matrix", () => {
  it("should classify every runtime export from every JavaScript package entrypoint", () => {
    const rows = Object.entries(modules).flatMap(([path, namespace]) => {
      const entrypoint = subpath(path);
      const owner = ownerFor(entrypoint);
      expect(owner, `missing ownership classification for ${entrypoint}`).toBeDefined();
      return Object.entries(namespace as Record<string, unknown>).map(([name, value]) => ({
        entrypoint,
        name,
        owner,
        value,
      }));
    });

    expect(rows.length).toBeGreaterThan(100);
    for (const row of rows) {
      expect(row.value, `${row.entrypoint} exports undefined ${row.name}`).not.toBeUndefined();
    }
  });
});
