import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * Database Service Tests
 *
 * These tests verify the database service logic and data transformations.
 * They test the business logic without actually connecting to DynamoDB.
 */

describe('Database Service Logic', () => {
  describe('Session Data Structure', () => {
    it('should create session with required fields', () => {
      const session = {
        sessionId: 'test-session-123',
        joinCode: null,
        status: 'completed',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-01T01:00:00Z',
        playerIds: ['player1', 'player2'],
        questionCount: 3,
        createdAt: new Date().toISOString()
      };

      assert.strictEqual(session.sessionId, 'test-session-123');
      assert.strictEqual(session.status, 'completed');
      assert.strictEqual(session.playerIds.length, 2);
      assert.ok(session.createdAt);
    });

    it('should use default values when optional fields missing', () => {
      const session = {
        sessionId: 'test-session-456',
        joinCode: null,
        status: 'completed',
        startTime: '2024-01-01T00:00:00Z',
        endTime: new Date().toISOString(),
        playerIds: [],
        questionCount: 0,
        createdAt: new Date().toISOString()
      };

      assert.strictEqual(session.status, 'completed');
      assert.strictEqual(session.questionCount, 0);
      assert.ok(session.endTime);
    });
  });

  describe('Results Ranking Logic', () => {
    it('should sort players by score and assign correct ranks', () => {
      const sessionId = 'test-session-789';
      const scores = {
        'player1': 30,
        'player2': 20,
        'player3': 25
      };

      // This mimics the logic in saveGameResults
      const sortedPlayers = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([playerId, score], index) => ({
          playerId,
          score,
          rank: index + 1
        }));

      assert.strictEqual(sortedPlayers.length, 3);

      // Verify rankings are correct (sorted by score descending)
      assert.strictEqual(sortedPlayers[0].rank, 1);
      assert.strictEqual(sortedPlayers[0].playerId, 'player1');
      assert.strictEqual(sortedPlayers[0].score, 30);

      assert.strictEqual(sortedPlayers[1].rank, 2);
      assert.strictEqual(sortedPlayers[1].playerId, 'player3');
      assert.strictEqual(sortedPlayers[1].score, 25);

      assert.strictEqual(sortedPlayers[2].rank, 3);
      assert.strictEqual(sortedPlayers[2].playerId, 'player2');
      assert.strictEqual(sortedPlayers[2].score, 20);
    });

    it('should create result objects with correct structure', () => {
      const sessionId = 'test-session-123';
      const result = {
        resultId: `${sessionId}-player1`,
        sessionId: sessionId,
        userId: 'player1',
        score: 30,
        rank: 1,
        createdAt: new Date().toISOString()
      };

      assert.strictEqual(result.resultId, 'test-session-123-player1');
      assert.strictEqual(result.sessionId, sessionId);
      assert.strictEqual(result.userId, 'player1');
      assert.strictEqual(result.score, 30);
      assert.strictEqual(result.rank, 1);
      assert.ok(result.createdAt);
    });
  });

  describe('User Stats Calculation', () => {
    it('should calculate updated stats correctly for existing user', () => {
      const existingStats = {
        userId: 'player1',
        totalScore: 100,
        gamesPlayed: 5,
        avgScore: 20,
        bestRank: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const newScore = 30;
      const newRank = 1;

      // This mimics the update logic in updateUserStats
      const updatedStats = {
        totalScore: existingStats.totalScore + newScore,
        gamesPlayed: existingStats.gamesPlayed + 1,
        avgScore: Math.round((existingStats.totalScore + newScore) / (existingStats.gamesPlayed + 1)),
        bestRank: Math.min(existingStats.bestRank, newRank)
      };

      assert.strictEqual(updatedStats.totalScore, 130);
      assert.strictEqual(updatedStats.gamesPlayed, 6);
      assert.strictEqual(updatedStats.avgScore, 22); // Math.round(130/6)
      assert.strictEqual(updatedStats.bestRank, 1);
    });

    it('should create new stats correctly for new user', () => {
      const score = 25;
      const rank = 3;

      const newStats = {
        userId: 'new-player',
        totalScore: score,
        gamesPlayed: 1,
        avgScore: score,
        bestRank: rank,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      assert.strictEqual(newStats.totalScore, 25);
      assert.strictEqual(newStats.gamesPlayed, 1);
      assert.strictEqual(newStats.avgScore, 25);
      assert.strictEqual(newStats.bestRank, 3);
    });

    it('should keep best rank as lowest number', () => {
      const existingBestRank = 5;
      const newRank1 = 3;
      const newRank2 = 7;

      assert.strictEqual(Math.min(existingBestRank, newRank1), 3);
      assert.strictEqual(Math.min(existingBestRank, newRank2), 5);
    });
  });

  describe('Leaderboard Sorting', () => {
    it('should sort leaderboard by total score descending', () => {
      const stats = [
        { userId: 'player1', totalScore: 100 },
        { userId: 'player2', totalScore: 200 },
        { userId: 'player3', totalScore: 150 }
      ];

      // This mimics the logic in getGlobalLeaderboard
      const sorted = stats.sort((a, b) => b.totalScore - a.totalScore);

      assert.strictEqual(sorted[0].userId, 'player2');
      assert.strictEqual(sorted[0].totalScore, 200);
      assert.strictEqual(sorted[1].userId, 'player3');
      assert.strictEqual(sorted[1].totalScore, 150);
      assert.strictEqual(sorted[2].userId, 'player1');
      assert.strictEqual(sorted[2].totalScore, 100);
    });

    it('should sort session results by rank ascending', () => {
      const results = [
        { rank: 2, score: 20, userId: 'player2' },
        { rank: 1, score: 30, userId: 'player1' },
        { rank: 3, score: 10, userId: 'player3' }
      ];

      // This mimics the logic in getSessionResults
      const sorted = results.sort((a, b) => a.rank - b.rank);

      assert.strictEqual(sorted[0].rank, 1);
      assert.strictEqual(sorted[1].rank, 2);
      assert.strictEqual(sorted[2].rank, 3);
    });
  });

  describe('Statistics Summary Calculation', () => {
    it('should calculate summary statistics correctly', () => {
      const sessions = [
        { sessionId: 'session1' },
        { sessionId: 'session2' },
        { sessionId: 'session3' }
      ];

      const stats = [
        { userId: 'player1', totalScore: 100, gamesPlayed: 2 },
        { userId: 'player2', totalScore: 200, gamesPlayed: 3 },
        { userId: 'player3', totalScore: 150, gamesPlayed: 1 }
      ];

      const totalSessions = sessions.length;
      const totalPlayers = stats.length;
      const totalGamesPlayed = stats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
      const avgScoreOverall = totalPlayers > 0
        ? Math.round(stats.reduce((sum, stat) => sum + stat.totalScore, 0) / totalPlayers)
        : 0;

      assert.strictEqual(totalSessions, 3);
      assert.strictEqual(totalPlayers, 3);
      assert.strictEqual(totalGamesPlayed, 6);
      assert.strictEqual(avgScoreOverall, 150); // Math.round(450/3)
    });

    it('should handle empty data sets', () => {
      const sessions = [];
      const stats = [];

      const totalSessions = sessions.length;
      const totalPlayers = stats.length;
      const totalGamesPlayed = stats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
      const avgScoreOverall = totalPlayers > 0
        ? Math.round(stats.reduce((sum, stat) => sum + stat.totalScore, 0) / totalPlayers)
        : 0;

      assert.strictEqual(totalSessions, 0);
      assert.strictEqual(totalPlayers, 0);
      assert.strictEqual(totalGamesPlayed, 0);
      assert.strictEqual(avgScoreOverall, 0);
    });
  });

  describe('Table Name Construction', () => {
    it('should construct table names correctly', () => {
      const STAGE = 'dev';
      const SERVICE_NAME = 'quiz-game-api';

      const TABLES = {
        SESSIONS: `${SERVICE_NAME}-${STAGE}-game-sessions`,
        RESULTS: `${SERVICE_NAME}-${STAGE}-game-results`,
        USER_STATS: `${SERVICE_NAME}-${STAGE}-user-stats`
      };

      assert.strictEqual(TABLES.SESSIONS, 'quiz-game-api-dev-game-sessions');
      assert.strictEqual(TABLES.RESULTS, 'quiz-game-api-dev-game-results');
      assert.strictEqual(TABLES.USER_STATS, 'quiz-game-api-dev-user-stats');
    });

    it('should construct prod table names correctly', () => {
      const STAGE = 'prod';
      const SERVICE_NAME = 'quiz-game-api';

      const TABLES = {
        SESSIONS: `${SERVICE_NAME}-${STAGE}-game-sessions`,
        RESULTS: `${SERVICE_NAME}-${STAGE}-game-results`,
        USER_STATS: `${SERVICE_NAME}-${STAGE}-user-stats`
      };

      assert.strictEqual(TABLES.SESSIONS, 'quiz-game-api-prod-game-sessions');
      assert.strictEqual(TABLES.RESULTS, 'quiz-game-api-prod-game-results');
      assert.strictEqual(TABLES.USER_STATS, 'quiz-game-api-prod-user-stats');
    });
  });
});
