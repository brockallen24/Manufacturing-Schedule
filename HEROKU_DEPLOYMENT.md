# Heroku Deployment Guide

This guide will walk you through deploying the Manufacturing Schedule application to Heroku.

## Prerequisites

- A Heroku account (free tier works fine)
- Heroku CLI installed ([Download here](https://devcenter.heroku.com/articles/heroku-cli))
- Git installed and configured
- Your Airtable credentials (API Key and Base ID)

## Project Structure

```
Manufacturing-Schedule/
├── backend/              # Express.js API server
│   ├── config/          # Airtable configuration
│   ├── routes/          # API routes (jobs, priorities)
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   ├── Procfile         # Heroku process file (backup)
│   └── .env             # Environment variables (NOT in git)
├── frontend/            # Static frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript application
│   └── index.html      # Main HTML file
├── package.json         # Root package.json for Heroku
└── Procfile            # Heroku process configuration
```

## Deployment Steps

### 1. Install Heroku CLI

If you haven't already, install the Heroku CLI:

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download installer from https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login to Heroku

```bash
heroku login
```

This will open a browser window for authentication.

### 3. Create a New Heroku App

```bash
# Create app with a custom name (or let Heroku generate one)
heroku create your-manufacturing-schedule

# Or just:
heroku create
```

Note: The app name must be unique across all Heroku apps. If your preferred name is taken, try adding a suffix like `-prod` or `-app`.

### 4. Set Environment Variables

Set your Airtable credentials as Heroku config vars:

```bash
heroku config:set AIRTABLE_API_KEY=your_airtable_api_key_here
heroku config:set AIRTABLE_BASE_ID=your_airtable_base_id_here
heroku config:set NODE_ENV=production
```

**Note:** Replace `your_airtable_api_key_here` and `your_airtable_base_id_here` with your actual Airtable credentials from the `backend/.env` file.

Verify the config vars were set:

```bash
heroku config
```

### 5. Deploy to Heroku

```bash
# Make sure you're on the correct branch
git checkout claude/check-hosting-connections-Umr96

# Deploy to Heroku
git push heroku claude/check-hosting-connections-Umr96:main

# Or if you're on main/master branch:
git push heroku main
```

### 6. Open Your Application

```bash
heroku open
```

This will open your deployed application in a browser.

### 7. Monitor Logs

If you encounter any issues, check the logs:

```bash
heroku logs --tail
```

## Airtable Setup

### Required Tables

Your Airtable base should have two tables:

#### 1. Jobs Table
Fields:
- `jobName` (Single line text)
- `workOrder` (Single line text)
- `numParts` (Number)
- `cycleTime` (Number)
- `numCavities` (Number)
- `material` (Single line text)
- `totalMaterial` (Number)
- `totalHours` (Number)
- `dueDate` (Date)
- `percentComplete` (Number)
- `machine` (Single line text)
- `type` (Single line text) - values: "job" or "setup"
- `toolNumber` (Single line text) - for setup types
- `toolReady` (Single line text) - for setup types: "yes" or "no"
- `notes` (Long text) - for setup types

#### 2. MachinePriorities Table
Fields:
- `machine` (Single line text)
- `priority` (Number)

### Sample Data

**MachinePriorities Table:**
| Machine | Priority |
|---------|----------|
| 22      | 1        |
| 55      | 2        |
| 90-1    | 3        |
| 90-2    | 4        |
| 90-3    | 5        |
| Sumi1   | 6        |
| 170-1   | 7        |
| 170-2   | 8        |
| Sumi2   | 9        |
| 260-1   | 10       |
| ...     | ...      |

## Troubleshooting

### Build Fails

If the build fails, check:
1. All dependencies are listed in `backend/package.json`
2. Node version is compatible (18.x)
3. Run `heroku logs --tail` to see error details

### Application Crashes

```bash
heroku logs --tail
```

Common issues:
- Missing environment variables
- Airtable connection errors
- Port binding issues (make sure server uses `process.env.PORT`)

### Airtable Connection Issues

Verify your credentials:
```bash
heroku config:get AIRTABLE_API_KEY
heroku config:get AIRTABLE_BASE_ID
```

Test Airtable connection:
```bash
curl https://your-app.herokuapp.com/health
```

### Database/Table Not Found

Make sure:
1. Your Airtable base ID is correct
2. Table names match exactly: `Jobs` and `MachinePriorities`
3. Your API key has permission to access the base

## Updating the Application

After making changes to your code:

```bash
# Commit your changes
git add .
git commit -m "Your commit message"

# Push to Heroku
git push heroku your-branch:main

# Or if on main branch:
git push heroku main
```

## Scaling (Optional)

By default, Heroku runs one web dyno. To scale:

```bash
# Check current dynos
heroku ps

# Scale up
heroku ps:scale web=2

# Scale down
heroku ps:scale web=1
```

Note: Free tier only allows 1 dyno.

## Custom Domain (Optional)

To add a custom domain:

```bash
heroku domains:add www.yourdomain.com
```

Follow the instructions to configure your DNS settings.

## Environment Variables Management

To update environment variables:

```bash
# Set a variable
heroku config:set VARIABLE_NAME=value

# Remove a variable
heroku config:unset VARIABLE_NAME

# View all variables
heroku config
```

## Maintenance Mode

To enable maintenance mode:

```bash
heroku maintenance:on
heroku maintenance:off
```

## Backup Strategy

Since this app uses Airtable as the database:
1. Airtable automatically backs up your data
2. You can export Airtable data manually from the Airtable interface
3. Consider setting up periodic exports for critical data

## Performance Tips

1. **Enable Gzip Compression**: Already configured in Express with helmet
2. **Monitor Performance**: Use Heroku metrics
   ```bash
   heroku addons:create librato:development
   ```
3. **Use CDN for Assets**: Font Awesome and Google Fonts are loaded from CDN
4. **Rate Limiting**: Already configured (100 requests per 15 minutes per IP)

## Cost Estimate

- **Heroku Free Tier**: $0/month
  - 550-1000 dyno hours/month
  - App sleeps after 30 minutes of inactivity
  - Wakes up on request (slight delay)

- **Heroku Hobby Tier**: $7/month
  - Never sleeps
  - Custom domain support
  - Better for production use

- **Airtable Free Tier**: $0/month
  - 1,200 records per base
  - 2GB attachments per base
  - Unlimited bases

## Support

For issues:
1. Check Heroku logs: `heroku logs --tail`
2. Verify Airtable connection in Airtable UI
3. Test API endpoints: `curl https://your-app.herokuapp.com/health`
4. Check GitHub repository for updates

## Next Steps

After deployment:
1. Test all functionality (add jobs, drag-and-drop, etc.)
2. Add some sample data in Airtable
3. Set up monitoring/alerts if needed
4. Share the app URL with your team!

## Useful Commands Reference

```bash
# View app info
heroku info

# Open app dashboard
heroku dashboard

# Restart app
heroku restart

# Run backend commands
heroku run node --version

# Access bash
heroku run bash

# View recent logs
heroku logs -n 200
```

## Security Notes

✅ **Already Implemented:**
- Environment variables for sensitive data
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation in routes

⚠️ **Recommendations:**
- Never commit `.env` file (already in `.gitignore`)
- Rotate API keys periodically
- Monitor for unusual activity
- Use Heroku's built-in security features

---

**Deployment completed!** Your Manufacturing Schedule app should now be live on Heroku.
