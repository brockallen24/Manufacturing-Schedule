# Manufacturing Schedule Backend API

This branch contains the backend API ready for Heroku deployment.

## Quick Deploy to Heroku

### Via Heroku Dashboard (Easiest):

1. Go to: https://dashboard.heroku.com/
2. Create new app: `manufacturing-schedule-api`
3. Go to Settings → Config Vars → Add:
   - `AIRTABLE_API_KEY`: your_key
   - `AIRTABLE_BASE_ID`: your_base_id
   - `NODE_ENV`: production
4. Go to Deploy → Connect to GitHub
5. Select this repo and the `heroku-backend` branch
6. Click "Deploy Branch"

### Via Heroku CLI:

```bash
# Login
heroku login

# Create app
heroku create manufacturing-schedule-api

# Set environment variables
heroku config:set AIRTABLE_API_KEY=your_key
heroku config:set AIRTABLE_BASE_ID=your_base_id
heroku config:set NODE_ENV=production

# Deploy
git push heroku heroku-backend:main
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/priorities` - Get machine priorities
- `PUT /api/priorities/:machine` - Update priority

## Requirements

- Node.js 18.x
- Airtable account with:
  - Base containing `Jobs` and `MachinePriorities` tables
  - API key and Base ID

## Environment Variables

Create a `.env` file (or set in Heroku Config Vars):

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-url.com
```

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run dev server
npm run dev

# Or run production server
npm start
```

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Get jobs
curl http://localhost:3000/api/jobs

# Get priorities
curl http://localhost:3000/api/priorities
```

## For Frontend Code

The frontend code is on the `claude/deploy-app-setup-md53Z` branch in the `frontend/` directory.

## Documentation

- See `SETUP.md` for full deployment guide
- See `DEPLOY_TO_HEROKU.md` for Heroku-specific instructions
