// StatusTransitionError Tests
// Tests for status transition error class with factory methods

import { describe, expect, it } from 'vitest';
import { StatusTransitionError } from './StatusTransitionError';

describe('StatusTransitionError', () => {
  describe('constructor', () => {
    it('should create error with all parameters', () => {
      const error = new StatusTransitionError(
        'INVALID_STATUS_TRANSITION',
        'Invalid transition',
        '準備中',
        '締切',
        { reason: 'test' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StatusTransitionError);
      expect(error.message).toBe('Invalid transition');
      expect(error.name).toBe('StatusTransitionError');
      expect(error.code).toBe('INVALID_STATUS_TRANSITION');
      expect(error.currentStatus).toBe('準備中');
      expect(error.targetStatus).toBe('締切');
      expect(error.details).toEqual({ reason: 'test' });
    });

    it('should create error with optional parameters undefined', () => {
      const error = new StatusTransitionError('NO_PRESENTERS', 'No presenters', '準備中');

      expect(error.code).toBe('NO_PRESENTERS');
      expect(error.currentStatus).toBe('準備中');
      expect(error.targetStatus).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('invalidTransition factory method', () => {
    it('should create INVALID_STATUS_TRANSITION error', () => {
      const error = StatusTransitionError.invalidTransition('出題中', '準備中');

      expect(error.code).toBe('INVALID_STATUS_TRANSITION');
      expect(error.message).toBe('無効なステータス遷移です');
      expect(error.currentStatus).toBe('出題中');
      expect(error.targetStatus).toBe('準備中');
      expect(error.name).toBe('StatusTransitionError');
    });

    it('should handle different status combinations', () => {
      const error1 = StatusTransitionError.invalidTransition('準備中', '締切');
      const error2 = StatusTransitionError.invalidTransition('締切', '出題中');

      expect(error1.currentStatus).toBe('準備中');
      expect(error1.targetStatus).toBe('締切');
      expect(error2.currentStatus).toBe('締切');
      expect(error2.targetStatus).toBe('出題中');
    });
  });

  describe('noPresenters factory method', () => {
    it('should create NO_PRESENTERS error', () => {
      const error = StatusTransitionError.noPresenters('準備中');

      expect(error.code).toBe('NO_PRESENTERS');
      expect(error.message).toBe('ゲームを開始するには出題者が必要です');
      expect(error.currentStatus).toBe('準備中');
      expect(error.targetStatus).toBeUndefined();
    });
  });

  describe('incompletePresenter factory method', () => {
    it('should create INCOMPLETE_PRESENTER error with details', () => {
      const error = StatusTransitionError.incompletePresenter('準備中', 'PlayerOne');

      expect(error.code).toBe('INCOMPLETE_PRESENTER');
      expect(error.message).toBe('出題者 PlayerOne のエピソードが不完全です');
      expect(error.currentStatus).toBe('準備中');
      expect(error.details).toEqual({ presenterNickname: 'PlayerOne' });
    });

    it('should handle Japanese nicknames', () => {
      const error = StatusTransitionError.incompletePresenter('準備中', 'プレイヤー１');

      expect(error.message).toBe('出題者 プレイヤー１ のエピソードが不完全です');
      expect(error.details).toEqual({ presenterNickname: 'プレイヤー１' });
    });
  });

  describe('invalidLieCount factory method', () => {
    it('should create INVALID_LIE_COUNT error with details', () => {
      const error = StatusTransitionError.invalidLieCount('準備中', 'PlayerTwo', 2);

      expect(error.code).toBe('INVALID_LIE_COUNT');
      expect(error.message).toBe('出題者 PlayerTwo はウソを1つ選択する必要があります');
      expect(error.currentStatus).toBe('準備中');
      expect(error.details).toEqual({ presenterNickname: 'PlayerTwo', lieCount: 2 });
    });

    it('should handle different lie counts', () => {
      const error0 = StatusTransitionError.invalidLieCount('準備中', 'Player', 0);
      const error3 = StatusTransitionError.invalidLieCount('準備中', 'Player', 3);

      expect(error0.details).toEqual({ presenterNickname: 'Player', lieCount: 0 });
      expect(error3.details).toEqual({ presenterNickname: 'Player', lieCount: 3 });
    });
  });

  describe('gameAlreadyClosed factory method', () => {
    it('should create GAME_ALREADY_CLOSED error', () => {
      const error = StatusTransitionError.gameAlreadyClosed();

      expect(error.code).toBe('GAME_ALREADY_CLOSED');
      expect(error.message).toBe('締切状態のゲームは変更できません');
      expect(error.currentStatus).toBe('締切');
      expect(error.targetStatus).toBeUndefined();
    });
  });

  describe('unauthorized factory method', () => {
    it('should create UNAUTHORIZED error', () => {
      const error = StatusTransitionError.unauthorized('出題中');

      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('このゲームを変更する権限がありません');
      expect(error.currentStatus).toBe('出題中');
      expect(error.targetStatus).toBeUndefined();
    });

    it('should work with different current statuses', () => {
      const error1 = StatusTransitionError.unauthorized('準備中');
      const error2 = StatusTransitionError.unauthorized('締切');

      expect(error1.currentStatus).toBe('準備中');
      expect(error2.currentStatus).toBe('締切');
    });
  });
});
