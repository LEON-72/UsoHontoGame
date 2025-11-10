import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HostLink } from '@/components/domain/host/HostLink';

// Mock useHostAccess hook
const mockUseHostAccess = vi.fn();
vi.mock('@/hooks/useHostAccess', () => ({
  useHostAccess: (sessionId: string | undefined) => mockUseHostAccess(sessionId),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('HostLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render link when user is host', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: true,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId="TEST42" />);

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByText(/ホスト管理画面/)).toBeInTheDocument();
    });

    it('should not render when user is not host', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: false,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId="TEST42" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/ホスト管理画面/)).not.toBeInTheDocument();
    });

    it('should not render while loading', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: false,
        isLoading: true,
        error: null,
      });

      render(<HostLink sessionId="TEST42" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should not render when there is an error', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: false,
        isLoading: false,
        error: 'Failed to check host access',
      });

      render(<HostLink sessionId="TEST42" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should not render when sessionId is undefined', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: false,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId={undefined} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(mockUseHostAccess).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Link Properties', () => {
    it('should link to correct host management page', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: true,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId="TEST42" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/host/TEST42');
    });

    it('should apply correct styling classes', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: true,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId="TEST42" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-blue-600');
      expect(link).toHaveClass('hover:text-blue-800');
    });
  });

  describe('Hook Integration', () => {
    it('should call useHostAccess with correct sessionId', () => {
      mockUseHostAccess.mockReturnValue({
        isHost: true,
        isLoading: false,
        error: null,
      });

      render(<HostLink sessionId="ABC123" />);

      expect(mockUseHostAccess).toHaveBeenCalledWith('ABC123');
    });

    it('should react to hook state changes', () => {
      const { rerender } = render(<HostLink sessionId="TEST42" />);

      // Initially not host
      mockUseHostAccess.mockReturnValue({
        isHost: false,
        isLoading: false,
        error: null,
      });

      rerender(<HostLink sessionId="TEST42" />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();

      // Becomes host
      mockUseHostAccess.mockReturnValue({
        isHost: true,
        isLoading: false,
        error: null,
      });

      rerender(<HostLink sessionId="TEST42" />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Different Session IDs', () => {
    it('should generate correct link for different sessionIds', () => {
      const sessionIds = ['TEST42', 'ABC123', 'XYZ789'];

      sessionIds.forEach((sessionId) => {
        mockUseHostAccess.mockReturnValue({
          isHost: true,
          isLoading: false,
          error: null,
        });

        const { unmount } = render(<HostLink sessionId={sessionId} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', `/host/${sessionId}`);

        unmount();
      });
    });
  });
});
