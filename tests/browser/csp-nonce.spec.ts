import { expect, test } from "./fixtures";

test.describe("theme CSP nonce", () => {
  test("should create separate nonced style registries", async ({ render, page }) => {
    const first = "MDEyMzQ1Njc4OWFiY2RlZg";
    const second = "ZmVkY2JhOTg3NjU0MzIxMA";

    await render();

    const nonces = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLStyleElement>("style[data-askr-style-registry]"),
        (style) => style.nonce,
      ),
    );

    expect(nonces.some((nonce) => nonce === first)).toBe(true);
    expect(nonces.some((nonce) => nonce === second)).toBe(true);
  });
});
