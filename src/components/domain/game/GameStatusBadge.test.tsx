import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameStatusBadge, GameStatusBadgeLarge } from './GameStatusBadge';

describe('GameStatusBadge', () => {
  describe('status display states', () => {
    it('should display 準備中 status with yellow styling', () => {
      render(<GameStatusBadge status="準備中" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('準備中');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは準備中です');
    });

    it('should display 出題中 status with green styling', () => {
      render(<GameStatusBadge status="出題中" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('出題中');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは出題中です');
    });

    it('should display 締切 status with gray styling', () => {
      render(<GameStatusBadge status="締切" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('締切');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは締切です');
    });

    it('should apply custom className', () => {
      render(<GameStatusBadge status="準備中" className="custom-class" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('GameStatusBadgeLarge', () => {
    it('should display with larger styling for 準備中', () => {
      render(<GameStatusBadgeLarge status="準備中" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('準備中');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300');
      expect(badge).toHaveClass('px-4', 'py-2', 'text-sm', 'font-semibold', 'border-2');
    });

    it('should display with larger styling for 出題中', () => {
      render(<GameStatusBadgeLarge status="出題中" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('出題中');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-300');
    });

    it('should display with larger styling for 締切', () => {
      render(<GameStatusBadgeLarge status="締切" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('締切');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-300');
    });
  });
});
