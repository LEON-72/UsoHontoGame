/**
 * Tests for typography utility
 * Feature: 009-apple-hig-ui-redesign
 * Typography system based on Apple HIG type scale
 */

import { describe, it, expect } from 'vitest';
import { getTextClassName, getTextStyle, type TextVariant, type TextWeight } from './typography';

describe('Typography Utility', () => {
  describe('getTextClassName', () => {
    describe('Text Variants', () => {
      it('should return className for display variant', () => {
        const className = getTextClassName({ variant: 'display' });
        expect(className).toContain('text-display');
      });

      it('should return className for title-1 variant', () => {
        const className = getTextClassName({ variant: 'title-1' });
        expect(className).toContain('text-title-1');
      });

      it('should return className for title-2 variant', () => {
        const className = getTextClassName({ variant: 'title-2' });
        expect(className).toContain('text-title-2');
      });

      it('should return className for title-3 variant', () => {
        const className = getTextClassName({ variant: 'title-3' });
        expect(className).toContain('text-title-3');
      });

      it('should return className for headline variant', () => {
        const className = getTextClassName({ variant: 'headline' });
        expect(className).toContain('text-headline');
      });

      it('should return className for body variant', () => {
        const className = getTextClassName({ variant: 'body' });
        expect(className).toContain('text-body');
      });

      it('should return className for callout variant', () => {
        const className = getTextClassName({ variant: 'callout' });
        expect(className).toContain('text-callout');
      });

      it('should return className for subhead variant', () => {
        const className = getTextClassName({ variant: 'subhead' });
        expect(className).toContain('text-subhead');
      });

      it('should return className for footnote variant', () => {
        const className = getTextClassName({ variant: 'footnote' });
        expect(className).toContain('text-footnote');
      });

      it('should return className for caption-1 variant', () => {
        const className = getTextClassName({ variant: 'caption-1' });
        expect(className).toContain('text-caption-1');
      });

      it('should return className for caption-2 variant', () => {
        const className = getTextClassName({ variant: 'caption-2' });
        expect(className).toContain('text-caption-2');
      });
    });

    describe('Text Weights', () => {
      it('should include regular weight', () => {
        const className = getTextClassName({ variant: 'body', weight: 'regular' });
        expect(className).toContain('font-regular');
      });

      it('should include medium weight', () => {
        const className = getTextClassName({ variant: 'body', weight: 'medium' });
        expect(className).toContain('font-medium');
      });

      it('should include semibold weight', () => {
        const className = getTextClassName({ variant: 'body', weight: 'semibold' });
        expect(className).toContain('font-semibold');
      });

      it('should include bold weight', () => {
        const className = getTextClassName({ variant: 'body', weight: 'bold' });
        expect(className).toContain('font-bold');
      });

      it('should use default weight when not specified', () => {
        const className = getTextClassName({ variant: 'body' });
        // Should not have any weight class when using default
        expect(className).not.toContain('font-medium');
        expect(className).not.toContain('font-semibold');
        expect(className).not.toContain('font-bold');
      });
    });

    describe('Text Colors', () => {
      it('should include primary color', () => {
        const className = getTextClassName({ variant: 'body', color: 'primary' });
        expect(className).toContain('text-primary');
      });

      it('should include secondary color', () => {
        const className = getTextClassName({ variant: 'body', color: 'secondary' });
        expect(className).toContain('text-secondary');
      });

      it('should include tertiary color', () => {
        const className = getTextClassName({ variant: 'body', color: 'tertiary' });
        expect(className).toContain('text-tertiary');
      });

      it('should include error color', () => {
        const className = getTextClassName({ variant: 'body', color: 'error' });
        expect(className).toContain('text-error');
      });

      it('should include success color', () => {
        const className = getTextClassName({ variant: 'body', color: 'success' });
        expect(className).toContain('text-success');
      });

      it('should not include color class when not specified', () => {
        const className = getTextClassName({ variant: 'body' });
        expect(className).not.toContain('text-primary');
        expect(className).not.toContain('text-secondary');
      });
    });

    describe('Combined Options', () => {
      it('should combine variant, weight, and color', () => {
        const className = getTextClassName({
          variant: 'headline',
          weight: 'bold',
          color: 'primary',
        });
        expect(className).toContain('text-headline');
        expect(className).toContain('font-bold');
        expect(className).toContain('text-primary');
      });

      it('should handle all options together', () => {
        const className = getTextClassName({
          variant: 'title-1',
          weight: 'semibold',
          color: 'secondary',
        });
        expect(className).toContain('text-title-1');
        expect(className).toContain('font-semibold');
        expect(className).toContain('text-secondary');
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined options gracefully', () => {
        const className = getTextClassName({ variant: 'body' });
        expect(className).toBeTruthy();
        expect(className).toContain('text-body');
      });

      it('should return valid className string', () => {
        const className = getTextClassName({ variant: 'body' });
        expect(typeof className).toBe('string');
        expect(className.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getTextStyle', () => {
    describe('Text Variant Styles', () => {
      it('should return style object for display variant', () => {
        const style = getTextStyle({ variant: 'display' });
        expect(style.fontSize).toBe('var(--font-size-display)');
        expect(style.lineHeight).toBe('var(--line-height-display)');
        expect(style.fontWeight).toBe('var(--font-weight-bold)');
      });

      it('should return style object for title-1 variant', () => {
        const style = getTextStyle({ variant: 'title-1' });
        expect(style.fontSize).toBe('var(--font-size-title-1)');
        expect(style.lineHeight).toBe('var(--line-height-title-1)');
        expect(style.fontWeight).toBe('var(--font-weight-bold)');
      });

      it('should return style object for body variant', () => {
        const style = getTextStyle({ variant: 'body' });
        expect(style.fontSize).toBe('var(--font-size-body)');
        expect(style.lineHeight).toBe('var(--line-height-body)');
        expect(style.fontWeight).toBe('var(--font-weight-regular)');
      });

      it('should return style object for footnote variant', () => {
        const style = getTextStyle({ variant: 'footnote' });
        expect(style.fontSize).toBe('var(--font-size-footnote)');
        expect(style.lineHeight).toBe('var(--line-height-footnote)');
        expect(style.fontWeight).toBe('var(--font-weight-regular)');
      });
    });

    describe('Weight Override', () => {
      it('should override weight for body with bold', () => {
        const style = getTextStyle({ variant: 'body', weight: 'bold' });
        expect(style.fontWeight).toBe('var(--font-weight-bold)');
      });

      it('should override weight for body with medium', () => {
        const style = getTextStyle({ variant: 'body', weight: 'medium' });
        expect(style.fontWeight).toBe('var(--font-weight-medium)');
      });

      it('should override weight for body with semibold', () => {
        const style = getTextStyle({ variant: 'body', weight: 'semibold' });
        expect(style.fontWeight).toBe('var(--font-weight-semibold)');
      });
    });

    describe('Color Styles', () => {
      it('should include color for primary', () => {
        const style = getTextStyle({ variant: 'body', color: 'primary' });
        expect(style.color).toBe('var(--text-primary)');
      });

      it('should include color for secondary', () => {
        const style = getTextStyle({ variant: 'body', color: 'secondary' });
        expect(style.color).toBe('var(--text-secondary)');
      });

      it('should include color for error', () => {
        const style = getTextStyle({ variant: 'body', color: 'error' });
        expect(style.color).toBe('var(--color-error)');
      });

      it('should not include color when not specified', () => {
        const style = getTextStyle({ variant: 'body' });
        expect(style.color).toBeUndefined();
      });
    });

    describe('Return Type', () => {
      it('should return CSSProperties object', () => {
        const style = getTextStyle({ variant: 'body' });
        expect(typeof style).toBe('object');
        expect(style).toHaveProperty('fontSize');
        expect(style).toHaveProperty('lineHeight');
        expect(style).toHaveProperty('fontWeight');
      });

      it('should use CSS custom properties', () => {
        const style = getTextStyle({ variant: 'headline' });
        expect(style.fontSize).toMatch(/^var\(--/);
        expect(style.lineHeight).toMatch(/^var\(--/);
        expect(style.fontWeight).toMatch(/^var\(--/);
      });
    });
  });

  describe('Type Safety', () => {
    it('should accept all valid text variants', () => {
      const variants: TextVariant[] = [
        'display',
        'title-1',
        'title-2',
        'title-3',
        'headline',
        'body',
        'callout',
        'subhead',
        'footnote',
        'caption-1',
        'caption-2',
      ];

      variants.forEach((variant) => {
        expect(() => getTextClassName({ variant })).not.toThrow();
        expect(() => getTextStyle({ variant })).not.toThrow();
      });
    });

    it('should accept all valid text weights', () => {
      const weights: TextWeight[] = ['regular', 'medium', 'semibold', 'bold'];

      weights.forEach((weight) => {
        expect(() => getTextClassName({ variant: 'body', weight })).not.toThrow();
        expect(() => getTextStyle({ variant: 'body', weight })).not.toThrow();
      });
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work for page title', () => {
      const className = getTextClassName({
        variant: 'display',
        weight: 'bold',
        color: 'primary',
      });
      expect(className).toBeTruthy();
      expect(className).toContain('text-display');
      expect(className).toContain('font-bold');
      expect(className).toContain('text-primary');
    });

    it('should work for section heading', () => {
      const className = getTextClassName({
        variant: 'title-1',
        weight: 'semibold',
      });
      expect(className).toBeTruthy();
      expect(className).toContain('text-title-1');
      expect(className).toContain('font-semibold');
    });

    it('should work for body text', () => {
      const className = getTextClassName({
        variant: 'body',
        color: 'secondary',
      });
      expect(className).toBeTruthy();
      expect(className).toContain('text-body');
      expect(className).toContain('text-secondary');
    });

    it('should work for error message', () => {
      const className = getTextClassName({
        variant: 'footnote',
        color: 'error',
      });
      expect(className).toBeTruthy();
      expect(className).toContain('text-footnote');
      expect(className).toContain('text-error');
    });
  });
});
