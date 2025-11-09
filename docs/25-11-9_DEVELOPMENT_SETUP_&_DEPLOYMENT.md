# Development Setup & Testing Guide

This guide walks you through setting up and testing the complete quiz game system on your local machine.

## Prerequisites

- Node.js v20 or higher
- npm (comes with Node.js)
- AWS Account (free tier eligible)
- Modern web browser

## Part 1: AWS Account Setup

### 1.1 Create AWS Account

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process (free tier available)

### 1.2 Create IAM User with Credentials

1. Log into AWS Console
2. Search for "IAM" service
3. Navigate to **Users** → **Create user**
4. Enter username (e.g., `ncbc-capstone-dev`)
5. Click **Next**

### 1.3 Attach Permissions

1. Select **Attach policies directly**
2. Search for and attach: **`AdministratorAccess`**
   - This gives full AWS permissions (recommended for ***development***)
   - ***For production, use more restrictive permissions!***
3. Click **Next** → **Create user**

### 1.4 Generate Access Keys

1. Click on your newly created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **IMPORTANT:** Copy both values:
   - Access key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - Secret access key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

**⚠️ Security Note:** Keep these credentials private. Never commit them to git.

## Part 2: Local Environment Setup

### 2.1 Install Dependencies

```bash
cd quiz-prototype
npm install
```

### 2.2 Install Serverless Framework

```bash
npm install -g serverless
```

Verify installation:
```bash
serverless --version
```

### 2.3 Install AWS CLI (Optional but Recommended)

*If not performed, you will have to use the web portal instead.*

