#!/bin/bash
#===============================================================================
# Manufacturing Schedule - Complete Deployment Script
#===============================================================================
# This script will:
# 1. Set up Airtable tables
# 2. Deploy the application to Heroku
# 3. Configure all environment variables
#
# Prerequisites:
# - Node.js installed (v18+)
# - Heroku CLI installed (https://devcenter.heroku.com/articles/heroku-cli)
# - Git installed
#===============================================================================

set -e

# Colors for output (defined early for use in prompts)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Uses environment variables or prompts user
APP_NAME="${HEROKU_APP_NAME:-manufacturing-schedule-app}"
AIRTABLE_API_KEY="${AIRTABLE_API_KEY:-}"
AIRTABLE_BASE_ID="${AIRTABLE_BASE_ID:-}"

echo ""
echo -e "${BLUE}===============================================================================${NC}"
echo -e "${BLUE}       Manufacturing Schedule - Complete Deployment${NC}"
echo -e "${BLUE}===============================================================================${NC}"
echo ""

#-------------------------------------------------------------------------------
# Step 0: Get Airtable credentials
#-------------------------------------------------------------------------------
if [ -z "$AIRTABLE_API_KEY" ]; then
    echo -e "${YELLOW}Airtable Personal Access Token not found in environment.${NC}"
    echo -e "You can get this from: https://airtable.com/create/tokens"
    echo -n "Enter your Airtable Personal Access Token: "
    read -r AIRTABLE_API_KEY
    echo ""
fi

if [ -z "$AIRTABLE_BASE_ID" ]; then
    echo -e "${YELLOW}Airtable Base ID not found in environment.${NC}"
    echo -e "This is in your Airtable URL: https://airtable.com/appXXXXXXXXX/..."
    echo -n "Enter your Airtable Base ID (starts with 'app'): "
    read -r AIRTABLE_BASE_ID
    echo ""
fi

if [ -z "$AIRTABLE_API_KEY" ] || [ -z "$AIRTABLE_BASE_ID" ]; then
    echo -e "${RED}Error: Airtable credentials are required.${NC}"
    echo "Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables,"
    echo "or run the script again and enter them when prompted."
    exit 1
fi

echo -e "${GREEN}✓${NC} Airtable credentials configured"
echo ""

#-------------------------------------------------------------------------------
# Step 1: Check prerequisites
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} npm: $(npm --version)"

# Check Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}Error: Heroku CLI is not installed.${NC}"
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Heroku CLI: $(heroku --version | head -n 1)"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Git: $(git --version)"

echo ""

#-------------------------------------------------------------------------------
# Step 2: Set up Airtable
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 2: Setting up Airtable tables...${NC}"
echo ""

# Create Jobs table
echo "Creating Jobs table..."
JOBS_RESPONSE=$(curl -s -X POST "https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables" \
  -H "Authorization: Bearer ${AIRTABLE_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "Jobs",
    "description": "Manufacturing jobs and setup tasks",
    "fields": [
      {"name": "machine", "type": "singleLineText"},
      {"name": "type", "type": "singleSelect", "options": {"choices": [{"name": "job"}, {"name": "setup"}]}},
      {"name": "jobName", "type": "singleLineText"},
      {"name": "workOrder", "type": "singleLineText"},
      {"name": "numParts", "type": "number", "options": {"precision": 0}},
      {"name": "numCavities", "type": "number", "options": {"precision": 0}},
      {"name": "cycleTime", "type": "number", "options": {"precision": 2}},
      {"name": "material", "type": "singleLineText"},
      {"name": "totalMaterial", "type": "number", "options": {"precision": 2}},
      {"name": "totalHours", "type": "number", "options": {"precision": 2}},
      {"name": "dueDate", "type": "date"},
      {"name": "percentComplete", "type": "number", "options": {"precision": 0}},
      {"name": "toolNumber", "type": "singleLineText"},
      {"name": "toolReady", "type": "singleSelect", "options": {"choices": [{"name": "yes"}, {"name": "no"}]}},
      {"name": "setupNotes", "type": "multilineText"}
    ]
  }' 2>/dev/null)

if echo "$JOBS_RESPONSE" | grep -q '"id"'; then
    echo -e "  ${GREEN}✓${NC} Jobs table created"
else
    echo -e "  ${YELLOW}⚠${NC} Jobs table may already exist (this is OK)"
