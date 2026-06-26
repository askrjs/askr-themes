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

export function Footer(props: FooterProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="footer" background="muted" borderTop {...rest} data-slot="footer">
      {children}
    </Block>
  );
}

export function FooterContent(props: FooterContentProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-content", className),
    "data-slot": "footer-content",
  });

  return <div {...finalProps}>{children}</div>;
}

export function FooterSection(props: FooterSectionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-section", className),
    "data-slot": "footer-section",
  });

  return <div {...finalProps}>{children}</div>;
}

export function FooterTitle(props: FooterTitleProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-title", className),
    "data-slot": "footer-title",
  });

  return <h2 {...finalProps}>{children}</h2>;
}

export function FooterDescription(props: FooterDescriptionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-description", className),
    "data-slot": "footer-description",
  });

  return <p {...finalProps}>{children}</p>;
}

export function FooterLinks(props: FooterLinksProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-links", className),
    "data-slot": "footer-links",
  });

  return <nav {...finalProps}>{children}</nav>;
}

export function FooterLink(props: FooterLinkProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("footer-link", className),
    "data-slot": "footer-link",
  });

  return <a {...finalProps}>{children}</a>;
}
