'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EpisodeFormProps {
  episodes: { content: string }[];
  onAddEpisode: () => void;
  onRemoveEpisode: (index: number) => void;
  onUpdateEpisode: (index: number, content: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/**
 * EpisodeForm Component
 * Form for creating and managing game episodes (1-20)
 */
export function EpisodeForm({
  episodes,
  onAddEpisode,
  onRemoveEpisode,
  onUpdateEpisode,
  onSubmit,
  isLoading,
}: EpisodeFormProps) {
  const canAddMore = episodes.length < 20;
  const hasEpisodes = episodes.length > 0;
  const allEpisodesFilled = episodes.every((ep) => ep.content.trim().length > 0);
  const canSubmit = hasEpisodes && allEpisodesFilled && !isLoading;
  const remainingEpisodes = 20 - episodes.length;

  return (
    <div className="space-y-4">
      {/* Episode count indicator */}
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Episodes: {episodes.length}/20
        </span>
        {remainingEpisodes > 0 && (
          <span className="text-xs text-gray-500">
            {remainingEpisodes} remaining
          </span>
        )}
        {episodes.length === 20 && (
          <span className="text-xs text-amber-600 font-medium">
            Maximum reached
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {episodes.map((episode, index) => (
          <div key={index} className="flex gap-2 sm:gap-3">
            <div className="flex-1">
              <Input
                value={episode.content}
                onChange={(e) => onUpdateEpisode(index, e.target.value)}
                placeholder={`Episode ${index + 1}`}
                disabled={isLoading}
                aria-label={`Episode ${index + 1} content`}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onRemoveEpisode(index)}
              disabled={isLoading}
              aria-label={`Remove episode ${index + 1}`}
              className="shrink-0"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {canAddMore && (
        <Button
          type="button"
          variant="secondary"
          onClick={onAddEpisode}
          fullWidth
          disabled={isLoading}
          aria-label="Add new episode"
        >
          Add Episode ({episodes.length}/20)
        </Button>
      )}

      {!canAddMore && (
        <p className="text-sm text-amber-600 text-center font-medium">
          Maximum of 20 episodes reached
        </p>
      )}

      <div className="pt-4">
        <Button
          type="button"
          onClick={onSubmit}
          fullWidth
          disabled={!canSubmit}
          aria-label="Create game"
        >
          {isLoading ? 'Creating...' : 'Create Game'}
        </Button>
      </div>

      {/* Validation messages */}
      {episodes.length === 0 && (
        <p className="text-sm text-gray-500 text-center" role="alert">
          Add at least one episode to create a game
        </p>
      )}

      {episodes.length > 0 && !allEpisodesFilled && (
        <p className="text-sm text-amber-600 text-center font-medium" role="alert">
          All episodes must have content
        </p>
      )}
    </div>
  );
}
