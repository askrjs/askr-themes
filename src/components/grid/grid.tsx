import { For } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/askr-ui/foundations';
import {
  applyBoxLayoutStyles,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../_internal/box-layout';
import { isJsxElement, toChildArray } from '../_internal/jsx';
import {
  isResponsiveValue,
  resolveAlignValue,
  resolveGridTrackValue,
  resolveJustifyValue,
  resolveSpaceValue,
  serializeResponsiveValueIf,
  serializeValueIf,
  setResponsiveStyleVar,
} from '../_internal/layout';
import type {
  GridAsChildProps,
  GridDivProps,
  GridSpanProps,
} from './grid.types';

const SPACE_TOKENS = new Set([
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
]);

function isResponsiveObject(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCssCoveredSpaceValue(value: unknown): value is string {
  return typeof value === 'string' && SPACE_TOKENS.has(value.trim());
}

function isCssCoveredAlignValue(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ['start', 'end', 'center', 'stretch', 'baseline'].includes(value.trim())
  );
}

function isCssCoveredJustifyValue(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ['start', 'end', 'center', 'between'].includes(value.trim())
  );
}

function isCssCoveredGridColumnValue(value: unknown): boolean {
  return typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()));
}

function isCssCoveredAutoFitValue(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function serializeStaticThemeValue<T>(
  value: T | Partial<Record<'initial' | 'sm' | 'md' | 'lg' | 'xl', T>> | undefined,
  predicate: (value: T) => boolean
): string | undefined {
  if (isResponsiveValue(value)) return undefined;
  return serializeResponsiveValueIf(value, predicate);
}

function resolveCompatibilityGridTemplate(
  minItemWidth: string | undefined,
  autoFit: boolean | undefined
): string | undefined {
  if (!minItemWidth) return undefined;
  const fitKeyword = autoFit === false ? 'auto-fill' : 'auto-fit';
  return `repeat(${fitKeyword}, minmax(${minItemWidth}, 1fr))`;
}

export function Grid(props: GridDivProps): JSX.Element;
export function Grid(props: GridSpanProps): JSX.Element;
export function Grid(props: GridAsChildProps): JSX.Element;
export function Grid(props: GridDivProps | GridSpanProps | GridAsChildProps) {
  const as = 'as' in props ? props.as : 'div';
  const {
    asChild,
    children,
    areas,
    columns,
    rows,
    flow,
    gap,
    gapX,
    gapY,
    align,
    justify,
    minItemWidth,
    autoFit,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  if (boxProps.display !== undefined) {
    setResponsiveStyleVar(layoutStyle, 'display', boxProps.display, (value) => value);
  }
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-areas',
    areas,
    (value) => value
  );
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-columns',
    columns ?? resolveCompatibilityGridTemplate(minItemWidth, autoFit),
    resolveGridTrackValue
  );
  setResponsiveStyleVar(
    layoutStyle,
    'grid-template-rows',
    rows,
    resolveGridTrackValue
  );
  setResponsiveStyleVar(layoutStyle, 'grid-auto-flow', flow, (value) => value);
  if (!isCssCoveredSpaceValue(gap) || isResponsiveObject(gap)) {
    setResponsiveStyleVar(layoutStyle, 'gap', gap, resolveSpaceValue);
  }
  if (!isCssCoveredSpaceValue(gapX) || isResponsiveObject(gapX)) {
    setResponsiveStyleVar(layoutStyle, 'column-gap', gapX, resolveSpaceValue);
  }
  if (!isCssCoveredSpaceValue(gapY) || isResponsiveObject(gapY)) {
    setResponsiveStyleVar(layoutStyle, 'row-gap', gapY, resolveSpaceValue);
  }
  if (!isCssCoveredAlignValue(align) || isResponsiveObject(align)) {
    setResponsiveStyleVar(layoutStyle, 'align-items', align, resolveAlignValue);
  }
  if (!isCssCoveredJustifyValue(justify) || isResponsiveObject(justify)) {
    setResponsiveStyleVar(
      layoutStyle,
      'justify-content',
      justify,
      resolveJustifyValue
    );
  }

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'grid',
    'data-ak-layout': 'true',
    'data-columns': serializeStaticThemeValue(columns, isCssCoveredGridColumnValue),
    'data-gap': serializeStaticThemeValue(gap, isCssCoveredSpaceValue),
    'data-gap-x': serializeStaticThemeValue(gapX, isCssCoveredSpaceValue),
    'data-gap-y': serializeStaticThemeValue(gapY, isCssCoveredSpaceValue),
    'data-align': serializeStaticThemeValue(align, isCssCoveredAlignValue),
    'data-justify': serializeStaticThemeValue(justify, isCssCoveredJustifyValue),
    'data-auto-fit': serializeValueIf(autoFit, isCssCoveredAutoFitValue),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });
  const keyedChildren = (
    <For
      each={() => toChildArray(children)}
      by={(child, index) =>
        isJsxElement(child) && child.key != null ? child.key : index
      }
    >
      {(child) => child as never}
    </For>
  );

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === 'span') {
    return <span {...finalProps}>{keyedChildren}</span>;
  }

  return <div {...finalProps}>{keyedChildren}</div>;
}
