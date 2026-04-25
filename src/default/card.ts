import {
  Card as ThemeAgnosticCard,
  CardContent as ThemeAgnosticCardContent,
  CardDescription as ThemeAgnosticCardDescription,
  CardFooter as ThemeAgnosticCardFooter,
  CardHeader as ThemeAgnosticCardHeader,
  CardTitle as ThemeAgnosticCardTitle,
} from "../components/card";
import type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardPadding,
  CardProps,
  CardTitleProps,
  CardVariant,
} from "../components/card";

import "../themes/default/components/card.css";

export type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardPadding,
  CardProps,
  CardTitleProps,
  CardVariant,
};

export const Card = ThemeAgnosticCard;
export const CardHeader = ThemeAgnosticCardHeader;
export const CardTitle = ThemeAgnosticCardTitle;
export const CardDescription = ThemeAgnosticCardDescription;
export const CardContent = ThemeAgnosticCardContent;
export const CardFooter = ThemeAgnosticCardFooter;
