type Handler = (...args: readonly unknown[]) => void;
type Ref<T> = { current: T | null } | ((value: T | null) => void) | null | undefined;

function isEventHandlerKey(key: string): boolean {
  return key.startsWith("on");
}

function isDefaultPrevented(value: unknown): value is { defaultPrevented: true } {
  return (
    typeof value === "object" &&
    value !== null &&
    "defaultPrevented" in value &&
    (value as { defaultPrevented?: boolean }).defaultPrevented === true
  );
}

function composeHandlers(first: Handler, second: Handler): Handler {
  return (...args) => {
    first(...args);

    if (isDefaultPrevented(args[0])) {
      return;
    }

    second(...args);
  };
}

function setRef<T>(ref: Ref<T>, value: T | null): void {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (Object.isExtensible(ref)) {
    (ref as { current: T | null }).current = value;
  }
}

function composeRefs<T>(...refs: Array<Ref<T>>): (value: T | null) => void {
  return (value: T | null) => {
    for (const ref of refs) {
      setRef(ref, value);
    }
  };
}

export function mergeProps<TBase extends object, TInjected extends object>(
  base: TBase,
  injected: TInjected,
): TInjected & TBase {
  const baseKeys = Object.keys(base);
  if (baseKeys.length === 0) {
    return injected as TInjected & TBase;
  }

  const out = { ...(injected as object) } as TInjected & TBase;

  for (const key of baseKeys as Array<Extract<keyof TBase, string>>) {
    const baseValue = (base as Record<string, unknown>)[key];
    const injectedValue = (injected as Record<string, unknown>)[key];

    if (key === "ref") {
      (out as Record<string, unknown>)[key] = composeRefs(
        injectedValue as Ref<unknown>,
        baseValue as Ref<unknown>,
      );
      continue;
    }

    if (
      isEventHandlerKey(key) &&
      typeof baseValue === "function" &&
      typeof injectedValue === "function"
    ) {
      (out as Record<string, unknown>)[key] = composeHandlers(
        injectedValue as Handler,
        baseValue as Handler,
      );
      continue;
    }

    (out as Record<string, unknown>)[key] = baseValue;
  }

  return out;
}
