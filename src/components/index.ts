import "../themes/default/index.css";

// Theme controls
export { Button } from "@askrjs/ui";
export type {
  ButtonAsChildProps,
  ButtonNativeProps,
  ButtonOwnProps,
  ButtonProps,
} from "@askrjs/ui";
export { DEFAULT_THEME_OPTIONS, ThemePicker, ThemeProvider, ThemeToggle, useTheme } from "./theme";
export type {
  ThemeContextValue,
  ThemeName,
  ThemeOption,
  ThemePickerProps,
  ThemeProviderProps,
  ThemeToggleProps,
  ThemeToggleRenderContext,
} from "./theme";

// Visual primitives
export { Badge } from "./badge";
export type { BadgeProps } from "./badge";
export { AccessibleIcon } from "./accessible-icon";
export type { AccessibleIconProps } from "./accessible-icon";
export { AspectRatio } from "./aspect-ratio";
export type { AspectRatioAsChildProps, AspectRatioProps } from "./aspect-ratio";
export { Box } from "./box";
export type { BoxProps } from "./box";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "./card";
export { Container } from "./container";
export type { ContainerProps, ContainerVariant } from "./container";
export { Flex } from "./flex";
export type { FlexProps } from "./flex";
export { Grid } from "./grid";
export type { GridProps } from "./grid";
export { Inline } from "./inline";
export type { InlineProps } from "./inline";
export { GitHubLogo, GoogleLogo, MicrosoftLogo } from "./logos";
export type { LogoProps } from "./logos";
export { Section } from "./section";
export type { SectionProps } from "./section";
export { Divider, Separator } from "./separator";
export type { DividerProps, SeparatorProps } from "./separator";
export { Skeleton } from "./skeleton";
export type { SkeletonProps } from "./skeleton";
export { Spacer } from "./spacer";
export type { SpacerProps } from "./spacer";
export { Stack } from "./stack";
export type { StackProps } from "./stack";

// Theme-owned wrappers
export {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./breadcrumb";
export type {
  BreadcrumbAsChildProps,
  BreadcrumbCurrentAsChildProps,
  BreadcrumbCurrentProps,
  BreadcrumbItemAsChildProps,
  BreadcrumbItemProps,
  BreadcrumbLinkAsChildProps,
  BreadcrumbLinkProps,
  BreadcrumbListAsChildProps,
  BreadcrumbListProps,
  BreadcrumbOwnProps,
  BreadcrumbProps,
  BreadcrumbSeparatorAsChildProps,
  BreadcrumbSeparatorProps,
} from "./breadcrumb";
export { Spinner } from "./spinner";
export type { SpinnerOwnProps, SpinnerProps } from "./spinner";

// Empty state
export { EmptyState } from "./empty-state";
export type { EmptyStateHeadingTag, EmptyStateProps } from "./empty-state";

// Shell / chrome
export { Header } from "./header";
export type { HeaderPosition, HeaderProps } from "./header";
export { NavBrand, Navbar, NavGroup, NavItem, NavLink } from "./navbar";
export type {
  NavBrandProps,
  NavbarProps,
  NavGroupProps,
  NavItemAsChildProps,
  NavItemProps,
  NavItemVariant,
  NavLinkProps,
} from "./navbar";
export { SidebarLayout } from "./sidebar-layout";
export type { SidebarLayoutProps, SidebarPosition } from "./sidebar-layout";
export { TopbarLayout } from "./topbar-layout";
export type { TopbarLayoutProps } from "./topbar-layout";
