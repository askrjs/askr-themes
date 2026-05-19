import type { JSXElement } from "@askrjs/askr/foundations";

export function isJsxElement(value: unknown): value is JSXElement {
  return typeof value === "object" && value !== null && "$$typeof" in value && "props" in value;
}

export function hasJsxIntrinsicType(value: unknown, expectedType: string): value is JSXElement {
  return isJsxElement(value) && value.type === expectedType;
}

export function toChildArray(children: unknown): unknown[] {
  if (Array.isArray(children)) {
    return children;
  }

  return children === undefined || children === null ? [] : [children];
}

export function mapJsxTree(children: unknown, mapper: (element: JSXElement) => unknown): unknown {
  if (Array.isArray(children)) {
    return children.map((child) => mapJsxTree(child, mapper));
  }

  if (!isJsxElement(children)) {
    return children;
  }

  const mapped = mapper(children);

  if (!isJsxElement(mapped)) {
    return mapped;
  }

  const currentChildren = mapped.props?.children;
  const nextChildren = mapJsxTree(currentChildren, mapper);

  if (nextChildren === currentChildren) {
    return mapped;
  }

  return {
    ...mapped,
    props: {
      ...mapped.props,
      children: nextChildren,
    },
  };
}

export function collectJsxElements(
  children: unknown,
  predicate?: (element: JSXElement) => boolean,
): JSXElement[] {
  const result: JSXElement[] = [];

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isJsxElement(value)) {
      return;
    }

    if (!predicate || predicate(value)) {
      result.push(value);
    }

    visit(value.props?.children);
  };

  visit(children);

  return result;
}

function serializeArray(value: readonly unknown[]): string {
  if (value.length === 0) {
    return "";
  }

  if (value.length === 1) {
    return serializeForId(value[0]);
  }

  let result = serializeForId(value[0]);

  for (let index = 1; index < value.length; index += 1) {
    result += `|${serializeForId(value[index])}`;
  }

  return result;
}

function serializeSerializableProps(props: Record<string, unknown>): string {
  const entries: Array<[string, string]> = [];

  for (const key of Object.keys(props)) {
    if (key === "children" || key === "ref" || key.startsWith("on")) {
      continue;
    }

    const entryValue = props[key];

    if (
      typeof entryValue === "string" ||
      typeof entryValue === "number" ||
      typeof entryValue === "boolean"
    ) {
      entries.push([key, String(entryValue)]);
    }
  }

  if (entries.length === 0) {
    return "";
  }

  if (entries.length > 1) {
    entries.sort(([left], [right]) => left.localeCompare(right));
  }

  let result = `${entries[0][0]}:${entries[0][1]}`;

  for (let index = 1; index < entries.length; index += 1) {
    result += `,${entries[index][0]}:${entries[index][1]}`;
  }

  return result;
}

export function extractTextContent(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (
    value === undefined ||
    value === null ||
    typeof value === "boolean" ||
    typeof value === "function"
  ) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (isJsxElement(value)) {
    return extractTextContent(value.props?.children);
  }

  return "";
}

export function serializeForId(value: unknown): string {
  if (Array.isArray(value)) {
    return serializeArray(value);
  }

  if (value === undefined || value === null || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (isJsxElement(value)) {
    const typeName =
      typeof value.type === "string"
        ? value.type
        : typeof value.type === "function"
          ? value.type.name || "component"
          : "component";
    const props = (value.props ?? {}) as Record<string, unknown>;
    const propEntries = serializeSerializableProps(props);
    const children = props.children;

    if (
      propEntries === "" &&
      (children === undefined || children === null || typeof children === "boolean")
    ) {
      return `${typeName}[]()`;
    }

    return `${typeName}[${propEntries}](${serializeForId(children)})`;
  }

  return typeof value;
}
