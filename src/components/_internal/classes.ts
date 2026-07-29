export type ClassAccessor = () => string | undefined;

function readClassValue(value: unknown): string | undefined {
  const resolved = typeof value === "function" ? (value as () => unknown)() : value;
  return typeof resolved === "string" && resolved.trim() ? resolved.trim() : undefined;
}

export function classes(...values: Array<unknown>): string | ClassAccessor | undefined {
  if (values.some((value) => typeof value === "function")) {
    return () => {
      const value = values.map(readClassValue).filter(Boolean).join(" ");
      return value || undefined;
    };
  }

  const value = values.map(readClassValue).filter(Boolean).join(" ");
  return value || undefined;
}
