import { isCssLength, mergeLayoutStyles, serializeValueIf } from '../_internal/layout';
import type { TopbarLayoutProps } from './topbar-layout.types';

function isThemeGapToken(value: unknown): value is string {
  return typeof value === 'string' && ['sm', 'md', 'lg', 'xl'].includes(value.trim());
}

export function TopbarLayout(props: TopbarLayoutProps): JSX.Element {
  const {
    topbar,
    children,
    topbarHeight,
    gap,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const wrapperStyle: Record<string, string | number> = {};
  if (isCssLength(gap)) wrapperStyle.gap = gap!;

  const navbarStyle: Record<string, string | number> = {};
  if (isCssLength(topbarHeight)) navbarStyle.height = topbarHeight!;

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="topbar-layout"
      data-gap={serializeValueIf(gap, isThemeGapToken)}
      style={mergeLayoutStyles(wrapperStyle, userStyle)}
    >
      {[
        <header
          key="topbar-layout-navbar"
          data-slot="navbar"
          style={mergeLayoutStyles(navbarStyle, undefined)}
        >
          {topbar}
        </header>,
        <main key="topbar-layout-main" data-slot="main">
          {children}
        </main>,
      ]}
    </div>
  );
}
