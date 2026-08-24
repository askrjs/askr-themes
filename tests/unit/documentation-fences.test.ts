import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { ROOT_DIR } from "./test-paths";

const DOCUMENTS = ["README.md", "AGENTS.md", "THEMING.md"] as const;
const SUPPORTED_LANGUAGES = new Set(["bash", "css", "html", "ts", "tsx"]);
const tokenSource = readFileSync(join(ROOT_DIR, "src/themes/default/tokens.css"), "utf8");

function fences(source: string): { language: string; body: string }[] {
  return [...source.matchAll(/^```([^\n]*)\n([\s\S]*?)^```\s*$/gmu)].map((match) => ({
    language: match[1]!.trim(),
    body: match[2]!.trim(),
  }));
}

describe("documentation fence contracts", () => {
  for (const document of DOCUMENTS) {
    it(`should keep every ${document} example attached to current public contracts`, () => {
      const source = readFileSync(join(ROOT_DIR, document), "utf8");
      for (const [index, fence] of fences(source).entries()) {
        expect(SUPPORTED_LANGUAGES.has(fence.language), `${document} fence ${index + 1}`).toBe(
          true,
        );
        expect(fence.body, `${document} fence ${index + 1} is empty`).not.toBe("");
        for (const token of fence.body.match(/--ak-[\w-]+/gu) ?? []) {
          expect(tokenSource, `${document} fence ${index + 1}: unknown ${token}`).toContain(
            `${token}:`,
          );
        }
      }
    });
  }
});
