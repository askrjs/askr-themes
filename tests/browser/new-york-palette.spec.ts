import { expect, test } from "./fixtures";

for (const mode of ["light", "dark"] as const) {
  for (const width of [320, 1440]) {
    test(`should render neutral New York components in ${mode} mode at ${width}px`, async ({
      page,
      render,
      root,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await render("polish-regressions#default");
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, mode);
      await page.getByTestId("reference-button").focus();

      const colors = await root.evaluate((container) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!;
        const rgb = (color: string): number[] => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        const style = (selector: string): CSSStyleDeclaration =>
          getComputedStyle(container.querySelector(selector)!);
        const button = style('[data-testid="reference-button"]');
        const card = style('[data-slot="card"]');
        const input = style('[data-testid="direct-card-input"]');
        return {
          primary: rgb(button.backgroundColor),
          inverse: rgb(button.color),
          surface: rgb(card.backgroundColor),
          text: rgb(card.color),
          inputBorder: rgb(input.borderTopColor),
          focus: rgb(button.outlineColor),
          outline: button.outlineStyle,
        };
      });

      for (const name of [
        "primary",
        "inverse",
        "surface",
        "text",
        "inputBorder",
        "focus",
      ] as const) {
        const channels = colors[name];
        expect(
          Math.max(...channels) - Math.min(...channels),
          `${name} should be neutral`,
        ).toBeLessThanOrEqual(1);
      }
      expect(colors.outline).toBe("solid");
      if (mode === "light") {
        expect(Math.max(...colors.primary)).toBeLessThan(50);
        expect(Math.min(...colors.inverse)).toBeGreaterThan(240);
      } else {
        expect(Math.min(...colors.primary)).toBeGreaterThan(220);
        expect(Math.max(...colors.inverse)).toBeLessThan(50);
      }
    });
  }
}
