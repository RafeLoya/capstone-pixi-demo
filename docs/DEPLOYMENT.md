# Deployment Guide - Hybrid Architecture

This guide explains how to deploy the quiz game with the hybrid architecture:
- **Game Server**: Handles real-time multiplayer gameplay
- **Serverless APIs**: Provides read-only dashboard data via AWS Lambda + DynamoDB
- **Dashboard**: Static site hosted on GitHub Pages

## Architecture Overview

```
┌─────────────────────────────────────┐
│   GAME SERVER (Persistent)          │
│   - Socket.io for real-time play    │
│   - Writes session data to DynamoDB │
│   - Can be hosted on:               │
│     • Render.com (free tier)        │
│     • AWS EC2/Fargate               │
│     • Heroku, Railway, etc.         │
└─────────────────────────────────────┘
                 │
                 │ (saves data)
                 ▼
┌─────────────────────────────────────┐
│   AWS SERVERLESS (DynamoDB + Lambda)│
│   - DynamoDB: Stores game data      │
│   - Lambda: Read-only APIs          │
│   - API Gateway: Public endpoints   │
└─────────────────────────────────────┘
                 │
                 │ (queries)
                 ▼
┌─────────────────────────────────────┐
│   DASHBOARD (GitHub Pages)          │
│   - Static HTML/CSS/JS              │
│   - Displays leaderboards & stats   │
│   - Export data to CSV              │
└─────────────────────────────────────┘
```

## Prerequisites

1. **Node.js** (v20 or higher)
2. **AWS Account** (for DynamoDB + Lambda)
3. **AWS CLI** configured with credentials
4. **Serverless Framework** (`npm install -g serverless`)
5. **GitHub Account** (for hosting dashboard)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Deploy Serverless Infrastructure to AWS

This creates DynamoDB tables and Lambda function APIs:

```bash
# Configure AWS credentials (if not already done)
aws configure

# Deploy to development
npm run deploy:dev

# Or deploy to production
npm run deploy:prod
```

After deployment, you'll get an API endpoint like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

**Save this URL** - you'll need it for both the game server and dashboard.

## Step 3: Configure Game Server Environment

Create a `.env` file in the project root:

```ini
# AWS Configuration
AWS_REGION=us-east-1
STAGE=dev
SERVICE_NAME=quiz-game-api

# AWS Credentials (for DynamoDB access)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

**Note**: The game server needs AWS credentials to write to DynamoDB.

## Step 4: Deploy Game Server

You have several options for hosting the game server:

### Option A: Render.com (Free Tier - Recommended for Testing)

1. Create account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all from your `.env` file
5. Deploy

### Option B: AWS EC2/Fargate

1. Create EC2 instance (t2.micro eligible for free tier)
2. SSH into instance
3. Clone repository
4. Run `npm install && npm start`
5. Configure security group to allow port 3000

### Option C: Local Development

```bash
npm start
```

Server runs on `http://localhost:3000`

## Step 5: Deploy Dashboard to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: Select your branch and `/dashboard` folder
   - Save

2. **Configure API URL**:
   - GitHub will provide a URL like: `https://username.github.io/quiz-prototype/`
   - Open the dashboard in your browser
   - Enter your API base URL (from Step 2) in the input field
   - The dashboard will save this URL in localStorage

3. **Test Dashboard**:
   - Play some games to generate data
   - Refresh dashboard to see leaderboards and session data
   - Use "Export Leaderboard" button to download CSV

## Step 6: Test the Complete Flow

1. **Play a game**:
   - Open game at your server URL (e.g., `https://your-app.onrender.com`)
   - Open 2+ browser tabs
   - Play through a quiz session

2. **Verify data persistence**:
   - Check server logs: "Game session [id] saved successfully!"
   - Check DynamoDB tables in AWS Console

3. **View dashboard**:
   - Open dashboard at GitHub Pages URL
   - See session data, leaderboard, statistics
   - Export data as CSV

## API Endpoints

All endpoints are public (no authentication required):

- `GET /api/public/sessions` - List all game sessions
- `GET /api/public/sessions/{sessionId}` - Get session details
- `GET /api/public/leaderboard` - Global leaderboard (all players)
- `GET /api/public/leaderboard/session/{sessionId}` - Session leaderboard
- `GET /api/public/stats/summary` - Overall statistics summary

## Cost Estimates

**AWS Costs** (assuming moderate usage):
- DynamoDB: Free tier covers ~25GB + 25 read/write units
- Lambda: Free tier covers 1M requests/month
- API Gateway: Free tier covers 1M API calls/month
- **Estimated**: $0-5/month for low-moderate usage

**Game Server Costs**:
- Render.com: Free tier available (sleeps after inactivity)
- AWS EC2 t2.micro: Free tier eligible (first year)
- **Estimated**: $0-15/month

**Dashboard**: Free (GitHub Pages)

## Troubleshooting

### Game server can't connect to DynamoDB
- Check AWS credentials in `.env`
- Verify IAM permissions include DynamoDB access
- Check AWS region matches `serverless.yml`

### Dashboard shows "Failed to load"
- Verify API URL is correct (from `serverless deploy` output)
- Check CORS is enabled in `serverless.yml`
- Open browser console for detailed error messages

### No data showing in dashboard
- Play at least one complete game session
- Check server logs for "saved successfully" message
- Verify DynamoDB tables exist in AWS Console

## Development vs Production

**Development (`dev` stage)**:
- Use for testing
- Separate DynamoDB tables
- Lower costs

**Production (`prod` stage)**:
- Deploy with `npm run deploy:prod`
- Separate infrastructure
- Update `.env` to `STAGE=prod`

## Security Notes

- Dashboard APIs are **public** (read-only, no sensitive data)
- Game server requires AWS credentials (keep `.env` secure)
- Never commit `.env` to git (already in `.gitignore`)
- For production, use IAM roles instead of access keys

## Next Steps

- Add authentication for game sessions (optional)
- Implement advanced metrics (speech analysis, answer patterns)
- Add data visualization charts to dashboard
- Create scheduled exports for recruiters