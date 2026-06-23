import { defineContext, getSignal, readContext, state } from "@askrjs/askr";
import type { JSXElement } from "@askrjs/askr/foundations/structures";
import { resource } from "@askrjs/askr/resources";
import { Button } from "@askrjs/ui";
import type { ButtonNativeProps, PressEvent } from "@askrjs/ui";

export const CAT_THEME_NAMES = ["tabby", "ginger", "tuxedo", "calico", "torty"] as const;

export type CatThemeName = (typeof CAT_THEME_NAMES)[number];
export type ThemeName = "light" | "dark" | "system" | CatThemeName | (string & {});

export type ThemeOption = {
  value: ThemeName;
  label: string;
};

export type ThemeContextValue = {
  theme: () => ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: readonly ThemeOption[];
  storageKey: string;
};

export type ThemeProviderProps = {
  children?: unknown;
  defaultTheme?: ThemeName;
  themes?: readonly ThemeOption[];
  storageKey?: string;
};

export type ThemePickerProps = Omit<
  JSX.IntrinsicElements["select"],
  "children" | "value" | "defaultValue" | "onChange"
> & {
  themes?: readonly ThemeOption[];
  label?: string;
};

export type ThemeToggleRenderContext = {
  theme: ThemeName;
  nextTheme: ThemeName;
};

export type ThemeToggleProps = Omit<ButtonNativeProps, "children" | "onPress"> & {
  children?: unknown | ((context: ThemeToggleRenderContext) => unknown);
  lightIcon?: unknown;
  darkIcon?: unknown;
  systemIcon?: unknown;
  themes?: readonly ThemeName[];
  onPress?: (event: PressEvent) => void;
};

export const DEFAULT_THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const CAT_THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "tabby", label: "Tabby" },
  { value: "ginger", label: "Ginger" },
  { value: "tuxedo", label: "Tuxedo" },
  { value: "calico", label: "Calico" },
  { value: "torty", label: "Torty" },
];

const DEFAULT_STORAGE_KEY = "askr-theme";
// Passive mount sync should not overwrite a newer user/provider-initiated change.
let rootThemeRevision = 0;
let explicitRootThemeOwner: symbol | undefined;
const registeredProviderSignals = new WeakSet<AbortSignal>();

const ThemeContext = defineContext<ThemeContextValue>({
  theme: () => "system",
  setTheme: () => undefined,
  themes: DEFAULT_THEME_OPTIONS,
  storageKey: DEFAULT_STORAGE_KEY,
});

export function useTheme(): ThemeContextValue {
  return readContext(ThemeContext);
}

export function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  const {
    children,
    defaultTheme = "system",
    themes = DEFAULT_THEME_OPTIONS,
    storageKey = DEFAULT_STORAGE_KEY,
  } = props;

  const providerId = state<symbol>(Symbol("ThemeProvider"))();
  const providerSignal = getSignal();
  const themeState = state<ThemeName>(readStoredTheme(storageKey) ?? defaultTheme);
  const currentTheme = themeState();

  if (!registeredProviderSignals.has(providerSignal)) {
    registeredProviderSignals.add(providerSignal);
    providerSignal.addEventListener(
      "abort",
      () => {
        if (explicitRootThemeOwner === providerId) {
          explicitRootThemeOwner = undefined;
        }
      },
      { once: true },
    );
  }

  const setTheme = (nextTheme: ThemeName) => {
    themeState.set(nextTheme);
    writeStoredTheme(storageKey, nextTheme);
    explicitRootThemeOwner = providerId;
    rootThemeRevision += 1;
    syncThemeRoot(nextTheme);
  };

  const value: ThemeContextValue = {
    theme: themeState,
    setTheme,
    themes,
    storageKey,
  };

  return (
    <ThemeContext.Scope value={value}>
      <ThemeRootSync providerId={providerId} theme={currentTheme} />
      <div data-slot="theme-provider">{children}</div>
    </ThemeContext.Scope>
  );
}

function ThemeRootSync(props: { providerId: symbol; theme: ThemeName }): JSX.Element | null {
  const { providerId, theme } = props;
  const expectedRootThemeRevision = rootThemeRevision;

  resource(
    ({ signal }: { signal: AbortSignal }) => {
      if (typeof window === "undefined") {
        syncThemeRoot(theme);
        return null;
      }

      const timeoutId = window.setTimeout(() => {
        if (!signal.aborted) {
          syncThemeRoot(theme, {
            expectedRevision: expectedRootThemeRevision,
            passive: true,
            providerId,
          });
        }
      }, 0);

      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timeoutId);
        },
        { once: true },
      );

      return null;
    },
    [theme],
  );

  return null;
}

