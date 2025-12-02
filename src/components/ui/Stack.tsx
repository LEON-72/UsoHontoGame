/**
 * Stack Component
 * Feature: 009-apple-hig-ui-redesign
 * Content deference through consistent spacing between elements
 */

'use client';

import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/lib/design-system/classNames';
import type { SpacingSize } from '@/lib/design-system/spacing';

/**
 * Stack direction variants
 */
export type StackDirection = 'vertical' | 'horizontal';

/**
 * Alignment options for cross-axis
 */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Justify options for main-axis
 */
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * HTML elements that can be used for the stack
 */
export type StackElement = 'div' | 'section' | 'ul' | 'ol' | 'nav';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Stack content */
  children: ReactNode;
  /** Stack direction */
  direction?: StackDirection;
  /** Spacing between items using design system spacing scale */
  spacing?: SpacingSize;
  /** Cross-axis alignment */
  align?: StackAlign;
  /** Main-axis justification */
  justify?: StackJustify;
  /** Allow wrapping of items */
  wrap?: boolean;
  /** HTML element to render as */
  as?: StackElement;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Stack Component
 *
 * Apple HIG-compliant layout component for arranging children with
 * consistent spacing. Supports vertical and horizontal layouts with
 * flexible alignment and spacing options.
 *
 * @example
 * ```tsx
 * <Stack spacing="lg">
 *   <input type="text" />
 *   <input type="email" />
 *   <button>Submit</button>
 * </Stack>
 * ```
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" spacing="md" align="center">
 *   <button>Cancel</button>
 *   <button>Save</button>
 * </Stack>
 * ```
 *
 * @example
 * ```tsx
 * <Stack as="nav" direction="horizontal" justify="between">
 *   <a href="/">Home</a>
 *   <a href="/about">About</a>
 * </Stack>
 * ```
 */
export function Stack({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify,
  wrap = false,
  as: Component = 'div',
  className,
  ...props
}: StackProps) {
  // Base styles
  const baseStyles = classNames('stack-base', 'flex');

  // Direction styles
  const directionStyles = {
    vertical: classNames('stack-vertical', 'flex-col'),
    horizontal: classNames('stack-horizontal', 'flex-row'),
  };

  // Spacing styles (gap)
  const spacingMap: Record<SpacingSize, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16',
  };

  // Alignment styles (cross-axis)
  const alignMap: Record<StackAlign, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  // Justify styles (main-axis)
  const justifyMap: Record<StackJustify, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // Wrap styles
  const wrapStyles = wrap ? 'flex-wrap' : '';

  const stackClassName = classNames(
    baseStyles,
    directionStyles[direction],
    spacingMap[spacing],
    alignMap[align],
    justify ? justifyMap[justify] : '',
    wrapStyles,
    className
  );

  return (
    <Component className={stackClassName} {...props}>
      {children}
    </Component>
  );
}
