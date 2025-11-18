import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';
import { StatusTransitionButton } from './StatusTransitionButton';

// Mock the Server Actions
vi.mock('@/app/actions/game', () => ({
  startGameAction: vi.fn(),
  closeGameAction: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
  statusTransitionToasts: {
    gameStarted: () => ({ message: 'ゲームが正常に開始されました', title: 'ゲーム開始' }),
    gameClosed: () => ({ message: 'ゲームが正常に締切されました', title: 'ゲーム締切' }),
  },
}));

// Mock animations
vi.mock('@/lib/animations', () => ({
  animationSequences: {
    buttonSuccess: vi.fn().mockResolvedValue(undefined),
    buttonError: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock alert function
const mockAlert = vi.fn();
global.alert = mockAlert;

// Get references to the mocked functions
const { startGameAction: mockStartGameAction, closeGameAction: mockCloseGameAction } = await import(
  '@/app/actions/game'
);

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

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
    mockAlert.mockClear();
  });

  describe('準備中 status', () => {
    it('should render "ゲームを開始" button for preparation status', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /ゲームを開始/i })).toBeInTheDocument();
    });

    it('should call startGameAction when start button is clicked', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(mockStartGameAction).toHaveBeenCalled();
      });
    });

    it('should show loading state when action is in progress', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });
    });

    it('should call onSuccess when start action succeeds', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onSuccess={onSuccess} />
        </TestWrapper>
      );

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

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onError={onError} />
        </TestWrapper>
      );

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
      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /ゲームを締切/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog when close button is clicked', async () => {
      // Mock confirm dialog
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });

      await act(async () => {
        fireEvent.click(closeButton);
      });

      expect(confirmSpy).toHaveBeenCalledWith('本当にゲームを締切しますか？');

      confirmSpy.mockRestore();
    });

    it('should not call closeGameAction when confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

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

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

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

    it('should call onError and show alert when close action fails', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['ゲームの締切に失敗しました'] },
      });
      const onError = vi.fn();

      render(<StatusTransitionButton {...acceptingProps} onError={onError} />);

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームの締切に失敗しました');
        expect(mockAlert).toHaveBeenCalledWith('ゲームの締切に失敗しました');
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
      render(
        <TestWrapper>
          <StatusTransitionButton {...closedProps} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for start button', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper ARIA attributes when disabled', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });
});
