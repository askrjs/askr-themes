import { classes } from '../_internal/classes';
import type { HeaderProps } from './header.types';

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