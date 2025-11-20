// Component Tests: Badge
// UI Primitive component for status and label display

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge element', () => {
      render(<Badge>Test Badge</Badge>);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render as span element', () => {
      const { container } = render(<Badge>Badge</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('should render children text', () => {
      render(<Badge>Status Active</Badge>);

      expect(screen.getByText('Status Active')).toBeInTheDocument();
    });

    it('should render children with JSX', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Label</span>
        </Badge>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('should render number as children', () => {
      render(<Badge>{42}</Badge>);

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should apply base styles to all badges', () => {
      const { container } = render(<Badge>Base Styles</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-medium'
      );
    });

    it('should maintain base styles with all variants', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    });
  });

  describe('Variants', () => {
    it('should apply default variant by default', () => {
      const { container } = render(<Badge>Default</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply default variant styles', () => {
      const { container } = render(<Badge variant="default">Default</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply primary variant styles', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should apply success variant styles', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply danger variant styles', () => {
      const { container } = render(<Badge variant="danger">Danger</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should not have other variant styles when specific variant applied', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);

      const badge = container.querySelector('span');
      expect(badge).not.toHaveClass('bg-gray-100', 'bg-blue-100');
      expect(badge).toHaveClass('bg-green-100');
    });
  });

  describe('Variant Colors', () => {
    it('should use gray for default variant', () => {
      const { container } = render(<Badge variant="default">Gray</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should use blue for primary variant', () => {
      const { container } = render(<Badge variant="primary">Blue</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should use green for success variant', () => {
      const { container } = render(<Badge variant="success">Green</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should use yellow for warning variant', () => {
      const { container } = render(<Badge variant="warning">Yellow</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should use red for danger variant', () => {
      const { container } = render(<Badge variant="danger">Red</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with base styles', () => {
      const { container } = render(<Badge className="custom-class">Custom</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex'); // Base style still applied
    });

    it('should apply multiple custom classes', () => {
      const { container } = render(<Badge className="class-1 class-2 class-3">Multiple</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('class-1', 'class-2', 'class-3');
    });

    it('should handle empty className', () => {
      const { container } = render(<Badge className="">No Custom Class</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex'); // Base styles still applied
    });

    it('should combine variant and custom className', () => {
      const { container } = render(
        <Badge variant="success" className="custom-badge">
          Success Custom
        </Badge>
      );

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100'); // Variant style
      expect(badge).toHaveClass('custom-badge'); // Custom class
    });
  });

  describe('Children Variations', () => {
    it('should handle Japanese text', () => {
      render(<Badge>準備中</Badge>);

      expect(screen.getByText('準備中')).toBeInTheDocument();
    });

    it('should handle English text', () => {
      render(<Badge>Active</Badge>);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should handle mixed text', () => {
      render(<Badge>Status: 準備中</Badge>);

      expect(screen.getByText('Status: 準備中')).toBeInTheDocument();
    });

    it('should handle numbers', () => {
      render(<Badge>{100}</Badge>);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle zero', () => {
      render(<Badge>{0}</Badge>);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>★ VIP</Badge>);

      expect(screen.getByText('★ VIP')).toBeInTheDocument();
    });

    it('should handle emoji', () => {
      render(<Badge>✓ Complete</Badge>);

      expect(screen.getByText('✓ Complete')).toBeInTheDocument();
    });

    it('should handle multiple children elements', () => {
      render(
        <Badge>
          <span>Count:</span>
          <span> </span>
          <span>5</span>
        </Badge>
      );

      expect(screen.getByText('Count:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      const { container } = render(<Badge>{''}</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });

    it('should handle undefined variant (uses default)', () => {
      const { container } = render(<Badge variant={undefined}>Undefined</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should handle long text', () => {
      const longText = 'This is a very long badge text that should still be displayed properly';
      render(<Badge>{longText}</Badge>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should maintain styles with whitespace children', () => {
      const { container } = render(<Badge> </Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex', 'rounded-full');
    });
  });

  describe('Semantic Usage', () => {
    it('should work for status badges', () => {
      const { container } = render(<Badge variant="success">Active</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100');
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work for count badges', () => {
      const { container } = render(<Badge variant="primary">{5}</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-blue-100');
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should work for alert badges', () => {
      const { container } = render(<Badge variant="danger">Error</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should work for info badges', () => {
      const { container } = render(<Badge variant="warning">Pending</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should work for neutral badges', () => {
      const { container } = render(<Badge variant="default">Draft</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100');
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Inline Display', () => {
    it('should have inline-flex display', () => {
      const { container } = render(<Badge>Inline</Badge>);

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should be usable inline with text', () => {
      render(
        <div>
          Status: <Badge>Active</Badge>
        </div>
      );

      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should support multiple badges in a row', () => {
      render(
        <div>
          <Badge variant="success">Tag 1</Badge>
          <Badge variant="primary">Tag 2</Badge>
          <Badge variant="danger">Tag 3</Badge>
        </div>
      );

      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
    });
  });
});
