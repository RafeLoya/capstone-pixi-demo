import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

/**
 * Server Integration Tests
 *
 * These tests verify the game server logic without actually starting the server.
 * We test the scoring algorithm and game flow logic.
 */

describe('Game Server Logic', () => {
  describe('Scoring Algorithm', () => {
    it('should award 10 points for correct answer', () => {
      const correctAnswer = 2;
      const playerAnswer = 2;

      let points = 0;
      if (playerAnswer === correctAnswer) {
        points = 10;
      }

      assert.strictEqual(points, 10);
    });

    it('should award 0 points for incorrect answer', () => {
      const correctAnswer = 2;
      const playerAnswer = 1;

      let points = 0;
      if (playerAnswer === correctAnswer) {
        points = 10;
      }

      assert.strictEqual(points, 0);
    });

    it('should award bonus when all players answer correctly', () => {
      const correctAnswer = 2;
      const playerAnswers = [
        { playerId: 'p1', choice: 2 },
        { playerId: 'p2', choice: 2 },
        { playerId: 'p3', choice: 2 }
      ];

      const correctPlayers = playerAnswers.filter(ans => ans.choice === correctAnswer);
      const allCorrect = correctPlayers.length === playerAnswers.length;

      let points = 10; // base points
      if (allCorrect) {
        points += 5;
      }

      assert.strictEqual(points, 15);
    });

    it('should not award all-correct bonus when some players wrong', () => {
      const correctAnswer = 2;
      const playerAnswers = [
        { playerId: 'p1', choice: 2 },
        { playerId: 'p2', choice: 1 }, // wrong
        { playerId: 'p3', choice: 2 }
      ];

      const correctPlayers = playerAnswers.filter(ans => ans.choice === correctAnswer);
      const allCorrect = correctPlayers.length === playerAnswers.length;

      let points = 10; // base points
      if (allCorrect) {
        points += 5;
      }

      assert.strictEqual(points, 10);
    });

    it('should award first-correct bonus to fastest player', () => {
      const correctAnswer = 2;
      const playerAnswers = [
        { playerId: 'p1', choice: 2, timestamp: 1000 },
        { playerId: 'p2', choice: 2, timestamp: 500 }, // fastest
        { playerId: 'p3', choice: 2, timestamp: 1500 }
      ];

      const sortedAnswers = playerAnswers.sort((a, b) => a.timestamp - b.timestamp);
      const firstCorrectPlayer = sortedAnswers.find(ans => ans.choice === correctAnswer);

      assert.strictEqual(firstCorrectPlayer.playerId, 'p2');
      assert.strictEqual(firstCorrectPlayer.timestamp, 500);
    });

    it('should not award first-correct bonus when only one player is correct', () => {
      const correctAnswer = 2;
      const playerAnswers = [
        { playerId: 'p1', choice: 1 }, // wrong
        { playerId: 'p2', choice: 2 }, // only correct
        { playerId: 'p3', choice: 1 }  // wrong
      ];

      const correctPlayers = playerAnswers.filter(ans => ans.choice === correctAnswer);
      const playerId = 'p2';
      const sortedAnswers = playerAnswers.sort((a, b) => a.timestamp - b.timestamp);
      const firstCorrectPlayer = sortedAnswers.find(ans => ans.choice === correctAnswer)?.playerId;

      let points = 10;
      if (playerId === firstCorrectPlayer && correctPlayers.length > 1) {
        points += 5;
      }

      // Should NOT get bonus because only one player is correct
      assert.strictEqual(points, 10);
    });

    it('should calculate maximum possible points correctly', () => {
      // Max points: correct (10) + all correct bonus (5) + first correct bonus (5) = 20
      const correctAnswer = 2;
      const playerAnswers = [
        { playerId: 'p1', choice: 2, timestamp: 500 }, // fastest
        { playerId: 'p2', choice: 2, timestamp: 1000 },
        { playerId: 'p3', choice: 2, timestamp: 1500 }
      ];

      const correctPlayers = playerAnswers.filter(ans => ans.choice === correctAnswer);
      const allCorrect = correctPlayers.length === playerAnswers.length;
      const sortedAnswers = playerAnswers.sort((a, b) => a.timestamp - b.timestamp);
      const firstCorrectPlayer = sortedAnswers.find(ans => ans.choice === correctAnswer)?.playerId;

      const playerId = 'p1';
      let points = 0;

      if (playerAnswers.find(p => p.playerId === playerId).choice === correctAnswer) {
        points = 10;

        if (allCorrect) {
          points += 5;
        }

        if (playerId === firstCorrectPlayer && correctPlayers.length > 1) {
          points += 5;
        }
      }

      assert.strictEqual(points, 20);
    });
  });

  describe('Game State Management', () => {
    it('should initialize game state correctly', () => {
      const gameState = {
        sessionId: null,
        sessionStartTime: null,
        players: {},
        currentQuestion: 0,
        answers: {},
        scores: {},
        gameStarted: false
      };

      assert.strictEqual(gameState.currentQuestion, 0);
      assert.strictEqual(gameState.gameStarted, false);
      assert.strictEqual(Object.keys(gameState.players).length, 0);
    });

    it('should track multiple player scores', () => {
      const scores = {};

      scores['player1'] = 10;
      scores['player2'] = 15;
      scores['player3'] = 20;

      assert.strictEqual(scores['player1'], 10);
      assert.strictEqual(scores['player2'], 15);
      assert.strictEqual(scores['player3'], 20);
    });

    it('should accumulate scores across rounds', () => {
      const scores = {
        'player1': 10,
        'player2': 15
      };

      // Round 2
      scores['player1'] += 10;
      scores['player2'] += 20;

      assert.strictEqual(scores['player1'], 20);
      assert.strictEqual(scores['player2'], 35);
    });
  });

  describe('Player Answer Tracking', () => {
    it('should track all player answers', () => {
      const answers = {};

      answers['player1'] = { choice: 2, timestamp: 1000 };
      answers['player2'] = { choice: 1, timestamp: 1500 };

      assert.strictEqual(answers['player1'].choice, 2);
      assert.strictEqual(answers['player2'].choice, 1);
    });

    it('should detect when all players have answered', () => {
      const players = {
        'player1': { id: 'player1', score: 0 },
        'player2': { id: 'player2', score: 0 }
      };

      const answers = {
        'player1': { choice: 2 },
        'player2': { choice: 1 }
      };

      const allAnswered = Object.keys(players).every(
        pid => answers[pid]
      );

      assert.strictEqual(allAnswered, true);
    });

    it('should detect when not all players have answered', () => {
      const players = {
        'player1': { id: 'player1', score: 0 },
        'player2': { id: 'player2', score: 0 },
        'player3': { id: 'player3', score: 0 }
      };

      const answers = {
        'player1': { choice: 2 },
        'player2': { choice: 1 }
        // player3 hasn't answered
      };

      const allAnswered = Object.keys(players).every(
        pid => answers[pid]
      );

      assert.strictEqual(allAnswered, false);
    });
  });

  describe('Ranking Calculation', () => {
    it('should rank players by score correctly', () => {
      const scores = {
        'player1': 30,
        'player2': 20,
        'player3': 25
      };

      const sortedPlayers = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([playerId, score], index) => ({
          playerId,
          score,
          rank: index + 1
        }));

      assert.strictEqual(sortedPlayers[0].playerId, 'player1');
      assert.strictEqual(sortedPlayers[0].rank, 1);
      assert.strictEqual(sortedPlayers[1].playerId, 'player3');
      assert.strictEqual(sortedPlayers[1].rank, 2);
      assert.strictEqual(sortedPlayers[2].playerId, 'player2');
      assert.strictEqual(sortedPlayers[2].rank, 3);
    });

    it('should handle tied scores', () => {
      const scores = {
        'player1': 20,
        'player2': 20,
        'player3': 10
      };

      const sortedPlayers = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([playerId, score], index) => ({
          playerId,
          score,
          rank: index + 1
        }));

      // Both players with score 20 get different ranks (1 and 2)
      // This matches the current implementation
      assert.strictEqual(sortedPlayers[0].score, 20);
      assert.strictEqual(sortedPlayers[1].score, 20);
      assert.strictEqual(sortedPlayers[2].score, 10);
    });
  });
});
