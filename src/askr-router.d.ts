declare module "@askrjs/askr/router" {
  export type LinkProps = Omit<
    JSX.IntrinsicElements["a"],
    "children" | "href" | "class" | "rel" | "target" | "aria-current" | "aria-label"
  > & {
    href: string;
    class?: string;
    children?: unknown;
    rel?: string;
    target?: string;
    "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false";
    "aria-label"?: string;
  };

  export function Link(props: LinkProps): JSX.Element;
}
