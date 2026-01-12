#!/bin/bash
# Heroku Deployment Script for Manufacturing Schedule Backend
# Run this script locally after installing Heroku CLI
#
# Usage:
#   AIRTABLE_API_KEY=your_token AIRTABLE_BASE_ID=your_base_id ./deploy-heroku.sh
#   or run without args to be prompted

# Configuration - Uses environment variables or prompts user
APP_NAME="${HEROKU_APP_NAME:-manufacturing-schedule-api}"
AIRTABLE_API_KEY="${AIRTABLE_API_KEY:-}"
AIRTABLE_BASE_ID="${AIRTABLE_BASE_ID:-}"

echo "================================================"
echo "Manufacturing Schedule - Heroku Deployment"
echo "================================================"
echo ""

# Prompt for credentials if not set
if [ -z "$AIRTABLE_API_KEY" ]; then
    echo "Enter your Airtable Personal Access Token:"
    read -r AIRTABLE_API_KEY
fi

if [ -z "$AIRTABLE_BASE_ID" ]; then
    echo "Enter your Airtable Base ID (starts with 'app'):"
    read -r AIRTABLE_BASE_ID
fi

if [ -z "$AIRTABLE_API_KEY" ] || [ -z "$AIRTABLE_BASE_ID" ]; then
    echo "Error: Airtable credentials are required."
    exit 1
fi

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Error: Heroku CLI is not installed."
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in
echo "Checking Heroku login status..."
heroku auth:whoami || {
    echo ""
    echo "Please log in to Heroku..."
    heroku login
}

echo ""
echo "Creating Heroku app: ${APP_NAME}..."
heroku create ${APP_NAME} 2>/dev/null || echo "App may already exist, continuing..."

echo ""
echo "Setting environment variables..."
heroku config:set \
  AIRTABLE_API_KEY="${AIRTABLE_API_KEY}" \
  AIRTABLE_BASE_ID="${AIRTABLE_BASE_ID}" \
  NODE_ENV="production" \
  ALLOWED_ORIGINS="https://${APP_NAME}.herokuapp.com,http://localhost:8000" \
  --app ${APP_NAME}

echo ""
echo "Deploying backend to Heroku..."
cd "$(dirname "$0")/../backend"

# Initialize git in backend if needed
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial backend commit"
fi

# Add Heroku remote
heroku git:remote -a ${APP_NAME} 2>/dev/null || true

# Push to Heroku
git add .
git commit -m "Deploy to Heroku" 2>/dev/null || true
git push heroku main --force 2>/dev/null || git push heroku master --force

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Your API is now live at:"
echo "  https://${APP_NAME}.herokuapp.com"
echo ""
echo "Test endpoints:"
echo "  Health: https://${APP_NAME}.herokuapp.com/health"
echo "  Jobs:   https://${APP_NAME}.herokuapp.com/api/jobs"
echo ""
echo "Next step: Update your frontend to use this API URL"
