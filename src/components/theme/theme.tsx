import { defineScope, getSignal, readScope, state } from "@askrjs/askr";
import type { JSXElement } from "@askrjs/askr/foundations/structures";
import { Button } from "@askrjs/ui";
import type { ButtonNativeProps, PressEvent } from "@askrjs/ui";

export const CAT_THEME_NAMES = ["tabby", "ginger", "tuxedo", "calico", "torty"] as const;

export type CatThemeName = (typeof CAT_THEME_NAMES)[number];
export type ThemeName = "light" | "dark" | "system" | CatThemeName | (string & {});

export type ThemeOption = {
  value: ThemeName;
  label: string;
};

export type ThemeScopeValue = {
  theme: () => ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: readonly ThemeOption[];
  storageKey: string;
};

export type ThemeScopeProps = {
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
const STATIC_CHILDREN = Symbol.for("askr.static-children");
const STATIC_CHILD_SLOTS_CACHE = Symbol.for("__askrStaticChildSlots");
type ThemeCoordinator = ReturnType<typeof createThemeCoordinator>;
type InternalThemeScopeValue = ThemeScopeValue & {
  readonly coordinator: ThemeCoordinator | null;
  readonly depth: number;
};

const ThemeScopeContext = defineScope<InternalThemeScopeValue>({
  theme: () => "system",
  setTheme: () => undefined,
  themes: DEFAULT_THEME_OPTIONS,
  storageKey: DEFAULT_STORAGE_KEY,
  coordinator: null,
  depth: -1,
});

export function theme(): ThemeScopeValue {
  return readScope(ThemeScopeContext);
}

export function ThemeScope(props: ThemeScopeProps): JSX.Element {
  const {
    children,
    defaultTheme = "system",
    themes = DEFAULT_THEME_OPTIONS,
    storageKey = DEFAULT_STORAGE_KEY,
  } = props;

  const scopeId = state<symbol>(Symbol("ThemeScope"))();
  const scopeSignal = getSignal();
  const themeState = state<ThemeName>(readStoredTheme(storageKey) ?? defaultTheme);
  const currentTheme = themeState();
  const parentScope = readScope(ThemeScopeContext);
  const ownedCoordinator = state<ThemeCoordinator>(createThemeCoordinator())();
  const coordinator = parentScope.coordinator ?? ownedCoordinator;
  const scopeDepth = parentScope.depth + 1;
  coordinator.register(scopeId, scopeDepth, currentTheme, scopeSignal);

  const setTheme = (nextTheme: ThemeName) => {
    themeState.set(nextTheme);
    writeStoredTheme(storageKey, nextTheme);
    coordinator.activate(scopeId, nextTheme);
  };

  const value: InternalThemeScopeValue = {
    theme: themeState,
    setTheme,
    themes,
    storageKey,
    coordinator,
    depth: scopeDepth,
  };

  return (
    <ThemeScopeContext value={value}>
      <div
        data-slot="theme-scope"
        ref={parentScope.coordinator === null
          ? (element: HTMLElement | null) => coordinator.attach(element)
          : undefined}
      >
        {children}
      </div>
    </ThemeScopeContext>
  );
}

function createThemeCoordinator() {
  const scopes = new Map<symbol, {
    depth: number;
    sequence: number;
    theme: ThemeName;
    signal: AbortSignal;
  }>();
  let nextSequence = 0;
  let explicitOwner: symbol | undefined;
  let root: Node | null = null;
  let scheduled = false;

  const target = (): HTMLElement | null => {
    if (root?.nodeType === 9) return (root as Document).documentElement;
    if (root && "host" in root) return (root as ShadowRoot).host as HTMLElement;
    return typeof document === "undefined" ? null : document.documentElement;
  };
  const syncActive = (): void => {
    if (explicitOwner !== undefined) return;
    let candidate: { depth: number; sequence: number; theme: ThemeName } | undefined;
    for (const scope of scopes.values()) {
      if (!candidate || scope.depth > candidate.depth ||
        (scope.depth === candidate.depth && scope.sequence > candidate.sequence)) {
        candidate = scope;
      }
    }
    if (candidate) syncThemeTarget(target(), candidate.theme);
  };
  const schedule = (): void => {
    if (typeof document === "undefined" || scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      syncActive();
    }, 0);
  };

  return Object.freeze({
    attach(element: HTMLElement | null) {
      if (element) root = element.getRootNode();
      schedule();
    },
    register(id: symbol, depth: number, themeName: ThemeName, signal: AbortSignal) {
      const existing = scopes.get(id);
      scopes.set(id, {
        depth,
        sequence: existing?.sequence ?? nextSequence++,
        theme: themeName,
        signal,
      });
      if (!existing) {
        signal.addEventListener("abort", () => {
          scopes.delete(id);
          if (explicitOwner === id) explicitOwner = undefined;
          schedule();
        }, { once: true });
      }
      schedule();
    },
    activate(id: symbol, themeName: ThemeName) {
      const scope = scopes.get(id);
      if (scope) scope.theme = themeName;
      explicitOwner = id;
      syncThemeTarget(target(), themeName);
    },
  });
}

