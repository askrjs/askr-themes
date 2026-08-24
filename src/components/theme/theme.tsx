import type { JSX } from "@askrjs/askr/jsx-runtime";
import { defineScope, getSignal, readScope, state } from "@askrjs/askr";
import { cloneElement, isElement, type JSXElement } from "@askrjs/askr/foundations/structures";
import { Button } from "@askrjs/ui";
import type { ButtonNativeProps, PressEvent } from "@askrjs/ui";

/** Names of the built-in "cat" theme presets. */
export const CAT_THEME_NAMES = ["tabby", "ginger", "tuxedo", "calico", "torty"] as const;

/** A built-in "cat" theme name, one of {@link CAT_THEME_NAMES}. */
export type CatThemeName = (typeof CAT_THEME_NAMES)[number];
/** Any theme identifier accepted by {@link ThemeScope}: `"light"`, `"dark"`, `"system"`, a {@link CatThemeName}, or a custom string. */
export type ThemeName = "light" | "dark" | "system" | CatThemeName | (string & {});

/** A theme choice offered by {@link ThemePicker}/{@link ThemeToggle}: a `value` paired with a display `label`. */
export type ThemeOption = {
  value: ThemeName;
  label: string;
};

/** Value read from {@link theme}: the active theme, its resolved system value, a setter, and the available theme options. */
export type ThemeScopeValue = {
  theme: () => ThemeName;
  resolvedSystemTheme: () => "light" | "dark";
  setTheme: (theme: ThemeName) => void;
  themes: readonly ThemeOption[];
  storageKey: string;
};

/** Props for the {@link ThemeScope} component. */
export type ThemeScopeProps = {
  children?: unknown;
  defaultTheme?: ThemeName;
  themes?: readonly ThemeOption[];
  storageKey?: string;
};

/** Props for the {@link ThemePicker} component. */
export type ThemePickerProps = Omit<
  JSX.IntrinsicElements["select"],
  "children" | "value" | "defaultValue" | "onChange"
> & {
  themes?: readonly ThemeOption[];
  label?: string;
};

/** Render context passed to a function-as-children {@link ThemeToggleProps.children}. */
export type ThemeToggleRenderContext = {
  theme: ThemeName;
  nextTheme: ThemeName;
};

/** Props for the {@link ThemeToggle} component. */
export type ThemeToggleProps = Omit<ButtonNativeProps, "children" | "onPress"> & {
  children?: unknown | ((context: ThemeToggleRenderContext) => unknown);
  lightIcon?: unknown;
  darkIcon?: unknown;
  systemIcon?: unknown;
  themes?: readonly ThemeName[];
  onPress?: (event: PressEvent) => void;
};

/** Default light/dark/system theme options used by {@link ThemeScope} and {@link ThemePicker}. */
export const DEFAULT_THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Theme options for the built-in "cat" theme presets, keyed to {@link CAT_THEME_NAMES}. */
export const CAT_THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "tabby", label: "Tabby" },
  { value: "ginger", label: "Ginger" },
  { value: "tuxedo", label: "Tuxedo" },
  { value: "calico", label: "Calico" },
  { value: "torty", label: "Torty" },
];

const DEFAULT_STORAGE_KEY = "askr-theme";
const STATIC_CHILDREN = Symbol.for("askr.static-children");
const documentThemeCoordinators = new WeakMap<Document, ThemeCoordinator>();
type ThemeCoordinator = ReturnType<typeof createThemeCoordinator>;
type InternalThemeScopeValue = ThemeScopeValue & {
  readonly coordinator: ThemeCoordinator | null;
  readonly depth: number;
};
type ThemeScopeLifecycle = {
  cleanupSignal: AbortSignal | null;
  coordinatorAttached: boolean;
  persistenceComplete: boolean;
  storageKey: string;
  storageListener: ((event: StorageEvent) => void) | null;
  storageWindow: Window | null;
};

function detachThemeScopeStorage(lifecycle: ThemeScopeLifecycle): void {
  if (lifecycle.storageWindow && lifecycle.storageListener) {
    lifecycle.storageWindow.removeEventListener("storage", lifecycle.storageListener);
  }
  lifecycle.storageListener = null;
  lifecycle.storageWindow = null;
}

const ThemeScopeContext = defineScope<InternalThemeScopeValue>({
  theme: () => "system",
  resolvedSystemTheme: () => "light",
  setTheme: () => undefined,
  themes: DEFAULT_THEME_OPTIONS,
  storageKey: DEFAULT_STORAGE_KEY,
  coordinator: null,
  depth: -1,
});

