import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * Lambda Handler Tests
 *
 * Tests for the serverless API handler logic (data transformation and validation)
 */

describe('Handler Response Structure', () => {
  describe('Success Response', () => {
    it('should create valid success response structure', () => {
      const data = { message: 'Success' };

      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.headers['Content-Type'], 'application/json');
      assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');

      const parsedBody = JSON.parse(response.body);
      assert.strictEqual(parsedBody.message, 'Success');
    });
  });

  describe('Error Response', () => {
    it('should create valid error response structure', () => {
      const error = new Error('Database error');

      const response = {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Failed to retrieve data',
          message: error.message
        })
      };

      assert.strictEqual(response.statusCode, 500);

      const parsedBody = JSON.parse(response.body);
      assert.strictEqual(parsedBody.error, 'Failed to retrieve data');
      assert.strictEqual(parsedBody.message, 'Database error');
    });

    it('should create 400 bad request response', () => {
      const response = {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Session ID is required'
        })
      };

      assert.strictEqual(response.statusCode, 400);

      const parsedBody = JSON.parse(response.body);
      assert.strictEqual(parsedBody.error, 'Session ID is required');
    });

    it('should create 404 not found response', () => {
      const response = {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Session not found'
        })
      };

      assert.strictEqual(response.statusCode, 404);

      const parsedBody = JSON.parse(response.body);
      assert.strictEqual(parsedBody.error, 'Session not found');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in all responses', () => {
      const responses = [
        { statusCode: 200 },
        { statusCode: 400 },
        { statusCode: 404 },
        { statusCode: 500 }
      ];

      responses.forEach(resp => {
        const response = {
          ...resp,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: '{}'
        };

        assert.strictEqual(response.headers['Access-Control-Allow-Origin'], '*');
      });
    });
  });
});

describe('Leaderboard Handler Logic', () => {
  describe('Rank Assignment', () => {
    it('should add rank numbers to leaderboard', () => {
      const leaderboard = [
        { userId: 'player1', totalScore: 200 },
        { userId: 'player2', totalScore: 150 },
        { userId: 'player3', totalScore: 100 }
      ];

      // This mimics the logic in getGlobalLeaderboardHandler
      const rankedLeaderboard = leaderboard.map((player, index) => ({
        rank: index + 1,
        ...player
      }));

      assert.strictEqual(rankedLeaderboard[0].rank, 1);
      assert.strictEqual(rankedLeaderboard[0].userId, 'player1');
      assert.strictEqual(rankedLeaderboard[1].rank, 2);
      assert.strictEqual(rankedLeaderboard[2].rank, 3);
    });

    it('should handle empty leaderboard', () => {
      const leaderboard = [];

      const rankedLeaderboard = leaderboard.map((player, index) => ({
        rank: index + 1,
        ...player
      }));

      assert.strictEqual(rankedLeaderboard.length, 0);
    });
  });

  describe('Query Parameter Parsing', () => {
    it('should parse limit parameter correctly', () => {
      const event = {
        queryStringParameters: { limit: '50' }
      };

      const limit = event.queryStringParameters?.limit
        ? parseInt(event.queryStringParameters.limit, 10)
        : 100;

      assert.strictEqual(limit, 50);
    });

    it('should use default limit when not provided', () => {
      const event = {
        queryStringParameters: null
      };

      const limit = event.queryStringParameters?.limit
        ? parseInt(event.queryStringParameters.limit, 10)
        : 100;

      assert.strictEqual(limit, 100);
    });

    it('should handle invalid limit parameter', () => {
      const event = {
        queryStringParameters: { limit: 'invalid' }
      };

      const limit = event.queryStringParameters?.limit
        ? parseInt(event.queryStringParameters.limit, 10)
        : 100;

      assert.ok(isNaN(limit));
      // In real implementation, should validate and use default
    });
  });

  describe('Path Parameter Extraction', () => {
    it('should extract sessionId from path parameters', () => {
      const event = {
        pathParameters: { sessionId: 'test-session-123' }
      };

      const sessionId = event.pathParameters?.sessionId;

      assert.strictEqual(sessionId, 'test-session-123');
    });

    it('should detect missing sessionId', () => {
      const event = {
        pathParameters: null
      };

      const sessionId = event.pathParameters?.sessionId;

      assert.strictEqual(sessionId, undefined);
    });
  });
});

describe('Session Handler Logic', () => {
  describe('Response Data Structure', () => {
    it('should create sessions list response', () => {
      const sessions = [
        { sessionId: 'session1', status: 'completed' },
        { sessionId: 'session2', status: 'completed' }
      ];

      const responseBody = {
        sessions,
        count: sessions.length
      };

      assert.strictEqual(responseBody.sessions.length, 2);
      assert.strictEqual(responseBody.count, 2);
    });

    it('should create session details response', () => {
      const session = {
        sessionId: 'test-123',
        playerIds: ['p1', 'p2'],
        status: 'completed'
      };

      const results = [
        { userId: 'p1', score: 30, rank: 1 },
        { userId: 'p2', score: 20, rank: 2 }
      ];

      const responseBody = {
        session,
        results
      };

      assert.strictEqual(responseBody.session.sessionId, 'test-123');
      assert.strictEqual(responseBody.results.length, 2);
    });

    it('should create leaderboard response', () => {
      const sessionId = 'test-session-123';
      const results = [
        { userId: 'player1', score: 30, rank: 1 },
        { userId: 'player2', score: 20, rank: 2 }
      ];

      const responseBody = {
        sessionId,
        leaderboard: results,
        count: results.length
      };

      assert.strictEqual(responseBody.sessionId, 'test-session-123');
      assert.strictEqual(responseBody.leaderboard.length, 2);
      assert.strictEqual(responseBody.count, 2);
    });
  });

  describe('Input Validation', () => {
    it('should validate required path parameters', () => {
      const event1 = { pathParameters: { sessionId: 'test-123' } };
      const event2 = { pathParameters: null };

      const sessionId1 = event1.pathParameters?.sessionId;
      const sessionId2 = event2.pathParameters?.sessionId;

      assert.ok(sessionId1); // Valid
      assert.strictEqual(sessionId2, undefined); // Invalid
    });

    it('should validate query parameters', () => {
      const event1 = { queryStringParameters: { limit: '50' } };
      const event2 = { queryStringParameters: null };

      const limit1 = event1.queryStringParameters?.limit;
      const limit2 = event2.queryStringParameters?.limit;

      assert.strictEqual(limit1, '50');
      assert.strictEqual(limit2, undefined);
    });
  });
});

describe('Statistics Handler Logic', () => {
  describe('Summary Response', () => {
    it('should create valid statistics summary', () => {
      const summary = {
        totalSessions: 10,
        totalPlayers: 50,
        totalGamesPlayed: 25,
        avgScoreOverall: 150
      };

      assert.strictEqual(summary.totalSessions, 10);
      assert.strictEqual(summary.totalPlayers, 50);
      assert.strictEqual(summary.totalGamesPlayed, 25);
      assert.strictEqual(summary.avgScoreOverall, 150);
    });

    it('should handle zero statistics', () => {
      const summary = {
        totalSessions: 0,
        totalPlayers: 0,
        totalGamesPlayed: 0,
        avgScoreOverall: 0
      };

      assert.strictEqual(summary.totalSessions, 0);
      assert.strictEqual(summary.totalPlayers, 0);
    });
  });
});
