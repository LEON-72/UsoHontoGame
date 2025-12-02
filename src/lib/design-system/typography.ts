/**
 * Typography Utility
 * Feature: 009-apple-hig-ui-redesign
 * Typography system based on Apple HIG type scale
 */

import type { CSSProperties } from 'react';
import { classNames } from './classNames';

/**
 * Text variant types following Apple HIG type scale
 */
export type TextVariant =
  | 'display' // Largest text (28px)
  | 'title-1' // Large title (22px)
  | 'title-2' // Medium title (20px)
  | 'title-3' // Small title (18px)
  | 'headline' // Emphasized body (16px semibold)
  | 'body' // Standard body text (16px)
  | 'callout' // Slightly smaller body (15px)
  | 'subhead' // Section subheading (14px)
  | 'footnote' // Secondary info (13px)
  | 'caption-1' // Small caption (12px)
  | 'caption-2'; // Smallest caption (11px);

/**
 * Font weight options
 */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Text color options
 */
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';

/**
 * Typography options interface
 */
export interface TypographyOptions {
  /** Text variant following Apple HIG type scale */
  variant: TextVariant;
  /** Font weight (optional, uses variant default if not specified) */
  weight?: TextWeight;
  /** Text color (optional) */
  color?: TextColor;
}

/**
 * Get className for text variant
 *
 * @param options - Typography options
 * @returns Combined className string
 *
 * @example
 * ```tsx
 * <h1 className={getTextClassName({ variant: 'display', weight: 'bold' })}>
 *   Page Title
 * </h1>
 * ```
 */
export function getTextClassName(options: TypographyOptions): string {
  const { variant, weight, color } = options;

  const variantClass = `text-${variant}`;
  const weightClass = weight ? `font-${weight}` : undefined;
  const colorClass = color ? `text-${color}` : undefined;

  return classNames(variantClass, weightClass, colorClass);
}

/**
 * Variant to default weight mapping
 */
const variantWeightMap: Record<TextVariant, TextWeight> = {
  display: 'bold',
  'title-1': 'bold',
  'title-2': 'bold',
  'title-3': 'semibold',
  headline: 'semibold',
  body: 'regular',
  callout: 'regular',
  subhead: 'regular',
  footnote: 'regular',
  'caption-1': 'regular',
  'caption-2': 'regular',
};

/**
 * Get inline style object for text variant
 *
 * Useful for dynamic styling or when className approach is not suitable.
 * Returns CSS custom property references for theming support.
 *
 * @param options - Typography options
 * @returns CSSProperties object
 *
 * @example
 * ```tsx
 * <p style={getTextStyle({ variant: 'body', color: 'secondary' })}>
 *   Dynamic text
 * </p>
 * ```
 */
export function getTextStyle(options: TypographyOptions): CSSProperties {
  const { variant, weight, color } = options;

  // Get default weight for variant, or use specified weight
  const effectiveWeight = weight || variantWeightMap[variant];

  const style: CSSProperties = {
    fontSize: `var(--font-size-${variant})`,
    lineHeight: `var(--line-height-${variant})`,
    fontWeight: `var(--font-weight-${effectiveWeight})`,
  };

  // Add color if specified
  if (color) {
    if (color === 'error' || color === 'success') {
      style.color = `var(--color-${color})`;
    } else {
      style.color = `var(--text-${color})`;
    }
  }

  return style;
}

/**
 * Typography class name constants for direct use
 */
export const textVariants = {
  display: 'text-display',
  'title-1': 'text-title-1',
  'title-2': 'text-title-2',
  'title-3': 'text-title-3',
  headline: 'text-headline',
  body: 'text-body',
  callout: 'text-callout',
  subhead: 'text-subhead',
  footnote: 'text-footnote',
  'caption-1': 'text-caption-1',
  'caption-2': 'text-caption-2',
} as const;

/**
 * Font weight class name constants
 */
export const fontWeights = {
  regular: 'font-regular',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * Text color class name constants
 */
export const textColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  error: 'text-error',
  success: 'text-success',
} as const;
