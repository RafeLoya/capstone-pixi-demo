# Test Suite

This directory contains tests for the quiz prototype application using Node.js built-in test runner (no external dependencies required).

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Test Files

### `database.test.js`
Tests for database service logic including:
- Session data structure validation
- Results ranking calculation
- User statistics updates
- Leaderboard sorting
- Statistics summary calculations
- Table name construction

### `handlers.test.js`
Tests for Lambda handler logic including:
- HTTP response structure validation
- CORS headers
- Query parameter parsing
- Path parameter extraction
- Input validation
- Response data structures

### `server.test.js`
Tests for game server logic including:
- Scoring algorithm (correct answers, bonuses)
- Game state management
- Player answer tracking
- Ranking calculations

## Test Framework

Uses Node.js built-in test runner (`node:test`) available in Node.js 20+:
- **Zero dependencies** - No external testing frameworks needed
- **Built-in assertions** - Uses `node:assert`
- **Fast** - Runs in ~50ms
- **Watch mode** - Automatically reruns tests on file changes

## Coverage

Current test coverage:
- **47 tests** across **25 test suites**
- **Database logic**: 14 tests
- **Handler logic**: 18 tests
- **Game server logic**: 15 tests

All critical business logic is tested including:
- Point calculations (base points, all-correct bonus, first-correct bonus)
- Player ranking
- Statistics aggregation
- API response formatting
- Data transformations

## Adding New Tests

Create a new test file in this directory following the pattern:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      const result = functionToTest();
      assert.strictEqual(result, expectedValue);
    });
  });
});
```

## Notes

- Tests focus on **business logic** and **data transformations**
- Tests **do not** require AWS credentials or external services
- Tests verify the correctness of algorithms and data structures
- Integration tests with actual DynamoDB/Socket.io connections should be added separately if needed
