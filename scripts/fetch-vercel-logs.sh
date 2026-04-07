#!/usr/bin/env bash
# Vercel Deploy Log Fetcher
# Usage: ./fetch-vercel-logs.sh <VERCEL_TOKEN> <PROJECT_ID> <TEAM_ID>

set -e

VERCEL_TOKEN="$1"
PROJECT_ID="$2"
TEAM_ID="$3"

if [ -z "$VERCEL_TOKEN" ] || [ -z "$PROJECT_ID" ] || [ -z "$TEAM_ID" ]; then
  echo "❌ Usage: $0 <VERCEL_TOKEN> <PROJECT_ID> <TEAM_ID>"
  exit 1
fi

API_URL="https://api.vercel.com"
OUTPUT_DIR="deploy-logs"

mkdir -p "$OUTPUT_DIR"

echo "🔍 Fetching latest Vercel deployment..."

# Get latest deployment
DEPLOYMENTS=$(curl -s \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "$API_URL/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=1")

DEPLOYMENT_ID=$(echo "$DEPLOYMENTS" | jq -r '.deployments[0].uid')
DEPLOYMENT_URL=$(echo "$DEPLOYMENTS" | jq -r '.deployments[0].url')
DEPLOYMENT_STATE=$(echo "$DEPLOYMENTS" | jq -r '.deployments[0].state')
DEPLOYMENT_CREATED=$(echo "$DEPLOYMENTS" | jq -r '.deployments[0].createdAt')

if [ "$DEPLOYMENT_ID" = "null" ] || [ -z "$DEPLOYMENT_ID" ]; then
  echo "❌ No deployments found"
  exit 1
fi

echo "📦 Deployment ID: $DEPLOYMENT_ID"
echo "🌐 URL: $DEPLOYMENT_URL"
echo "📊 State: $DEPLOYMENT_STATE"
echo "🕐 Created: $DEPLOYMENT_CREATED"

# Fetch deployment details
DEPLOY_DETAILS=$(curl -s \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "$API_URL/v6/deployments/$DEPLOYMENT_ID?teamId=$TEAM_ID")

BUILD_STATUS=$(echo "$DEPLOY_DETAILS" | jq -r '.builds[0].error?.message // "No error"')
BUILD_TIME=$(echo "$DEPLOY_DETAILS" | jq -r '.builds[0].startedAt // "N/A"')

# Fetch deployment events/logs
EVENTS=$(curl -s \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "$API_URL/v1/deployments/$DEPLOYMENT_ID/events?teamId=$TEAM_ID")

# Create comprehensive log file
LOG_FILE="$OUTPUT_DIR/vercel-deploy-$(date +%Y%m%d-%H%M%S).md"

cat > "$LOG_FILE" << EOF
# Vercel Deploy Log

## Summary
- **Deployment ID**: \`$DEPLOYMENT_ID\`
- **URL**: https://$DEPLOYMENT_URL
- **State**: $DEPLOYMENT_STATE
- **Created**: $DEPLOYMENT_CREATED
- **Build Started**: $BUILD_TIME

## Build Status
\`\`\`
$BUILD_STATUS
\`\`\`

## Build Logs
\`\`\`json
$(echo "$EVENTS" | jq '.' 2>/dev/null || echo "Unable to fetch events")
\`\`\`

## Raw Deployment Details
\`\`\`json
$(echo "$DEPLOY_DETAILS" | jq '.' 2>/dev/null || echo "Unable to fetch details")
\`\`\`

## Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Live Site](https://$DEPLOYMENT_URL)
EOF

echo ""
echo "✅ Log saved to: $LOG_FILE"
echo ""

# Output status for GitHub Actions
echo "::set-output name=deployment_id::$DEPLOYMENT_ID"
echo "::set-output name=deployment_url::$DEPLOYMENT_URL"
echo "::set-output name=deployment_state::$DEPLOYMENT_STATE"
echo "::set-output name=log_file::$LOG_FILE"

# Exit with error if deployment failed
if [ "$DEPLOYMENT_STATE" = "ERROR" ]; then
  echo "❌ Deployment failed!"
  cat "$LOG_FILE"
  exit 1
elif [ "$DEPLOYMENT_STATE" = "BUILDING" ] || [ "$DEPLOYMENT_STATE" = "INITIALIZING" ]; then
  echo "⏳ Deployment still in progress..."
  exit 0
else
  echo "✅ Deployment completed successfully!"
  exit 0
fi
