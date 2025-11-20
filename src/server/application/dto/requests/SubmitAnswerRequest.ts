// DTO: Submit Answer Request
// Request data transfer object for answer submission

export interface SubmitAnswerRequest {
  gameId: string;
  sessionId: string;
  nickname: string;
  selections: Record<string, string>; // presenterId -> episodeId
}