Consult the download page: [Installing or updating to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

**On Mac (using Homebrew):**
```bash
brew install awscli
```

**On Windows:**
Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi

**On Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Verify installation:
```bash
aws --version
```

### 2.4 Configure AWS Credentials

Run AWS configure:
```bash
aws configure
```

When prompted, enter:
- **AWS Access Key ID:** [Paste from step 1.4]
- **AWS Secret Access Key:** [Paste from step 1.4]
- **Default region name:** `us-east-1`
- **Default output format:** `json`

### 2.5 Create .env File

Create a `.env` file in the project root:

```env
# AWS Configuration
AWS_REGION=us-east-1
STAGE=dev
SERVICE_NAME=quiz-game-api

# AWS Credentials (same as aws configure)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Optional: Game server configuration
PORT=3000
```

**⚠️ Security Note:** The `.env` file is already in `.gitignore`. Never commit it to version control.

## Part 3: Deploy AWS Infrastructure

### 3.1 Deploy Serverless Stack

This creates DynamoDB tables, Lambda functions, and API Gateway endpoints:

```bash
npm run deploy:dev
```

**Expected output:**
```
Deploying quiz-game-api to stage dev...
✔ Service deployed to stack quiz-game-api-dev

endpoints:
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/public/sessions
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/public/sessions/{sessionId}
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/public/leaderboard
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/public/leaderboard/session/{sessionId}
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/public/stats/summary

functions:
  dashboardListSessions: quiz-game-api-dev-dashboardListSessions
  dashboardGetSession: quiz-game-api-dev-dashboardGetSession
  dashboardGlobalLeaderboard: quiz-game-api-dev-dashboardGlobalLeaderboard
  dashboardSessionLeaderboard: quiz-game-api-dev-dashboardSessionLeaderboard
  dashboardStatsSummary: quiz-game-api-dev-dashboardStatsSummary
```

**⚠️ IMPORTANT:** Copy the base API endpoint URL (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev`) - you'll need this for the dashboard.

Deployment typically takes 2-3 minutes.

### 3.2 Verify AWS Resources

Go to AWS Console and verify:

1. **DynamoDB Tables:**
   - `quiz-game-api-dev-game-sessions`
   - `quiz-game-api-dev-game-results`
   - `quiz-game-api-dev-user-stats`

2. **Lambda Functions:**
   - Five functions starting with `quiz-game-api-dev-dashboard*`

3. **API Gateway:**
   - API named `dev-quiz-game-api`

## Part 4: Test the Complete System

### 4.1 Start the Game Server

```bash
npm start
```

**Expected output:**
```
Server running on http://localhost:3000
```

Leave this terminal running.

### 4.2 Play a Game Session

1. Open your browser
2. Open **2 or more tabs** to `http://localhost:3000`
3. Each tab represents a different player
4. Game starts automatically when 2+ players connect
5. Answer all 3 questions in each tab
6. View final scores

### 4.3 Verify Data Persistence

Check the server terminal for:
```
Game session [session-id] saved successfully!
```

**Optional:** Go to AWS Console → DynamoDB → `quiz-game-api-dev-game-sessions` → **Explore table items** to see your data.

### 4.4 Test the Dashboard

1. Open `docs/index.html` in your browser:
   ```bash
   # Mac/Linux
   open docs/index.html

   # Or just double-click the file
   ```

2. Enter your API endpoint URL (from step 3.1) in the input field

3. Verify the dashboard displays:
   - List of game sessions
   - Leaderboard with player rankings
   - Statistics (total games, average scores, etc.)
   - Export CSV button works

4. Open browser DevTools (F12) and check Console for errors
   - Should see no errors if everything is working correctly

## Part 5: Troubleshooting

### Game won't start
- Ensure 2+ browser tabs are open
- Check server terminal for "Player connected" messages
- Refresh browsers if needed

### Dashboard shows "Failed to load"
- Verify API URL is correct (should end with `/dev`, no trailing slash)
- Check browser console for CORS errors
- Verify Lambda functions are deployed (AWS Console → Lambda)

### Data not saving to DynamoDB
- Check `.env` file has correct AWS credentials
- Verify credentials have DynamoDB permissions
- Check server terminal for error messages

### Deployment fails with permission errors
- Ensure IAM user has `AdministratorAccess` policy attached
- Run `aws configure` again to verify credentials
- Check that you're using the correct AWS region (`us-east-1`)

### "Security token is invalid" error
- Clear environment variables: `unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY`
- Run `aws configure` again with fresh credentials
- Restart your terminal

## Part 6: Cleanup (When Done Testing)

### Remove AWS Resources

To avoid any potential AWS charges:

```bash
serverless remove --stage dev
```

This deletes:
- All Lambda functions
- API Gateway
- DynamoDB tables (⚠️ deletes all data)
- CloudFormation stack

### Stop Local Server

In the terminal running the game server, press `Ctrl+C`.

## Development vs Production

This guide covers **development setup**. For production:

- Use `npm run deploy:prod` instead of `deploy:dev`
- Update `.env` to `STAGE=prod`
- Deploy game server to Render.com, AWS EC2, or similar
- Deploy dashboard to GitHub Pages
- Use more restrictive IAM permissions (not AdministratorAccess)
- Consider using AWS IAM roles instead of access keys for game server

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment instructions.

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Deploy serverless infrastructure
npm run deploy:dev

# Start game server
npm start

# Run tests
npm test

# Remove AWS resources
serverless remove --stage dev

# View deployment info
serverless info --stage dev

# Check AWS configuration
aws configure list
```

## Architecture Overview

```
┌─────────────────────────────────────┐
│   GAME SERVER (localhost:3000)      │
│   - Node.js + Socket.io             │
│   - Handles real-time gameplay      │
│   - Writes to DynamoDB              │
└─────────────────────────────────────┘
                 │
                 │ (saves game data)
                 ▼
┌─────────────────────────────────────┐
│   AWS SERVERLESS                    │
│   - DynamoDB: Stores game data      │
│   - Lambda: Read-only APIs          │
│   - API Gateway: Public endpoints   │
└─────────────────────────────────────┘
                 │
                 │ (queries)
                 ▼
┌─────────────────────────────────────┐
│   DASHBOARD (docs/index.html)       │
│   - Static HTML/CSS/JS              │
│   - Displays leaderboards & stats   │
│   - Export data to CSV              │
└─────────────────────────────────────┘
```

## Next Steps

Once everything is working locally:

1. See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for multi-device demo setup
3. Consider adding Chart.js visualizations to the dashboard
4. Explore the codebase:
   - `src/server.js` - Game server logic
   - `src/handlers/` - Lambda function handlers
   - `docs/` - Dashboard frontend
   - `serverless.yml` - Infrastructure configuration
