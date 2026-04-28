import type { HeaderProps } from './header.types';

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === 'string' && item.trim()).join(' ');
  return value || undefined;
}

export function Header(props: HeaderProps): JSX.Element {
  const {
    children,
    position = 'static',
    ref,
    class: className,
    ...rest
  } = props;

  return (
    <header
      {...rest}
      ref={ref}
      class={classes('header', className)}
      data-slot="header"
      data-position={position}
    >
      {children}
    </header>
  );
}