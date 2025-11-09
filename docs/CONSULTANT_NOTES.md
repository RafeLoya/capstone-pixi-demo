# Notes for Future Consultants

This document contains important TODOs and information for consultants continuing this project.

## TODO Items

### 1. Save API Endpoint URL from Deployment

After running `npm run deploy:dev` or `npm run deploy:prod`, you'll receive an API Gateway endpoint URL like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

**Action needed:** Document where/how this URL should be saved for team reference. Consider:
- Adding to project README
- Storing in team documentation
- Setting as environment variable for CI/CD

### 2. IAM Roles for Production Deployment

Currently, the game server uses AWS access keys for authentication. For production, migrate to IAM roles:

**Steps:**

1. Deploy game server to AWS infrastructure (EC2/ECS/Fargate)
2. Create and attach an IAM role to that service with appropriate DynamoDB permissions
3. Remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env`
4. AWS SDK will automatically use the attached IAM role credentials

**Benefits:**
- More secure (no hardcoded credentials)
- Automatic credential rotation
- Better audit trail
- Follows AWS best practices

**Reference:** See `AWS_SETUP.md` for current access key setup

### 3. Additional AWS Permissions Needed

The list in `AWS_SETUP.md` line 23 shows "***TBD***" - verify if any additional AWS permissions are needed beyond:
- `AmazonDynamoDBFullAccess`
- `AWSLambda_FullAccess`
- `IAMFullAccess`
- `AWSCloudFormationFullAccess`
- `AmazonAPIGatewayAdministrator`
- `AmazonS3FullAccess`
- `CloudWatchLogsFullAccess`

Test thoroughly and document any additional required permissions.

## Architecture Considerations

### Current Setup
- Game server runs outside AWS (local/Render.com/Heroku)
- Uses access keys to write to DynamoDB
- Dashboard is static (GitHub Pages)
- Lambda functions provide read-only APIs

### Recommended Production Architecture
- Game server on AWS (EC2/ECS/Fargate) with IAM role
- Dashboard remains on GitHub Pages
- Consider adding CloudFront CDN for dashboard
- Consider adding authentication for game sessions

## Questions to Address

1. Should the API Gateway endpoints have authentication?
2. What's the data retention policy for game sessions?
3. Are there GDPR/privacy considerations for player data?
4. Should there be rate limiting on the public APIs?
5. What monitoring/alerting should be set up for production?

## Performance & Scaling

Current setup is designed for moderate usage. For larger scale:
- Consider DynamoDB on-demand vs provisioned capacity
- Monitor Lambda cold starts and optimize if needed
- Consider WebSocket API Gateway for game server instead of Socket.io
- Implement caching strategy for leaderboard queries

## Security Review Needed

- Review all public API endpoints for data exposure
- Implement request validation and sanitization
- Add rate limiting to prevent abuse
- Review IAM permissions (currently using AdministratorAccess for dev)
- Audit logging for game data access