fi

# Create MachinePriorities table
echo "Creating MachinePriorities table..."
PRIORITIES_RESPONSE=$(curl -s -X POST "https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables" \
  -H "Authorization: Bearer ${AIRTABLE_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "MachinePriorities",
    "description": "Priority levels for each machine",
    "fields": [
      {"name": "machine", "type": "singleLineText"},
      {"name": "priority", "type": "singleSelect", "options": {"choices": [{"name": "low"}, {"name": "medium"}, {"name": "high"}, {"name": "critical"}]}}
    ]
  }' 2>/dev/null)

if echo "$PRIORITIES_RESPONSE" | grep -q '"id"'; then
    echo -e "  ${GREEN}✓${NC} MachinePriorities table created"
else
    echo -e "  ${YELLOW}⚠${NC} MachinePriorities table may already exist (this is OK)"
fi

echo ""

#-------------------------------------------------------------------------------
# Step 3: Log in to Heroku
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 3: Checking Heroku authentication...${NC}"

if ! heroku auth:whoami &> /dev/null; then
    echo "Please log in to Heroku..."
    heroku login
fi
echo -e "  ${GREEN}✓${NC} Logged in as: $(heroku auth:whoami)"
echo ""

#-------------------------------------------------------------------------------
# Step 4: Create Heroku app
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 4: Creating Heroku application...${NC}"

# Try to create the app
if heroku create ${APP_NAME} 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Created app: ${APP_NAME}"
else
    echo -e "  ${YELLOW}⚠${NC} App '${APP_NAME}' may already exist or name is taken"
    echo "    Trying with random suffix..."
    APP_NAME="${APP_NAME}-$(date +%s | tail -c 5)"
    if heroku create ${APP_NAME} 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Created app: ${APP_NAME}"
    else
        echo -e "${RED}Error: Could not create Heroku app${NC}"
        exit 1
    fi
fi
echo ""

#-------------------------------------------------------------------------------
# Step 5: Set environment variables
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 5: Configuring environment variables...${NC}"

heroku config:set \
  AIRTABLE_API_KEY="${AIRTABLE_API_KEY}" \
  AIRTABLE_BASE_ID="${AIRTABLE_BASE_ID}" \
  NODE_ENV="production" \
  --app ${APP_NAME} > /dev/null

echo -e "  ${GREEN}✓${NC} Environment variables configured"
echo ""

#-------------------------------------------------------------------------------
# Step 6: Deploy to Heroku
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 6: Deploying to Heroku...${NC}"

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init > /dev/null
fi

# Add Heroku remote
heroku git:remote -a ${APP_NAME} 2>/dev/null || true

# Stage all files
git add -A

# Commit
git commit -m "Deploy Manufacturing Schedule" 2>/dev/null || true

# Push to Heroku
echo "Pushing to Heroku (this may take a few minutes)..."
if git push heroku main --force 2>&1 | tail -20; then
    echo ""
elif git push heroku master --force 2>&1 | tail -20; then
    echo ""
else
    # Try pushing HEAD to main
    git push heroku HEAD:main --force 2>&1 | tail -20
fi

echo ""

#-------------------------------------------------------------------------------
# Step 7: Verify deployment
#-------------------------------------------------------------------------------
echo -e "${YELLOW}Step 7: Verifying deployment...${NC}"

sleep 5 # Wait for app to start

HEALTH_CHECK=$(curl -s "https://${APP_NAME}.herokuapp.com/health" 2>/dev/null || echo "failed")

if echo "$HEALTH_CHECK" | grep -q '"status":"ok"'; then
    echo -e "  ${GREEN}✓${NC} Application is running!"
else
    echo -e "  ${YELLOW}⚠${NC} Health check pending (app may still be starting)"
fi

echo ""
echo -e "${GREEN}===============================================================================${NC}"
echo -e "${GREEN}                    DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}===============================================================================${NC}"
echo ""
echo -e "Your application is now live at:"
echo -e "  ${BLUE}https://${APP_NAME}.herokuapp.com${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    heroku logs --tail --app ${APP_NAME}"
echo "  Open app:     heroku open --app ${APP_NAME}"
echo "  Restart:      heroku restart --app ${APP_NAME}"
echo ""
echo "Share this URL with your team - data will sync across all workstations!"
echo ""
