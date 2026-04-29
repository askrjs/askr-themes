export type IconSizeToken = "sm" | "md" | "lg" | "xl";

export type LogoStyleObject = Record<string, unknown>;

export type LogoOwnProps = {
  size?: number | string;
  title?: string;
  class?: string;
  style?: string | LogoStyleObject;
  iconName?: string;
};

export type LogoProps = Omit<
  JSX.IntrinsicElements["svg"],
  "children" | "class" | "height" | "ref" | "role" | "stroke" | "style" | "title" | "width"
> &
  LogoOwnProps & {
    children?: unknown;
    ref?: unknown;
  };

export type LogoNode = ReadonlyArray<
  readonly [tag: string, attrs: Readonly<Record<string, string>>]
>;
