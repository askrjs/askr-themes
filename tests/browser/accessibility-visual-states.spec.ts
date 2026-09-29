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
const surfaces = [
  "bg",
  "surface",
  "surface-muted",
  "surface-raised",
  "surface-overlay",
  "primary-soft",
];

/** Controls whose own fill is the primary colour; the gap must keep the ring off that fill. */
const PRIMARY_FILLED = new Set(["primary-button", "checkbox", "switch"]);
const FOCUS_CASES = [
  "primary-button",
  "checkbox",
  "switch",
  "input",
  "group-button",
  "group-input",
];

interface FocusMeasure {
  outlineStyle: string;
  outlineWidth: number;
  outlineOffset: number;
  outlineColor: string;
  background: string;
  primary: string;
  surface: string;
  width: number;
  height: number;
  clippedBy: string[];
  zIndex: string;
  position: string;
  neighbourZ: string[];
}

test.describe("default-theme accessibility visual states", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`should separate the ${mode} focus ring from the control with a 3:1 gap ring`, async ({
      render,
      page,
      root,
    }) => {
      await render("focusGap", { mode });
      await expect(root.locator("[data-focus-surface]")).toHaveCount(surfaces.length);

      for (const [index, surface] of surfaces.entries()) {
        for (const focusCase of FOCUS_CASES) {
          await test.step(`${mode}: ${focusCase} on ${surface}`, async () => {
            const target = root
              .locator("[data-focus-surface]")
              .nth(index)
              .locator(`[data-focus-case="${focusCase}"]`);
            const before = await target.evaluate((element) => {
              const rect = element.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            });

            // A key press first makes the programmatic focus count as keyboard focus.
            await page.keyboard.press("Shift");
            await target.focus();
            await expect(target).toBeFocused();

            const measured = await target.evaluate((element): FocusMeasure => {
              const styles = getComputedStyle(element);
              const width = Number.parseFloat(styles.outlineWidth);
              const offset = Number.parseFloat(styles.outlineOffset);
              const rect = element.getBoundingClientRect();
              const reach = Math.max(0, width + offset);
              const ring = {
                left: rect.left - reach,
                top: rect.top - reach,
                right: rect.right + reach,
                bottom: rect.bottom + reach,
              };

              let surfaceColor = "rgba(0, 0, 0, 0)";
              const clippedBy: string[] = [];
              for (
                let ancestor = element.parentElement;
                ancestor && ancestor !== document.documentElement;
                ancestor = ancestor.parentElement
              ) {
                const ancestorStyles = getComputedStyle(ancestor);
                if (
                  surfaceColor === "rgba(0, 0, 0, 0)" &&
                  ancestorStyles.backgroundColor !== "rgba(0, 0, 0, 0)"
                ) {
                  surfaceColor = ancestorStyles.backgroundColor;
                }
                const clips = [ancestorStyles.overflowX, ancestorStyles.overflowY].some(
                  (value) => value !== "visible",
                );
                if (!clips) continue;
                const box = ancestor.getBoundingClientRect();
                if (
                  ring.left < box.left ||
                  ring.top < box.top ||
                  ring.right > box.right ||
                  ring.bottom > box.bottom
                ) {
                  clippedBy.push(ancestor.dataset.slot ?? ancestor.tagName.toLowerCase());
                }
              }

              const probe = document.createElement("span");
              probe.style.color = "var(--ak-color-primary)";
              element.parentElement!.append(probe);
              const primary = getComputedStyle(probe).color;
              probe.remove();

              const neighbours = [...(element.parentElement?.children ?? [])].filter(
                (child) => child !== element,
              );
              return {
                outlineStyle: styles.outlineStyle,
                outlineWidth: width,
                outlineOffset: offset,
                outlineColor: styles.outlineColor,
                background: styles.backgroundColor,
                primary,
                surface: surfaceColor,
                width: rect.width,
                height: rect.height,
                clippedBy,
                zIndex: styles.zIndex,
                position: styles.position,
                neighbourZ: neighbours.map((child) => getComputedStyle(child).zIndex),
              };
            });

            // A visible outline ring, not a touching box-shadow.
            expect(measured.outlineStyle).toBe("solid");
            expect(measured.outlineWidth).toBeGreaterThanOrEqual(2);
            // The gap: the ring never touches the control's own fill.
            expect(measured.outlineOffset).toBeGreaterThanOrEqual(1);
            if (PRIMARY_FILLED.has(focusCase)) {
              expect(measured.background).toBe(measured.primary);
            }

            // With the gap, the ring's neighbours are the surface on both sides.
            const surfaceRgb = opaque(parseColor(measured.surface), [255, 255, 255]);
            const ringRgb = opaque(parseColor(measured.outlineColor), surfaceRgb);
            expect(ratio(ringRgb, surfaceRgb)).toBeGreaterThanOrEqual(3);

            // Focus must not shift layout, and no ancestor may clip the ring.
            expect(measured.width).toBe(before.width);
            expect(measured.height).toBe(before.height);
            expect(measured.clippedBy).toEqual([]);

            // Attached neighbours overlap by 1px; the focused member must paint above them.
            if (focusCase.startsWith("group-")) {
              expect(measured.position).not.toBe("static");
              expect(measured.zIndex).toBe("1");
              for (const neighbourZ of measured.neighbourZ) {
                expect(neighbourZ === "auto" || Number(neighbourZ) < 1).toBe(true);
              }
            }
          });
        }
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