/** Reads the current {@link ThemeScopeValue} from the nearest enclosing {@link ThemeScope}. */
export function theme(): ThemeScopeValue {
  return readScope(ThemeScopeContext);
}

/**
 * Establishes a theme boundary: tracks the active theme (persisted to
 * `localStorage` under `storageKey` and synced across tabs/scopes), resolves
 * the OS `"system"` preference, and reflects the choice onto the DOM via
 * `data-theme`/`data-theme-choice` attributes. Nested scopes cooperate
 * through a shared coordinator so the deepest explicitly-set scope wins.
 */
export function ThemeScope(props: ThemeScopeProps): JSX.Element {
  const {
    children,
    defaultTheme = "system",
    themes = DEFAULT_THEME_OPTIONS,
    storageKey = DEFAULT_STORAGE_KEY,
  } = props;

  const scopeId = state<symbol>(Symbol("ThemeScope"))();
  const scopeSignal = getSignal();
  // The first render must be identical on the server and in the browser.
  // Browser persistence is adopted from the committed root ref, after Askr's
  // hydration verifier has accepted the server markup.
  const themeState = state<ThemeName>(defaultTheme);
  const localResolvedSystemTheme = state<"light" | "dark">("light");
  const lifecycle = state<ThemeScopeLifecycle>({
    cleanupSignal: null,
    coordinatorAttached: false,
    persistenceComplete: false,
    storageKey,
    storageListener: null,
    storageWindow: null,
  })();
  lifecycle.storageKey = storageKey;
  const currentTheme = themeState();
  const parentScope = readScope(ThemeScopeContext);
  const ownedCoordinator = state<ThemeCoordinator>(getDefaultThemeCoordinator())();
  const coordinator = parentScope.coordinator ?? ownedCoordinator;
  const scopeDepth = parentScope.depth + 1;
  coordinator.register(scopeId, scopeDepth, storageKey, currentTheme, scopeSignal, (nextTheme) => {
    if (themeState() !== nextTheme) themeState.set(nextTheme);
  });
  if (lifecycle.cleanupSignal !== scopeSignal) {
    lifecycle.cleanupSignal = scopeSignal;
    scopeSignal.addEventListener("abort", () => detachThemeScopeStorage(lifecycle), {
      once: true,
    });
  }

  const setTheme = (nextTheme: ThemeName) => {
    themeState.set(nextTheme);
    writeStoredTheme(storageKey, nextTheme);
    coordinator.activate(scopeId, nextTheme);
  };

  const resolvedSystemTheme = parentScope.coordinator
    ? parentScope.resolvedSystemTheme
    : localResolvedSystemTheme;
  const value: InternalThemeScopeValue = {
    theme: themeState,
    resolvedSystemTheme,
    setTheme,
    themes,
    storageKey,
    coordinator,
    depth: scopeDepth,
  };
  const bindScope = (element: HTMLElement | null) => {
    if (element && parentScope.coordinator === null && !lifecycle.coordinatorAttached) {
      lifecycle.coordinatorAttached = true;
      coordinator.attach(
        element,
        (nextTheme) => localResolvedSystemTheme.set(nextTheme),
        scopeSignal,
      );
    }

    const storageWindow = element?.ownerDocument.defaultView ?? null;
    if (storageWindow !== lifecycle.storageWindow) {
      detachThemeScopeStorage(lifecycle);
      if (storageWindow) {
        lifecycle.storageWindow = storageWindow;
        lifecycle.storageListener = (event) => {
          let storageMatches = event.storageArea == null;
          try {
            storageMatches ||= event.storageArea === storageWindow.localStorage;
          } catch {
            // Locked-down/private contexts may deny access to localStorage.
          }
          if (!storageMatches || event.key !== lifecycle.storageKey) {
            return;
          }
          const nextTheme = event.newValue as ThemeName | null;
          if (!nextTheme) return;
          themeState.set(nextTheme);
          coordinator.activate(scopeId, nextTheme);
        };
        storageWindow.addEventListener("storage", lifecycle.storageListener);
      }
    }

    if (!element || lifecycle.persistenceComplete) return;
    lifecycle.persistenceComplete = true;
    const storedTheme = readStoredTheme(storageKey);
    if (storedTheme && storedTheme !== themeState()) {
      themeState.set(storedTheme);
      coordinator.activate(scopeId, storedTheme);
    }
  };

  return (
    <ThemeScopeContext value={value}>
      <div data-slot="theme-scope" ref={bindScope}>
        {children}
      </div>
    </ThemeScopeContext>
  );
}