export function ThemePicker(props: ThemePickerProps): JSX.Element {
  const activeTheme = theme();
  const { themes = activeTheme.themes, label = "Theme", ...rest } = props;
  const currentTheme = activeTheme.theme();

  return (
    <select
      {...rest}
      aria-label={rest["aria-label"] ?? label}
      data-slot="theme-picker"
      value={currentTheme}
      onChange={(event: Event) => {
        const target = getThemePickerTarget(event);
        if (target) {
          activeTheme.setTheme(target.value as ThemeName);
        }
      }}
    >
      {themes.map((option) => (
        <option key={option.value} value={option.value} selected={option.value === currentTheme}>
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
  const activeTheme = theme();
  const {
    children,
    lightIcon,
    darkIcon,
    systemIcon,
    themes = ["light", "dark"],
    onPress,
    ...rest
  } = props;

  const currentTheme = activeTheme.theme();
  const nextTheme = getNextTheme(currentTheme, themes, getResolvedSystemTheme());
  const renderContext = { theme: currentTheme, nextTheme };
  const ariaLabel = (rest as Record<string, unknown>)["aria-label"];
  const themedIcon = resolveThemeToggleIcon(currentTheme, nextTheme, {
    lightIcon,
    darkIcon,
    systemIcon,
  });
  const renderedIcon = cloneThemeToggleIcon(themedIcon, currentTheme);
  const renderedIconSlots =
    renderThemeToggleIconSlots(currentTheme, {
      lightIcon,
      darkIcon,
      systemIcon,
    }) ?? renderedIcon;
  const content =
    typeof children === "function" ? children(renderContext) : (children ?? renderedIconSlots);

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
          activeTheme.setTheme(nextTheme);
        }
      }}
    >
      <span data-slot="theme-toggle-content">{content}</span>
    </Button>
  );
}

function getNextTheme(
  currentTheme: ThemeName,
  themes: readonly ThemeName[],
  resolvedSystemTheme: "light" | "dark" = "light",
): ThemeName {
  if (themes.length === 0) return currentTheme;
  const index = themes.indexOf(currentTheme);
  if (index < 0 && currentTheme === "system") {
    if (themes.includes("light") && themes.includes("dark")) {
      return resolvedSystemTheme === "dark" ? "light" : "dark";
    }
  }
  return themes[index >= 0 && index < themes.length - 1 ? index + 1 : 0]!;
}

function getResolvedSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

function renderThemeToggleIconSlots(
  theme: ThemeName,
  icons: Pick<ThemeToggleProps, "lightIcon" | "darkIcon" | "systemIcon">,
): unknown {
  if (getThemeIcon(theme, icons) === undefined) {
    return undefined;
  }

  const slots = [
    ["light", icons.lightIcon],
    ["dark", icons.darkIcon],
    ["system", icons.systemIcon],
  ] as const;
  const availableSlots = slots.filter(([, icon]) => icon !== undefined && icon !== null);

  if (availableSlots.length <= 1) {
    return undefined;
  }

  return availableSlots.map(([slotTheme, icon]) => (
    <span
      key={slotTheme}
      data-slot="theme-toggle-icon"
      data-theme-toggle-icon={slotTheme}
      hidden={slotTheme === theme ? undefined : true}
    >
      {cloneThemeToggleIcon(icon, slotTheme)}
    </span>
  ));
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

function cloneThemeToggleIcon(icon: unknown, key?: string): unknown {
  if (Array.isArray(icon)) {
    const clonedChildren = icon.map((child) => cloneThemeToggleIcon(child));
    if ((icon as unknown as Record<symbol, unknown>)[STATIC_CHILDREN] === true) {
      Object.defineProperty(clonedChildren, STATIC_CHILDREN, {
        value: true,
        configurable: true,
      });
    }
    return clonedChildren;
  }

  if (!isJSXElement(icon)) return icon;

  const props = icon.props as Record<string, unknown> | undefined;
  const clonedProps = props ? { ...props } : {};

  if ("children" in clonedProps) {
    clonedProps.children = cloneThemeToggleIcon(clonedProps.children);
  }

  const iconKey = (icon.key ?? key ?? null) as string | number | null;
  const clonedIcon = {
    ...icon,
    key: iconKey,
    props: clonedProps,
  };

  delete (clonedIcon as Record<symbol, unknown>)[STATIC_CHILD_SLOTS_CACHE];
  return clonedIcon;
}

function syncThemeTarget(
  html: HTMLElement | null,
  themeChoice: ThemeName | null | undefined,
): void {
  if (!html) return;

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
