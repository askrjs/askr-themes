import type { JSX } from "@askrjs/askr/jsx-runtime";
import { DropdownContent as UiDropdownContent } from "@askrjs/ui";
import type { DropdownContentAsChildProps, DropdownContentProps } from "@askrjs/ui";

type DropdownContentBodyProps = {
  render: () => unknown;
};

function DropdownContentBody(props: DropdownContentBodyProps): JSX.Element {
  return <>{props.render()}</>;
}

/**
 * Dropdown/context-menu content wrapper around `@askrjs/ui`'s `DropdownContent`.
 * Non-`asChild` usage lazily evaluates `children` inside a body component so
 * they're only rendered once the dropdown is actually open.
 */
export function DropdownContent(props: DropdownContentProps): JSX.Element | null;
export function DropdownContent(props: DropdownContentAsChildProps): JSX.Element | null;
export function DropdownContent(
  props: DropdownContentProps | DropdownContentAsChildProps,
): JSX.Element | null {
  if ("asChild" in props && props.asChild) {
    return <UiDropdownContent {...props} />;
  }

  const { children, ...rest } = props as DropdownContentProps;

  return (
    <UiDropdownContent {...rest}>
      <DropdownContentBody render={() => children} />
    </UiDropdownContent>
  );
}
