#!/bin/bash
# Airtable Setup Script for Manufacturing Schedule
# Run this script locally to create the required tables
#
# Usage:
#   AIRTABLE_API_KEY=your_token AIRTABLE_BASE_ID=your_base_id ./setup-airtable.sh
#   or run without args to be prompted

AIRTABLE_TOKEN="${AIRTABLE_API_KEY:-}"
BASE_ID="${AIRTABLE_BASE_ID:-}"

# Prompt for credentials if not set
if [ -z "$AIRTABLE_TOKEN" ]; then
    echo "Enter your Airtable Personal Access Token:"
    read -r AIRTABLE_TOKEN
fi

if [ -z "$BASE_ID" ]; then
    echo "Enter your Airtable Base ID (starts with 'app'):"
    read -r BASE_ID
fi

if [ -z "$AIRTABLE_TOKEN" ] || [ -z "$BASE_ID" ]; then
    echo "Error: Airtable credentials are required."
    exit 1
fi

echo "Setting up Airtable tables for Manufacturing Schedule..."
echo ""

# Create Jobs table with all required fields
echo "Creating/updating Jobs table..."
curl -X POST "https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
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
  }'

echo ""
echo ""

# Create MachinePriorities table
echo "Creating MachinePriorities table..."
curl -X POST "https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "MachinePriorities",
    "description": "Priority levels for each machine",
    "fields": [
      {"name": "machine", "type": "singleLineText"},
      {"name": "priority", "type": "singleSelect", "options": {"choices": [{"name": "low"}, {"name": "medium"}, {"name": "high"}, {"name": "critical"}]}}
    ]
  }'

echo ""
echo ""
echo "Airtable setup complete!"
echo ""
echo "Your Base ID: ${BASE_ID}"