export function ThemePicker(props: ThemePickerProps): JSX.Element {
  const theme = useTheme();
  const { themes = theme.themes, label = "Theme", ...rest } = props;
  const currentTheme = theme.theme();

  return (
    <select
      {...rest}
      aria-label={rest["aria-label"] ?? label}
      data-slot="theme-picker"
      value={currentTheme}
      onChange={(event: Event) => {
        const target = getThemePickerTarget(event);
        if (target) {
          theme.setTheme(target.value as ThemeName);
        }
      }}
    >
      {themes.map((option) => (
        <option
          key={option.value}
          value={option.value}
          selected={option.value === currentTheme}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function getThemePickerTarget(event: Event): HTMLSelectElement | null {
  if (typeof HTMLSelectElement === "undefined") {
    return null;
  }

  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  const candidates = [event.target, event.currentTarget, ...path];

  for (const candidate of candidates) {
    if (candidate instanceof HTMLSelectElement) {
      return candidate;
    }
  }

  return null;
}

export function ThemeToggle(props: ThemeToggleProps): JSX.Element {
  const theme = useTheme();
  const {
    children,
    lightIcon,
    darkIcon,
    systemIcon,
    themes = ["light", "dark"],
    onPress,
    ...rest
  } = props;

  const currentTheme = theme.theme();
  const nextTheme = getNextTheme(currentTheme, themes);
  const renderContext = { theme: currentTheme, nextTheme };
  const ariaLabel = (rest as Record<string, unknown>)["aria-label"];
  const themedIcon = resolveThemeToggleIcon(currentTheme, nextTheme, {
    lightIcon,
    darkIcon,
    systemIcon,
  });
  const renderedIcon = cloneThemeToggleIcon(themedIcon);
  const content =
    typeof children === "function" ? children(renderContext) : (children ?? renderedIcon);

  return (
    <Button
      {...(rest as ButtonNativeProps)}
      aria-label={typeof ariaLabel === "string" ? ariaLabel : `Switch to ${nextTheme} theme`}
      data-theme-control="toggle"
      data-theme-choice={currentTheme}
      data-next-theme={nextTheme}
      onPress={(event) => {
        onPress?.(event);
        if (!event.defaultPrevented && !Object.is(nextTheme, currentTheme)) {
          theme.setTheme(nextTheme);
        }
      }}
    >
      <span data-slot="theme-toggle-content">{content}</span>
    </Button>
  );
}

function getNextTheme(currentTheme: ThemeName, themes: readonly ThemeName[]): ThemeName {
  if (themes.length === 0) return currentTheme;
  const index = themes.indexOf(currentTheme);
  return themes[index >= 0 && index < themes.length - 1 ? index + 1 : 0]!;
}

function getThemeIcon(
  theme: ThemeName,
  icons: Pick<ThemeToggleProps, "lightIcon" | "darkIcon" | "systemIcon">,
): unknown {
  if (theme === "light") return icons.lightIcon;
  if (theme === "dark") return icons.darkIcon;
  if (theme === "system") return icons.systemIcon;
  return undefined;
}

export function resolveThemeToggleIcon(
  theme: ThemeName,
  nextTheme: ThemeName,
  icons: Pick<ThemeToggleProps, "lightIcon" | "darkIcon" | "systemIcon">,
): unknown {
  return getThemeIcon(theme, icons) ?? getThemeIcon(nextTheme, icons);
}

function isJSXElement(value: unknown): value is JSXElement {
  return (
    typeof value === "object" &&
    value !== null &&
    "$$typeof" in value &&
    "type" in value &&
    "props" in value
  );
}

function cloneThemeToggleIcon(icon: unknown): unknown {
  if (!isJSXElement(icon)) return icon;

  const props = icon.props as Record<string, unknown> | undefined;
  if (!props || Object.keys(props).length === 0) {
    return icon;
  }

  return {
    ...icon,
    props: { ...props },
  };
}

function syncThemeRoot(
  themeChoice: ThemeName | null | undefined,
  options?: { expectedRevision?: number; passive?: boolean; providerId?: symbol },
): void {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;

  if (
    options?.passive &&
    options.expectedRevision !== undefined &&
    options.expectedRevision !== rootThemeRevision
  ) {
    return;
  }

  if (
    options?.passive &&
    explicitRootThemeOwner !== undefined &&
    explicitRootThemeOwner !== options.providerId
  ) {
    return;
  }

  if (themeChoice == null) {
    html.removeAttribute("data-theme");
    html.removeAttribute("data-theme-choice");
    return;
  }

  html.setAttribute("data-theme-choice", themeChoice);

  if (themeChoice === "system") {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", themeChoice);
  }
}

function readStoredTheme(storageKey: string): ThemeName | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    return storedTheme ? (storedTheme as ThemeName) : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredTheme(storageKey: string, theme: ThemeName): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }
}
