import { expect, test } from "./fixtures";

type RGBA = [number, number, number, number];
type RGB = [number, number, number];

function parseColor(value: string): RGBA {
  const rgb = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[/,]\s*([\d.]+))?/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4] ?? 1)];

  const oklch = value.match(
    /oklch\(\s*([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(?:deg)?(?:\s*[/]\s*([+-]?(?:\d*\.?\d+))(%)?)?/i,
  );
  if (!oklch) throw new Error(`Unsupported computed color: ${value}`);
  const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
  const chroma = Number(oklch[3]) / (oklch[4] ? 100 : 1);
  const hue = (Number(oklch[5]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const srgb = linear.map(
    (channel) =>
      255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055),
  );
  return [
    srgb[0]!,
    srgb[1]!,
    srgb[2]!,
    oklch[6] === undefined ? 1 : Number(oklch[6]) / (oklch[7] ? 100 : 1),
  ];
}

function composite(color: RGBA, background: RGB): RGB {
  return [
    color[0] * color[3] + background[0] * (1 - color[3]),
    color[1] * color[3] + background[1] * (1 - color[3]),
    color[2] * color[3] + background[2] * (1 - color[3]),
  ];
}

function luminance(color: RGB): number {
  const linear = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function ratio(left: RGB, right: RGB): number {
  const leftLuminance = luminance(left);
  const rightLuminance = luminance(right);
  return (
    (Math.max(leftLuminance, rightLuminance) + 0.05) /
    (Math.min(leftLuminance, rightLuminance) + 0.05)
  );
}

function opaque(color: RGBA, background: RGB): RGB {
  return composite(color, background);
}

/** Mirrors the surface list `scenarios/accessibility-visual-states.tsx` renders. */
const surfaces = ["bg", "surface", "surface-muted", "surface-raised", "surface-overlay", "primary"];

test.describe("default-theme accessibility visual states", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`should render a stable 3:1 keyboard focus ring on every ${mode} surface`, async ({
      render,
      page,
      root,
    }) => {
      await render("focusRing", { mode });

      const buttons = root.locator('[data-slot="button"]');
      await expect(buttons).toHaveCount(surfaces.length);

      for (const [index, surface] of surfaces.entries()) {
        // `${mode}: ${surface}` — the diagnostic the original passed as
        // vitest's second `expect` argument, kept as the step label.
        await test.step(`${mode}: ${surface}`, async () => {
          const button = buttons.nth(index);
          const before = await button.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          });

          await page.keyboard.press("Tab");
          // WebKit on macOS follows the host's Full Keyboard Access setting and
          // may skip buttons. The real keyboard action is still exercised; the
          // fallback keeps the cross-engine computed-style matrix deterministic.
          if (!(await button.evaluate((element) => document.activeElement === element))) {
            await button.evaluate((element) => (element as HTMLElement).focus());
          }
          await expect(button).toBeFocused();

          const measured = await button.evaluate((element) => {
            const styles = getComputedStyle(element);
            const parentStyles = getComputedStyle(element.parentElement!);
            const rect = element.getBoundingClientRect();
            return {
              boxShadow: styles.boxShadow,
              ring: styles.getPropertyValue("--ak-color-focus-ring"),
              parentBackground: parentStyles.backgroundColor,
              width: rect.width,
              height: rect.height,
            };
          });

          const parent = parseColor(measured.parentBackground);
          const ring = parseColor(measured.ring);
          const parentRgb = opaque(parent, [255, 255, 255]);

          expect(ratio(opaque(ring, parentRgb), parentRgb)).toBeGreaterThanOrEqual(3);
          expect(measured.boxShadow).not.toBe("none");
          expect(measured.width).toBe(before.width);
          expect(measured.height).toBe(before.height);
        });
      }
    });

    test(`should preserve ${mode} elevation, menu focus, and disabled-control perception`, async ({
      render,
      page,
      root,
    }) => {
      await render("visualStates", { mode });

      const pageElement = root.locator("[data-page]");
      const enabled = root.locator('[aria-label="Enabled input"]');
      const disabled = root.locator('[aria-label="Disabled input"]');

      const measured = await page.evaluate(() => {
        const read = (selector: string) =>
          getComputedStyle(document.querySelector(selector) as HTMLElement);
        const pageStyle = read("#mount-root [data-page]");
        const enabledStyle = read('#mount-root [aria-label="Enabled input"]');
        const disabledStyle = read('#mount-root [aria-label="Disabled input"]');
        return {
          pageBackgroundColor: pageStyle.backgroundColor,
          enabledBackgroundColor: enabledStyle.backgroundColor,
          disabledBackgroundColor: disabledStyle.backgroundColor,
          disabledBorderTopColor: disabledStyle.borderTopColor,
          disabledColor: disabledStyle.color,
          disabledOpacity: disabledStyle.opacity,
        };
      });

      await expect(pageElement).toBeAttached();
      await expect(enabled).toBeAttached();
      await expect(disabled).toBeAttached();

      const pageColor = parseColor(measured.pageBackgroundColor);
      const pageRgb = opaque(pageColor, [255, 255, 255]);
      const disabledOpacity = Number(measured.disabledOpacity);
      const disabledFill = opaque(parseColor(measured.disabledBackgroundColor), pageRgb);
      const disabledBorder = opaque(parseColor(measured.disabledBorderTopColor), pageRgb);
      const visibleFill = disabledFill.map(
        (channel, index) => channel * disabledOpacity + pageRgb[index]! * (1 - disabledOpacity),
      ) as RGB;
      const visibleBorder = disabledBorder.map(
        (channel, index) => channel * disabledOpacity + pageRgb[index]! * (1 - disabledOpacity),
      ) as RGB;

      const boundaryLabel = `${mode}: disabled Input needs a 1.5:1 fill or 3:1 boundary`;
      expect({
        label: boundaryLabel,
        perceivable: ratio(visibleFill, pageRgb) >= 1.5 || ratio(visibleBorder, pageRgb) >= 3,
      }).toEqual({ label: boundaryLabel, perceivable: true });
      expect(measured.disabledBackgroundColor).not.toBe(measured.enabledBackgroundColor);
      expect(measured.disabledColor).not.toBe("rgba(0, 0, 0, 0)");

      await page.getByRole("button", { name: "Open layers" }).click();

      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();
      const dialogBackground = await dialog.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      const pageBackground = await pageElement.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      expect(dialogBackground).not.toBe(pageBackground);

      await page.getByRole("button", { name: "Open nested popover" }).click();

      const popover = page.locator('[data-slot="popover-content"]');
      await expect(popover).toBeVisible();
      const popoverBackground = await popover.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      expect(popoverBackground).not.toBe(dialogBackground);

      await page.getByRole("button", { name: "Close popover" }).click();

      await page.getByRole("button", { name: "Open menu" }).click();

      const menu = page.locator('[aria-label="Contrast menu"]');
      await expect(menu).toBeVisible();

      await menu
        .locator('[data-slot="dropdown-item"]')
        .first()
        .evaluate((element) => (element as HTMLElement).focus());
      const focused = menu.locator('[data-slot="dropdown-item"]:focus');
      await expect(focused).toBeAttached();

      const menuMeasured = await menu.evaluate((element) => {
        const focusedItem = element.querySelector<HTMLElement>(
          '[data-slot="dropdown-item"]:focus',
        )!;
        const focusStyles = getComputedStyle(focusedItem);
        return {
          menuBackgroundColor: getComputedStyle(element).backgroundColor,
          outlineStyle: focusStyles.outlineStyle,
          outlineColor: focusStyles.outlineColor,
          focusedColor: focusStyles.color,
          destructiveColor: getComputedStyle(
            element.querySelector<HTMLElement>('[data-variant="destructive"]')!,
          ).color,
          disabledOpacity: getComputedStyle(element.querySelector<HTMLElement>("[data-disabled]")!)
            .opacity,
          iconColor: getComputedStyle(focusedItem.querySelector<SVGElement>('[data-slot="icon"]')!)
            .color,
        };
      });

      const menuColor = parseColor(menuMeasured.menuBackgroundColor);
      const indicator = parseColor(menuMeasured.outlineColor);
      const menuRgb = opaque(menuColor, pageRgb);
      expect(menuMeasured.outlineStyle).not.toBe("none");
      expect(ratio(opaque(indicator, menuRgb), menuRgb)).toBeGreaterThanOrEqual(3);

      expect(menuMeasured.destructiveColor).not.toBe(menuMeasured.focusedColor);
      expect(Number(menuMeasured.disabledOpacity)).toBeLessThan(1);
      expect(menuMeasured.iconColor).toBe(menuMeasured.focusedColor);
    });
  }
});
