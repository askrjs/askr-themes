import { page, userEvent } from "@vitest/browser/context";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { Button, Input } from "../../src/controls";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "../../src/overlays";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

import "../../src/themes/default/index.css";

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

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function waitForElement<T extends Element>(read: () => T | null): Promise<T> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const element = read();
    if (element) return element;
    await settle();
  }

  throw new Error("Expected accessibility test element to reach its observable state");
}

describe("default-theme accessibility visual states", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    resetTestRoutes();
  });

  afterEach(() => {
    cleanupApp(container);
    container.remove();
    document.documentElement.removeAttribute("data-theme");
    resetTestRoutes();
  });

  for (const mode of ["light", "dark"] as const) {
    it(`should render a stable 3:1 keyboard focus ring on every ${mode} surface`, async () => {
      document.documentElement.setAttribute("data-theme", mode);
      const surfaces = [
        "bg",
        "surface",
        "surface-muted",
        "surface-raised",
        "surface-overlay",
        "primary",
      ];
      window.history.replaceState({}, "", `/focus-${mode}`);
      testRoute(`/focus-${mode}`, () => (
        <main style="background:var(--ak-color-bg);padding:1rem">
          {surfaces.map((surface) => (
            <div
              data-focus-surface={surface}
              style={`background:var(--ak-color-${surface});overflow:visible;padding:0.75rem`}
            >
              <Button variant="outline">Focus {surface}</Button>
            </div>
          ))}
        </main>
      ));

      await createSPA({ root: container, registry: createTestRegistry() });
      const buttons = [...container.querySelectorAll<HTMLButtonElement>('[data-slot="button"]')];
      expect(buttons).toHaveLength(surfaces.length);

      for (const [index, button] of buttons.entries()) {
        const before = button.getBoundingClientRect();
        await userEvent.tab();
        // WebKit on macOS follows the host's Full Keyboard Access setting and
        // may skip buttons. The real keyboard action is still exercised; the
        // fallback keeps the cross-engine computed-style matrix deterministic.
        if (document.activeElement !== button) button.focus();
        expect(document.activeElement).toBe(button);
        const styles = getComputedStyle(button);
        const parentStyles = getComputedStyle(button.parentElement!);
        const parent = parseColor(parentStyles.backgroundColor);
        const ring = parseColor(styles.getPropertyValue("--ak-color-focus-ring"));
        const parentRgb = opaque(parent, [255, 255, 255]);

        expect(
          ratio(opaque(ring, parentRgb), parentRgb),
          `${mode}: ${surfaces[index]}`,
        ).toBeGreaterThanOrEqual(3);
        expect(styles.boxShadow).not.toBe("none");
        expect(button.getBoundingClientRect().width).toBe(before.width);
        expect(button.getBoundingClientRect().height).toBe(before.height);
      }
    });

    it(`should preserve ${mode} elevation, menu focus, and disabled-control perception`, async () => {
      document.documentElement.setAttribute("data-theme", mode);
      window.history.replaceState({}, "", `/visual-states-${mode}`);
      testRoute(`/visual-states-${mode}`, () => (
        <main data-page style="background:var(--ak-color-bg);padding:1rem">
          <Input aria-label="Enabled input" value="enabled" />
          <Input aria-label="Disabled input" disabled value="disabled" />
          <Dialog>
            <DialogTrigger>Open layers</DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent>
                <DialogTitle>Layer matrix</DialogTitle>
                <Button variant="outline">Dialog action</Button>
                <Popover>
                  <PopoverTrigger>Open nested popover</PopoverTrigger>
                  <PopoverPortal>
                    <PopoverContent>
                      <Button variant="outline">Popover action</Button>
                      <PopoverClose>Close popover</PopoverClose>
                    </PopoverContent>
                  </PopoverPortal>
                </Popover>
                <Dropdown>
                  <DropdownTrigger>Open menu</DropdownTrigger>
                  <DropdownContent aria-label="Contrast menu">
                    <DropdownItem>
                      <svg data-slot="icon" aria-hidden="true" />
                      Normal action
                    </DropdownItem>
                    <DropdownItem variant="destructive">Destructive action</DropdownItem>
                    <DropdownItem disabled>Disabled action</DropdownItem>
                  </DropdownContent>
                </Dropdown>
                <DialogClose>Close dialog</DialogClose>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </main>
      ));

      await createSPA({ root: container, registry: createTestRegistry() });
      const pageElement = container.querySelector<HTMLElement>("[data-page]")!;
      const enabled = container.querySelector<HTMLInputElement>('[aria-label="Enabled input"]')!;
      const disabled = container.querySelector<HTMLInputElement>('[aria-label="Disabled input"]')!;
      const pageColor = parseColor(getComputedStyle(pageElement).backgroundColor);
      const pageRgb = opaque(pageColor, [255, 255, 255]);
      const disabledStyle = getComputedStyle(disabled);
      const disabledOpacity = Number(disabledStyle.opacity);
      const disabledFill = opaque(parseColor(disabledStyle.backgroundColor), pageRgb);
      const disabledBorder = opaque(parseColor(disabledStyle.borderTopColor), pageRgb);
      const visibleFill = disabledFill.map(
        (channel, index) => channel * disabledOpacity + pageRgb[index]! * (1 - disabledOpacity),
      ) as RGB;
      const visibleBorder = disabledBorder.map(
        (channel, index) => channel * disabledOpacity + pageRgb[index]! * (1 - disabledOpacity),
      ) as RGB;

      expect(
        ratio(visibleFill, pageRgb) >= 1.5 || ratio(visibleBorder, pageRgb) >= 3,
        `${mode}: disabled Input needs a 1.5:1 fill or 3:1 boundary`,
      ).toBe(true);
      expect(disabledStyle.backgroundColor).not.toBe(getComputedStyle(enabled).backgroundColor);
      expect(disabledStyle.color).not.toBe("rgba(0, 0, 0, 0)");

      await userEvent.click(page.getByRole("button", { name: "Open layers" }));
      await settle();
      const dialog = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
      const pageBackground = getComputedStyle(pageElement).backgroundColor;
      expect(getComputedStyle(dialog).backgroundColor).not.toBe(pageBackground);

      await userEvent.click(page.getByRole("button", { name: "Open nested popover" }));
      await settle();
      const popover = document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')!;
      expect(getComputedStyle(popover).backgroundColor).not.toBe(
        getComputedStyle(dialog).backgroundColor,
      );
      await userEvent.click(page.getByRole("button", { name: "Close popover" }));
      await settle();

      await userEvent.click(page.getByRole("button", { name: "Open menu" }));
      await userEvent.keyboard("{Home}");
      const menu = await waitForElement(() =>
        document.body.querySelector<HTMLElement>('[aria-label="Contrast menu"]'),
      );
      const focused = await waitForElement(() =>
        menu.querySelector<HTMLElement>('[data-slot="dropdown-item"]:focus'),
      );
      const focusStyles = getComputedStyle(focused);
      const menuColor = parseColor(getComputedStyle(menu).backgroundColor);
      const indicator = parseColor(focusStyles.outlineColor);
      const menuRgb = opaque(menuColor, pageRgb);
      expect(focusStyles.outlineStyle).not.toBe("none");
      expect(ratio(opaque(indicator, menuRgb), menuRgb)).toBeGreaterThanOrEqual(3);

      const destructive = menu.querySelector<HTMLElement>('[data-variant="destructive"]')!;
      const disabledItem = menu.querySelector<HTMLElement>("[data-disabled]")!;
      const icon = focused.querySelector<SVGElement>('[data-slot="icon"]')!;
      expect(getComputedStyle(destructive).color).not.toBe(getComputedStyle(focused).color);
      expect(Number(getComputedStyle(disabledItem).opacity)).toBeLessThan(1);
      expect(getComputedStyle(icon).color).toBe(getComputedStyle(focused).color);
    });
  }
});
