// Zod Schemas: Answer Validation
// Runtime validation schemas for answer-related operations

import { z } from 'zod';

/**
 * Schema for submit answer request
 * Validates game ID and selections (presenterId -> episodeId mapping)
 */
export const SubmitAnswerSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  selections: z
    .record(
      z.string().min(1, 'Presenter ID is required'),
      z.string().min(1, 'Episode ID is required')
    )
    .refine(
      (selections) => Object.keys(selections).length > 0,
      'At least one selection is required'
    ),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