function getDefaultThemeCoordinator(): ThemeCoordinator {
  if (typeof document === "undefined") {
    return createThemeCoordinator();
  }

  const existing = documentThemeCoordinators.get(document);
  if (existing) return existing;

  const coordinator = createThemeCoordinator();
  documentThemeCoordinators.set(document, coordinator);
  return coordinator;
}

function removeEmptyGeneratedStyleRegistries(root: Node | null): void {
  const ownerDocument =
    root?.nodeType === 9
      ? (root as Document)
      : (root?.ownerDocument ?? (typeof document === "undefined" ? null : document));
  if (!ownerDocument) return;

  for (const registry of ownerDocument.querySelectorAll<HTMLStyleElement>(
    "style[data-askr-style-registry]",
  )) {
    if (!registry.textContent?.trim()) registry.remove();
  }
}

function createThemeCoordinator() {
  const scopes = new Map<
    symbol,
    {
      depth: number;
      identity: string;
      sequence: number;
      theme: ThemeName;
      signal: AbortSignal;
      onThemeChange: (themeName: ThemeName) => void;
    }
  >();
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
    let candidate:
      | { depth: number; identity: string; sequence: number; theme: ThemeName }
      | undefined;
    for (const scope of scopes.values()) {
      if (
        !candidate ||
        scope.depth > candidate.depth ||
        (scope.depth === candidate.depth &&
          scope.identity === candidate.identity &&
          scope.sequence > candidate.sequence)
      ) {
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
      if (scopes.size === 0) removeEmptyGeneratedStyleRegistries(root);
    }, 0);
  };

  return Object.freeze({
    attach(
      element: HTMLElement | null,
      onResolvedSystemTheme: (themeName: "light" | "dark") => void,
      signal: AbortSignal,
    ) {
      if (element) root = element.getRootNode();
      if (element && typeof window !== "undefined" && typeof window.matchMedia === "function") {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const update = () => onResolvedSystemTheme(media.matches ? "dark" : "light");
        update();
        media.addEventListener?.("change", update);
        signal.addEventListener("abort", () => media.removeEventListener?.("change", update), {
          once: true,
        });
      }
      schedule();
    },
    register(
      id: symbol,
      depth: number,
      identity: string,
      themeName: ThemeName,
      signal: AbortSignal,
      onThemeChange: (themeName: ThemeName) => void,
    ) {
      const existing = scopes.get(id);
      scopes.set(id, {
        depth,
        identity,
        sequence: existing?.sequence ?? nextSequence++,
        theme: themeName,
        signal,
        onThemeChange,
      });
      if (!existing) {
        signal.addEventListener(
          "abort",
          () => {
            scopes.delete(id);
            if (explicitOwner === id) explicitOwner = undefined;
            schedule();
          },
          { once: true },
        );
      }
      schedule();
    },
    activate(id: symbol, themeName: ThemeName) {
      const scope = scopes.get(id);
      if (!scope) return;
      scope.theme = themeName;
      const ownerDepth = scope.depth;
      const ownerIdentity = scope.identity;
      for (const [scopeId, registered] of scopes) {
        if (
          scopeId !== id &&
          registered.depth === ownerDepth &&
          registered.identity === ownerIdentity
        ) {
          registered.theme = themeName;
          registered.onThemeChange(themeName);
        }
      }
      const currentOwner = explicitOwner === undefined ? undefined : scopes.get(explicitOwner);
      if (!currentOwner || ownerDepth >= currentOwner.depth) {
        explicitOwner = id;
        syncThemeTarget(target(), themeName);
      }
    },
  });
}

/** A `<select>` bound to the current {@link theme}, listing `themes` (defaults to the enclosing scope's options). */
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

/**
 * A button that cycles through `themes` (defaults to `["light", "dark"]`) on
 * press. Supports icon props per theme, or a function-as-children render
 * prop receiving {@link ThemeToggleRenderContext}.
 */
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
  const nextTheme = getNextTheme(currentTheme, themes, activeTheme.resolvedSystemTheme());
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

  if (!isElement(icon)) return icon;

  const props = icon.props as Record<string, unknown> | undefined;
  const clonedProps = props ? { ...props } : {};

  if ("children" in clonedProps) {
    clonedProps.children = cloneThemeToggleIcon(clonedProps.children);
  }

  const clonedIcon = cloneElement(icon, clonedProps);
  return {
    ...clonedIcon,
    key: icon.key ?? key ?? null,
  } satisfies JSXElement;
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
