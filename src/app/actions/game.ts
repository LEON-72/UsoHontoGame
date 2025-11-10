"use server";

// Game Server Actions
// Feature: 002-game-preparation
// Server Actions with Zod validation for game management

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateGame } from "@/server/application/use-cases/games/CreateGame";
import { createGameRepository } from "@/server/infrastructure/repositories";
import { CreateGameSchema } from "@/server/domain/schemas/gameSchemas";
import type { CreateGameOutput } from "@/server/application/dto/GameDto";

/**
 * Server Action: Create new game
 * Validates input with Zod, creates game via CreateGame use case
 * @param formData Form data from GameForm
 * @returns Created game data or validation errors
 */
export async function createGameAction(
	formData: FormData,
): Promise<
	| { success: true; game: CreateGameOutput }
	| { success: false; errors: Record<string, string[]> }
> {
	try {
		// Extract and parse form data
		const rawData = {
			playerLimit: Number(formData.get("playerLimit")),
		};

		// Validate with Zod schema
		const validationResult = CreateGameSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				errors: validationResult.error.flatten().fieldErrors,
			};
		}

		// Get session ID from cookies (moderator/creator ID)
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session_id")?.value;

		if (!sessionId) {
			return {
				success: false,
				errors: {
					_form: ["セッションが見つかりません。ニックネームを設定してください。"],
				},
			};
		}

		// Execute CreateGame use case
		const repository = createGameRepository();
		const useCase = new CreateGame(repository);

		const game = await useCase.execute({
			creatorId: sessionId,
			playerLimit: validationResult.data.playerLimit,
		});

		return {
			success: true,
			game,
		};
	} catch (error) {
		console.error("Failed to create game:", error);
		return {
			success: false,
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: "ゲームの作成に失敗しました",
				],
			},
		};
	}
}

/**
 * Server Action: Create game and redirect to game list
 * Convenience wrapper that redirects on success
 * @param formData Form data from GameForm
 */
export async function createGameAndRedirect(
	formData: FormData,
): Promise<void> {
	const result = await createGameAction(formData);

	if (result.success) {
		// Redirect to game list or game detail page
		redirect("/top");
	}

	// On failure, let the form component handle errors
	// This should not happen as the form will call createGameAction directly
	throw new Error("Game creation failed");
}
