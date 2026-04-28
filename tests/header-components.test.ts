import { describe, expect, it } from 'vite-plus/test';

import { Header } from '../src/components';

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe('header component', () => {
  it('renders the shell slot contract with a position variant', () => {
    const element = asElement(Header({ children: 'content', position: 'sticky', class: 'app-header' }));

    expect(element.type).toBe('header');
    expect(element.props.class).toBe('header app-header');
    expect(element.props['data-slot']).toBe('header');
    expect(element.props['data-position']).toBe('sticky');
  });

  it('defaults to a static header when no position is provided', () => {
    const element = asElement(Header({ children: 'content' }));

    expect(element.props['data-position']).toBe('static');
  });
});