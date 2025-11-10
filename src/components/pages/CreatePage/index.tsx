'use client';

import { useGameCreation } from '@/hooks/useGameCreation';
import { EpisodeForm } from '@/components/domain/game/EpisodeForm';

/**
 * CreatePage Component
 * Page for creating a new game session with episodes
 */
export function CreatePage() {
  const { episodes, isLoading, addEpisode, removeEpisode, updateEpisode, createGame } =
    useGameCreation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Create New Game</h1>
          <p className="text-sm sm:text-base text-center text-gray-600">
            Add episodes for your game (1-20 episodes)
          </p>
        </div>

        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h2>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>1. Add at least one episode</li>
            <li>2. Each episode should describe a game scenario or prompt</li>
            <li>3. Click &quot;Create Game&quot; to generate your session ID</li>
            <li>4. Share the session ID with players</li>
          </ul>
        </div>

        <EpisodeForm
          episodes={episodes}
          onAddEpisode={addEpisode}
          onRemoveEpisode={removeEpisode}
          onUpdateEpisode={updateEpisode}
          onSubmit={createGame}
          isLoading={isLoading}
        />

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            After creation, you&apos;ll receive a session ID and be redirected to the join page
          </p>
        </div>
      </div>
    </div>
  );
}
