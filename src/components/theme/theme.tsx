import { defineContext, readContext, state } from "@askrjs/askr";
import { Button } from "@askrjs/askr-ui";
import type { ButtonNativeProps, PressEvent } from "@askrjs/askr-ui";

export type ThemeName = "light" | "dark" | "system" | (string & {});

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

export type ThemeProviderProps = Omit<
  JSX.IntrinsicElements["div"],
  "children" | "defaultValue" | "onChange"
> & {
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
  toggleThemes?: readonly ThemeName[];
  onPress?: (event: PressEvent) => void;
};

export const DEFAULT_THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const THEME_PROVIDER_SELECTOR =
  '[data-slot="theme-provider"][data-theme-choice]';
const DEFAULT_STORAGE_KEY = "askr-theme";

let themeSyncObserver: MutationObserver | undefined;

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
    ...rest
  } = props;

  const themeState = state<ThemeName>(readStoredTheme(storageKey) ?? defaultTheme);

  const setTheme = (nextTheme: ThemeName) => {
    themeState.set(nextTheme);
    writeStoredTheme(storageKey, nextTheme);
  };

  const value: ThemeContextValue = {
    theme: themeState,
    setTheme,
    themes,
    storageKey,
  };

  const currentTheme = themeState();
  ensureThemeSyncObserver();

  return (
    <ThemeContext.Scope value={value}>
      <div
        {...rest}
        data-slot="theme-provider"
        data-theme-choice={currentTheme}
      >
        {children}
      </div>
    </ThemeContext.Scope>
  );
}

export function ThemePicker(props: ThemePickerProps): JSX.Element {
  const theme = useTheme();
  const { themes = theme.themes, label = "Theme", ...rest } = props;

  return (
    <select
      {...rest}
      aria-label={rest["aria-label"] ?? label}
      data-slot="theme-picker"
      value={theme.theme()}
      onChange={(event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        theme.setTheme(target.value as ThemeName);
      }}
    >
      {themes.map((option) => (
        <option value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function ThemeToggle(props: ThemeToggleProps): JSX.Element {
  const theme = useTheme();
  const {
    children,
    lightIcon,
    darkIcon,
    systemIcon,
    toggleThemes = ["light", "dark"],
    onPress,
    ...rest
  } = props;

  const currentTheme = theme.theme();
  const nextTheme = getNextTheme(currentTheme, toggleThemes);
  const renderContext = { theme: currentTheme, nextTheme };
  const ariaLabel = (rest as Record<string, unknown>)["aria-label"];
  const themedIcon = resolveThemeToggleIcon(currentTheme, nextTheme, {
    lightIcon,
    darkIcon,
    systemIcon,
  });
  const content =
    typeof children === "function"
      ? children(renderContext)
      : children ?? themedIcon;

  return (
    <Button
      {...(rest as ButtonNativeProps)}
      aria-label={
        typeof ariaLabel === "string"
          ? ariaLabel
          : `Switch to ${nextTheme} theme`
      }
      data-theme-control="toggle"
      data-theme-choice={currentTheme}
      data-next-theme={nextTheme}
      onPress={(event) => {
        onPress?.(event);
        if (!event.defaultPrevented) theme.setTheme(nextTheme);
      }}
    >
      {content}
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

// Keep the document root in sync so theme tokens cascade globally and the
// active provider can be restored after unmounts or route changes.
function ensureThemeSyncObserver(): void {
  if (
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined" ||
    themeSyncObserver
  ) {
    return;
  }

  themeSyncObserver = new MutationObserver((records) => {
    if (!records.some(shouldSyncThemeRoot)) {
      return;
    }

    syncThemeRootFromProviders();
  });

  themeSyncObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-theme-choice"],
  });
}

function shouldSyncThemeRoot(record: MutationRecord): boolean {
  if (record.type === "attributes") {
    const target = record.target;
    return target instanceof Element && target.matches(THEME_PROVIDER_SELECTOR);
  }

  for (const node of record.addedNodes) {
    if (nodeContainsThemeProvider(node)) {
      return true;
    }
  }

  for (const node of record.removedNodes) {
    if (nodeContainsThemeProvider(node)) {
      return true;
    }
  }

  return false;
}

function nodeContainsThemeProvider(node: Node): boolean {
  if (!(node instanceof Element)) {
    return false;
  }

  return (
    node.matches(THEME_PROVIDER_SELECTOR) ||
    node.querySelector(THEME_PROVIDER_SELECTOR) !== null
  );
}

function syncThemeRootFromProviders(): void {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;
  const activeProvider = getActiveThemeProvider();
  const themeChoice =
    activeProvider?.getAttribute("data-theme-choice") as ThemeName | null;

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

function getActiveThemeProvider(): Element | null {
  if (typeof document === "undefined") {
    return null;
  }

  const providers = document.querySelectorAll(THEME_PROVIDER_SELECTOR);
  return providers.item(providers.length - 1);
}

function readStoredTheme(storageKey: string): ThemeName | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(storageKey) as ThemeName | null ?? undefined;
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
