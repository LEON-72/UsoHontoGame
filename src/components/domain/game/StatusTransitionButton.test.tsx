import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';
import { StatusTransitionButton } from './StatusTransitionButton';

// Mock the Server Actions
vi.mock('@/app/actions/game', () => ({
  startGameAction: vi.fn(),
  closeGameAction: vi.fn(),
}));

// Get references to the mocked functions
const { startGameAction: mockStartGameAction, closeGameAction: mockCloseGameAction } = await import('@/app/actions/game');

describe('StatusTransitionButton', () => {
  const defaultProps = {
    gameId: 'game-123',
    currentStatus: '準備中' as GameStatusValue,
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockStartGameAction).mockReset();
    vi.mocked(mockCloseGameAction).mockReset();
  });

  describe('準備中 status', () => {
    it('should render "ゲームを開始" button for preparation status', () => {
      render(<StatusTransitionButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /ゲームを開始/i })).toBeInTheDocument();
    });

    it('should call startGameAction when start button is clicked', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      render(<StatusTransitionButton {...defaultProps} />);

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockStartGameAction).toHaveBeenCalled();
      });
    });

    it('should show loading state when action is in progress', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(<StatusTransitionButton {...defaultProps} />);

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });
    });

    it('should call onSuccess when start action succeeds', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(<StatusTransitionButton {...defaultProps} onSuccess={onSuccess} />);

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onError when start action fails', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['ゲームを開始するには出題者が必要です'] },
      });
      const onError = vi.fn();

      render(<StatusTransitionButton {...defaultProps} onError={onError} />);

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームを開始するには出題者が必要です');
      });
    });
  });

  describe('出題中 status', () => {
    const acceptingProps = {
      ...defaultProps,
      currentStatus: '出題中' as GameStatusValue,
    };

    it('should render "ゲームを締切" button for accepting responses status', () => {
      render(<StatusTransitionButton {...acceptingProps} />);

      expect(screen.getByRole('button', { name: /ゲームを締切/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog when close button is clicked', async () => {
      // Mock confirm dialog
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(<StatusTransitionButton {...acceptingProps} />);

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      expect(confirmSpy).toHaveBeenCalledWith('本当にゲームを締切しますか？');

      confirmSpy.mockRestore();
    });

    it('should not call closeGameAction when confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<StatusTransitionButton {...acceptingProps} />);

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockCloseGameAction).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should call closeGameAction when confirmation is accepted', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(<StatusTransitionButton {...acceptingProps} />);

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockCloseGameAction).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should call onSuccess when close action succeeds', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(<StatusTransitionButton {...acceptingProps} onSuccess={onSuccess} />);

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('締切 status', () => {
    const closedProps = {
      ...defaultProps,
      currentStatus: '締切' as GameStatusValue,
    };

    it('should not render any button for closed status', () => {
      render(<StatusTransitionButton {...closedProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for start button', () => {
      render(<StatusTransitionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper ARIA attributes when disabled', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(<StatusTransitionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });
});