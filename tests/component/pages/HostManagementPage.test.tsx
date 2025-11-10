import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HostManagementPage } from '@/components/pages/HostManagementPage';

// Mock useHostManagement hook (used by existing HostManagementPage)
const mockUseHostManagement = vi.fn();
vi.mock('@/components/pages/HostManagementPage/hooks/useHostManagement', () => ({
  useHostManagement: (sessionId: string, hostId: string) => mockUseHostManagement(sessionId, hostId),
}));

// Mock child components
vi.mock('@/components/domain/team/TeamManager', () => ({
  TeamManager: () => <div data-testid="team-manager">Team Manager</div>,
}));

vi.mock('@/components/ui/ConfirmationModal', () => ({
  ConfirmationModal: () => <div data-testid="confirmation-modal">Confirmation Modal</div>,
}));

describe('HostManagementPage (existing implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading state while loading session', () => {
      mockUseHostManagement.mockReturnValue({
        session: null,
        loading: true,
        error: null,
        startGame: vi.fn(),
        endGame: vi.fn(),
        canStartGame: vi.fn(),
        getStartValidationMessage: vi.fn(),
      });

      render(<HostManagementPage sessionId="TEST42" hostId="host-123" />);

      expect(screen.getByText('Loading session...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when there is an error', () => {
      const mockSession = {
        id: 'TEST42',
        phase: 'preparation' as const,
        participants: [{ id: 'p1', nickname: 'Player1', role: 'player' as const, teamId: null }],
        teams: [],
      };

      mockUseHostManagement.mockReturnValue({
        session: mockSession,
        loading: false,
        error: 'Failed to load session',
        startGame: vi.fn(),
        endGame: vi.fn(),
        canStartGame: vi.fn(() => false),
        getStartValidationMessage: vi.fn(() => null),
      });

      render(<HostManagementPage sessionId="TEST42" hostId="host-123" />);

      expect(screen.getByText('Failed to load session')).toBeInTheDocument();
    });
  });

  describe('Host Management View', () => {
    it('should display session ID and phase when loaded', () => {
      const mockSession = {
        id: 'TEST42',
        phase: 'preparation' as const,
        participants: [{ id: 'p1', nickname: 'Player1', role: 'player' as const, teamId: null }],
        teams: [],
      };

      mockUseHostManagement.mockReturnValue({
        session: mockSession,
        loading: false,
        error: null,
        startGame: vi.fn(),
        endGame: vi.fn(),
        canStartGame: vi.fn(() => false),
        getStartValidationMessage: vi.fn(() => null),
      });

      render(<HostManagementPage sessionId="TEST42" hostId="host-123" />);

      expect(screen.getByText(/Host Management/i)).toBeInTheDocument();
      expect(screen.getByText(/TEST42/)).toBeInTheDocument();
      expect(screen.getByText(/preparation/i)).toBeInTheDocument();
    });

    it('should display team manager component', () => {
      const mockSession = {
        id: 'TEST42',
        phase: 'preparation' as const,
        participants: [{ id: 'p1', nickname: 'Player1', role: 'player' as const, teamId: null }],
        teams: [],
      };

      mockUseHostManagement.mockReturnValue({
        session: mockSession,
        loading: false,
        error: null,
        startGame: vi.fn(),
        endGame: vi.fn(),
        canStartGame: vi.fn(() => true),
        getStartValidationMessage: vi.fn(() => null),
      });

      render(<HostManagementPage sessionId="TEST42" hostId="host-123" />);

      expect(screen.getByTestId('team-manager')).toBeInTheDocument();
    });
  });
});
