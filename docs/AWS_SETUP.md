# How to Set Up AWS Credentials for Deployment

## 1. Create an AWS Account

- All of the following is possible with the Free Tier, but after 6 months, the account will be closed unless the account is upgraded.

## 2. Create IAM User with Credentials

1. Log into AWS Console
2. Search for "IAM" service
3. Click "Users" → " Create user"
4. Enter username (e.g. `quiz-game-dev`)
5. Click "Next"
6. Select "Attach policies directly"
7. Add these permissions:
   - `AmazonDynamoDBFullAccess`
   - `AWSLambda_FullAccess`
   - `IAMFullAccess` (Serverless Framework deployment)
   - `AWSCloudFormationFullAccess` (Serverless Framework deployment)
   - `AmazonAPIGatewayAdministrator` (API endpoints)
   - `AmazonS3FullAccess` (storing deployment artifacts)
   - `CloudWatchLogsFullAccess` (logging)
   - ***TBD***
8. Click "Next" → "Create user"

## 3. Generate Access Keys

1. Click on the newly created user
2. Go to the "Security Credentials" tab
3. Scroll to the "Access Keys" section
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT:** Copy both of these values:
  - **Access key ID**
  - **Secret access key**

## 4. Add to `.env` File

Create / edit the `.env` file in the project root:

```ini
AWS_REGION=us-east-1
STAGE=dev
SERVICE_NAME=quiz-game-api

# paste the credentials here
AWS_ACCESS_KEY_ID= ...
AWS_SECRET_ACCESS_KEY= ...
```

