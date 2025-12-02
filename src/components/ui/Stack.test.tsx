/**
 * Tests for Stack component
 * Feature: 009-apple-hig-ui-redesign
 * Content deference through consistent spacing between elements
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(
        <Stack>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Stack>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render as a div by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('DIV');
    });
  });

  describe('Direction', () => {
    it('should apply vertical direction by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('stack-vertical');
      expect(stackElement).toHaveClass('flex-col');
    });

    it('should apply vertical direction when specified', () => {
      const { container } = render(
        <Stack direction="vertical">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('stack-vertical');
      expect(stackElement).toHaveClass('flex-col');
    });

    it('should apply horizontal direction', () => {
      const { container } = render(
        <Stack direction="horizontal">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('stack-horizontal');
      expect(stackElement).toHaveClass('flex-row');
    });
  });

  describe('Spacing', () => {
    it('should apply md spacing by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-4');
    });

    it('should apply xs spacing', () => {
      const { container } = render(
        <Stack spacing="xs">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-1');
    });

    it('should apply sm spacing', () => {
      const { container } = render(
        <Stack spacing="sm">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-2');
    });

    it('should apply md spacing', () => {
      const { container } = render(
        <Stack spacing="md">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-4');
    });

    it('should apply lg spacing', () => {
      const { container } = render(
        <Stack spacing="lg">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-6');
    });

    it('should apply xl spacing', () => {
      const { container } = render(
        <Stack spacing="xl">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-8');
    });

    it('should apply 2xl spacing', () => {
      const { container } = render(
        <Stack spacing="2xl">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-12');
    });

    it('should apply 3xl spacing', () => {
      const { container } = render(
        <Stack spacing="3xl">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-16');
    });

    it('should apply none spacing', () => {
      const { container } = render(
        <Stack spacing="none">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('gap-0');
    });
  });

  describe('Alignment', () => {
    it('should apply stretch alignment by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-stretch');
    });

    it('should apply start alignment', () => {
      const { container } = render(
        <Stack align="start">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-start');
    });

    it('should apply center alignment', () => {
      const { container } = render(
        <Stack align="center">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-center');
    });

    it('should apply end alignment', () => {
      const { container } = render(
        <Stack align="end">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-end');
    });

    it('should apply stretch alignment', () => {
      const { container } = render(
        <Stack align="stretch">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-stretch');
    });

    it('should apply baseline alignment', () => {
      const { container } = render(
        <Stack align="baseline">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('items-baseline');
    });
  });

  describe('Justify', () => {
    it('should not apply justify by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).not.toHaveClass('justify-start');
      expect(stackElement).not.toHaveClass('justify-center');
    });

    it('should apply start justify', () => {
      const { container } = render(
        <Stack justify="start">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-start');
    });

    it('should apply center justify', () => {
      const { container } = render(
        <Stack justify="center">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-center');
    });

    it('should apply end justify', () => {
      const { container } = render(
        <Stack justify="end">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-end');
    });

    it('should apply between justify', () => {
      const { container } = render(
        <Stack justify="between">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-between');
    });

    it('should apply around justify', () => {
      const { container } = render(
        <Stack justify="around">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-around');
    });

    it('should apply evenly justify', () => {
      const { container } = render(
        <Stack justify="evenly">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('justify-evenly');
    });
  });

  describe('Wrap', () => {
    it('should not wrap by default', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).not.toHaveClass('flex-wrap');
    });

    it('should apply wrap when wrap is true', () => {
      const { container } = render(
        <Stack wrap>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex-wrap');
    });

    it('should not wrap when wrap is false', () => {
      const { container } = render(
        <Stack wrap={false}>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).not.toHaveClass('flex-wrap');
    });
  });

  describe('Custom Element', () => {
    it('should render as section when as="section"', () => {
      const { container } = render(
        <Stack as="section">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('SECTION');
    });

    it('should render as ul when as="ul"', () => {
      const { container } = render(
        <Stack as="ul">
          <li>Item 1</li>
          <li>Item 2</li>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('UL');
    });

    it('should render as ol when as="ol"', () => {
      const { container } = render(
        <Stack as="ol">
          <li>Item 1</li>
          <li>Item 2</li>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('OL');
    });

    it('should render as nav when as="nav"', () => {
      const { container } = render(
        <Stack as="nav">
          <a href="/">Home</a>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('NAV');
    });
  });

  describe('Custom Classes', () => {
    it('should merge custom className with default classes', () => {
      const { container } = render(
        <Stack className="custom-class">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('custom-class');
      expect(stackElement).toHaveClass('stack-base');
    });

    it('should not override base classes', () => {
      const { container } = render(
        <Stack className="my-custom-style">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('my-custom-style');
      expect(stackElement).toHaveClass('stack-base');
      expect(stackElement).toHaveClass('flex');
    });
  });

  describe('Combined Options', () => {
    it('should combine direction, spacing, and alignment', () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="lg" align="center">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('stack-horizontal');
      expect(stackElement).toHaveClass('flex-row');
      expect(stackElement).toHaveClass('gap-6');
      expect(stackElement).toHaveClass('items-center');
    });

    it('should combine all options', () => {
      const { container } = render(
        <Stack
          direction="horizontal"
          spacing="xl"
          align="center"
          justify="between"
          wrap
          className="custom"
        >
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex-row');
      expect(stackElement).toHaveClass('gap-8');
      expect(stackElement).toHaveClass('items-center');
      expect(stackElement).toHaveClass('justify-between');
      expect(stackElement).toHaveClass('flex-wrap');
      expect(stackElement).toHaveClass('custom');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through id attribute', () => {
      const { container } = render(
        <Stack id="test-stack">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveAttribute('id', 'test-stack');
    });

    it('should pass through data attributes', () => {
      const { container } = render(
        <Stack data-testid="stack" data-custom="value">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveAttribute('data-testid', 'stack');
      expect(stackElement).toHaveAttribute('data-custom', 'value');
    });

    it('should pass through aria attributes', () => {
      const { container } = render(
        <Stack aria-label="Content Stack" role="list">
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveAttribute('aria-label', 'Content Stack');
      expect(stackElement).toHaveAttribute('role', 'list');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as vertical form stack', () => {
      const { container } = render(
        <Stack spacing="lg">
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <button type="submit">Submit</button>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex-col');
      expect(stackElement).toHaveClass('gap-6');
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('should work as horizontal button group', () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="sm" align="center">
          <button>Cancel</button>
          <button>Save</button>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex-row');
      expect(stackElement).toHaveClass('gap-2');
      expect(stackElement).toHaveClass('items-center');
    });

    it('should work as navigation menu', () => {
      const { container } = render(
        <Stack as="nav" direction="horizontal" spacing="md" align="center" justify="between">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement?.nodeName).toBe('NAV');
      expect(stackElement).toHaveClass('flex-row');
      expect(stackElement).toHaveClass('justify-between');
    });

    it('should work as card grid with wrapping', () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="md" wrap>
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex-row');
      expect(stackElement).toHaveClass('flex-wrap');
      expect(stackElement).toHaveClass('gap-4');
    });
  });

  describe('Base Styles', () => {
    it('should always include stack-base class', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('stack-base');
    });

    it('should always include flex class', () => {
      const { container } = render(
        <Stack>
          <div>Test</div>
        </Stack>
      );
      const stackElement = container.firstChild;
      expect(stackElement).toHaveClass('flex');
    });
  });
});
