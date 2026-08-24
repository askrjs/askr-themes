import { existsSync } from "node:fs";
import { basename, join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import {
  PUBLIC_EXPORT_EVIDENCE,
  PUBLIC_EXPORT_OWNERSHIP,
  type PublicExportOwner,
} from "../fixtures/public-export-audit";
import { ROOT_DIR } from "./test-paths";

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
      expect(
        PUBLIC_EXPORT_EVIDENCE[row.owner!].length,
        `${row.entrypoint}#${row.name} lacks executable evidence`,
      ).toBeGreaterThan(0);
    }
  });

  it("should keep every ownership class attached to checked-in executable evidence", () => {
    for (const [owner, files] of Object.entries(PUBLIC_EXPORT_EVIDENCE)) {
      expect(files.length, owner).toBeGreaterThan(0);
      for (const file of files) {
        expect(existsSync(join(ROOT_DIR, file)), `${owner}: missing ${file}`).toBe(true);
      }
    }
  });
});
