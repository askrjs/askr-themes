import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type {
  FooterContentProps,
  FooterDescriptionProps,
  FooterLinkProps,
  FooterLinksProps,
  FooterProps,
  FooterSectionProps,
  FooterTitleProps,
} from "./footer.types";

/** Renders a `<footer>`-element {@link Block} with a muted background and top border. */
export function Footer(props: FooterProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="footer" background="muted" borderTop {...rest} data-slot="footer">
      {children}
    </Block>
  );
}

/** Renders the main content wrapper of a {@link Footer}. */
export function FooterContent(props: FooterContentProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-content", className),
    "data-slot": "footer-content",
  });

  return <div {...finalProps}>{children}</div>;
}

/** Renders a grouped section within a {@link Footer}. */
export function FooterSection(props: FooterSectionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-section", className),
    "data-slot": "footer-section",
  });

  return <div {...finalProps}>{children}</div>;
}

/** Renders a section title (`<h2>`) within a {@link Footer}. */
export function FooterTitle(props: FooterTitleProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-title", className),
    "data-slot": "footer-title",
  });

  return <h2 {...finalProps}>{children}</h2>;
}

/** Renders supporting description text within a {@link Footer}. */
export function FooterDescription(props: FooterDescriptionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-description", className),
    "data-slot": "footer-description",
  });

  return <p {...finalProps}>{children}</p>;
}

/** Renders a `<nav>` wrapper for a group of {@link FooterLink}s. */
export function FooterLinks(props: FooterLinksProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-links", className),
    "data-slot": "footer-links",
  });

  return <nav {...finalProps}>{children}</nav>;
}

/** Renders a single link within a {@link Footer}. */
export function FooterLink(props: FooterLinkProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-link", className),
    "data-slot": "footer-link",
  });

  return <a {...finalProps}>{children}</a>;
}
