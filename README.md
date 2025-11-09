# Quiz Prototype

A multiplayer quiz game built with Pixi.js and Socket.io.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open multiple browser tabs to `http://localhost:3000` to test multiplayer

## How It Works

### Client (Pixi.js)
- `src/main.js` - Entry point, initializes Pixi app
- `src/game.js` - Game controller, manages scenes and socket connection
- `src/scenes/quiz-scene.js` - Displays questions and answer buttons
- `src/scenes/result-scene.js` - Shows final scores
- `src/components/choice-button.js` - Interactive answer button

### Server (Node.js + Socket.io)
- `server.js` - Game server with authority over scoring
- Manages game state, player connections, and question flow
- Calculates scores based on:
  - Correct answers (10 pts)
  - Everyone correct bonus (+5 pts)
  - First correct answer bonus (+5 pts)

## Game Flow

1. Players connect → Server waits for 2+ players
2. Server sends question → All clients display it
3. Players submit answers → Server tracks timestamps
4. All players answer → Server calculates scores
5. Server broadcasts results → Clients show feedback
6. Repeat for 3 questions
7. Final scores displayed

## Next Steps

- Add more visual feedback and animations
- Create proper lobby system
- Add more questions or question API

## Architecture

This project uses a **hybrid architecture**:

- **Game Server** (Node.js + Socket.io): Handles real-time multiplayer gameplay
- **Serverless APIs** (AWS Lambda + DynamoDB): Provides read-only dashboard data
- **Dashboard** (GitHub Pages): Static site for viewing leaderboards and exporting data

### Why Hybrid?

- Real-time gameplay requires persistent WebSocket connections (game server)
- Data querying/export works great with serverless (always available, pay-per-use)
- Best of both worlds: performance + scalability

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Start**:

```bash
# 1. Install dependencies
npm install

# 2. Deploy serverless infrastructure
npm run deploy:dev

# 3. Configure environment
# Edit .env with your AWS credentials

# 4. Start game server
npm start

# 5. Deploy dashboard to GitHub Pages
# (Settings → Pages → Deploy from /dashboard folder)
```

## Required `.env` Variables

```ini
# AWS configuration
AWS_REGION=us-east-1
STAGE=dev
SERVICE_NAME=quiz-game-api

# AWS credentials
# REQUIRED FOR DB WRITES
# obtained from AWS IAM console
AWS_ACCESS_KEY_ID=▓▓▓▓▓▓▓▓▓▓
AWS_SECRET_ACCESS_KEY=▓▓▓▓▓▓▓▓▓▓

# optional: game server configuration
PORT=3000
```

## Dashboard

Once deployed, the dashboard provides:
- Global leaderboards (all players)
- Session-by-session results
- Overall statistics (total games, avg scores, etc.)
- CSV export for recruiters

## Quick Demo

Want to demo with 4 players on local network? See **[DEMO_GUIDE.md](./docs/DEMO_GUIDE.md)** for:
- Step-by-step setup (5 minutes)
- Host configuration
- Connecting other devices
- Troubleshooting tips
- Demo presentation script

**Quick Start for Demo:**
```bash
npm install
npm start
# Other devices connect to http://[YOUR_IP]:3000
```