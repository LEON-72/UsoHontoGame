// DTO: Answer Response
// Response data transfer object for answer operations

export interface AnswerResponse {
  id: string;
  sessionId: string;
  gameId: string;
  nickname: string;
  selections: Record<string, string>; // presenterId -> episodeId
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitAnswerSuccessResponse {
  success: true;
  data: {
    answerId: string;
    message: string;
  };
}

export interface SubmitAnswerErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type SubmitAnswerResult = SubmitAnswerSuccessResponse | SubmitAnswerErrorResponse;
