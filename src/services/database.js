import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

const STAGE = process.env.STAGE || 'dev';
const SERVICE_NAME = process.env.SERVICE_NAME || 'quiz-game-api';

// Table names
const TABLES = {
  SESSIONS: `${SERVICE_NAME}-${STAGE}-game-sessions`,
  RESULTS: `${SERVICE_NAME}-${STAGE}-game-results`,
  USER_STATS: `${SERVICE_NAME}-${STAGE}-user-stats`
};

/**
 * Save a game session to DynamoDB
 * @param {Object} session - Session data
 * @returns {Promise<Object>} - Saved session
 */
export async function saveGameSession(session) {
  const item = {
    sessionId: session.sessionId,
    joinCode: session.joinCode || null,
    status: session.status || 'completed',
    startTime: session.startTime,
    endTime: session.endTime || new Date().toISOString(),
    playerIds: session.playerIds || [],
    questionCount: session.questionCount || 0,
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: TABLES.SESSIONS,
    Item: item
  });

  await docClient.send(command);
  return item;
}

/**
 * Save game results for all players in a session
 * @param {string} sessionId - Session ID
 * @param {Object} scores - Player scores object { playerId: score }
 * @returns {Promise<Array>} - Saved results
 */
export async function saveGameResults(sessionId, scores) {
  // Sort players by score to determine rank
  const sortedPlayers = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([playerId, score], index) => ({
      playerId,
      score,
      rank: index + 1
    }));

  const promises = sortedPlayers.map(async (result) => {
    const item = {
      resultId: `${sessionId}-${result.playerId}`,
      sessionId,
      userId: result.playerId,
      score: result.score,
      rank: result.rank,
      createdAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: TABLES.RESULTS,
      Item: item
    });

    await docClient.send(command);

    // Update user stats
    await updateUserStats(result.playerId, result.score, result.rank);

    return item;
  });

  return Promise.all(promises);
}

/**
 * Update user statistics
 * @param {string} userId - User ID
 * @param {number} score - Score from this game
 * @param {number} rank - Rank in this game
 */
async function updateUserStats(userId, score, rank) {
  // First, try to get existing stats
  const getCommand = new GetCommand({
    TableName: TABLES.USER_STATS,
    Key: { userId }
  });

  let stats;
  try {
    const result = await docClient.send(getCommand);
    stats = result.Item;
  } catch (error) {
    stats = null;
  }

  if (stats) {
    // Update existing stats
    const updateCommand = new UpdateCommand({
      TableName: TABLES.USER_STATS,
      Key: { userId },
      UpdateExpression: 'SET totalScore = :totalScore, gamesPlayed = :gamesPlayed, avgScore = :avgScore, bestRank = :bestRank, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':totalScore': stats.totalScore + score,
        ':gamesPlayed': stats.gamesPlayed + 1,
        ':avgScore': Math.round((stats.totalScore + score) / (stats.gamesPlayed + 1)),
        ':bestRank': Math.min(stats.bestRank || rank, rank),
        ':updatedAt': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);
  } else {
    // Create new stats
    const item = {
      userId,
      totalScore: score,
      gamesPlayed: 1,
      avgScore: score,
      bestRank: rank,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const putCommand = new PutCommand({
      TableName: TABLES.USER_STATS,
      Item: item
    });

    await docClient.send(putCommand);
  }
}

/**
 * Get all game sessions
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} - Array of sessions
 */
export async function getGameSessions(limit = 50) {
  const command = new ScanCommand({
    TableName: TABLES.SESSIONS,
    Limit: limit
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

/**
 * Get a specific game session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} - Session data or null
 */
export async function getGameSession(sessionId) {
  const command = new GetCommand({
    TableName: TABLES.SESSIONS,
    Key: { sessionId }
  });

  const result = await docClient.send(command);
  return result.Item || null;
}

/**
 * Get session results (leaderboard)
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} - Array of results sorted by rank
 */
export async function getSessionResults(sessionId) {
  const command = new QueryCommand({
    TableName: TABLES.RESULTS,
    IndexName: 'SessionRankIndex',
    KeyConditionExpression: 'sessionId = :sessionId',
    ExpressionAttributeValues: {
      ':sessionId': sessionId
    }
  });

  const result = await docClient.send(command);
  return (result.Items || []).sort((a, b) => a.rank - b.rank);
}

/**
 * Get global leaderboard
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>} - Array of user stats sorted by total score
 */
export async function getGlobalLeaderboard(limit = 100) {
  const command = new ScanCommand({
    TableName: TABLES.USER_STATS,
    Limit: limit
  });

  const result = await docClient.send(command);
  const items = result.Items || [];

  // Sort by total score descending
  return items.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Get statistics summary
 * @returns {Promise<Object>} - Summary statistics
 */
export async function getStatsSummary() {
  const [sessions, stats] = await Promise.all([
    getGameSessions(1000),
    docClient.send(new ScanCommand({ TableName: TABLES.USER_STATS, Limit: 1000 }))
  ]);

  const totalSessions = sessions.length;
  const totalPlayers = (stats.Items || []).length;
  const totalGamesPlayed = (stats.Items || []).reduce((sum, stat) => sum + (stat.gamesPlayed || 0), 0);
  const avgScoreOverall = totalPlayers > 0
    ? Math.round((stats.Items || []).reduce((sum, stat) => sum + (stat.totalScore || 0), 0) / totalPlayers)
    : 0;

  return {
    totalSessions,
    totalPlayers,
    totalGamesPlayed,
    avgScoreOverall
  };
}