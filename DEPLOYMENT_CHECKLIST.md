# Manufacturing Schedule - Deployment Checklist

## Step 1: Install Heroku CLI on Your Local Machine

### For macOS:
```bash
brew tap heroku/brew && brew install heroku
```

### For Windows:
1. Download the installer from: https://devcenter.heroku.com/articles/heroku-cli
2. Run the downloaded .exe file
3. Follow the installation wizard

### For Ubuntu/Debian Linux:
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

### For Other Linux:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Verify Installation:
```bash
heroku --version
```
You should see output like: `heroku/8.x.x linux-x64 node-vxx.xx.x`

---

## Step 2: Clone Your Repository Locally

If you haven't already cloned the repository to your local machine:

```bash
git clone https://github.com/brockallen24/Manufacturing-Schedule.git
cd Manufacturing-Schedule

# Switch to the deployment branch
git checkout claude/check-hosting-connections-Umr96
```

---

## Step 3: Login to Heroku

```bash
heroku login
```

This will open a browser window for you to authenticate with your Heroku account.

**Expected output:**
```
heroku: Press any key to open up the browser to login or q to exit:
Opening browser to https://cli-auth.heroku.com/...
Logging in... done
Logged in as your-email@example.com
```

---

## Step 4: Create Your Heroku App

Choose a unique app name (or let Heroku generate one):

```bash
# Option 1: Choose your own name
heroku create your-manufacturing-schedule

# Option 2: Let Heroku generate a name
heroku create
```

**Expected output:**
```
Creating app... done, ⬢ your-manufacturing-schedule
https://your-manufacturing-schedule.herokuapp.com/ | https://git.heroku.com/your-manufacturing-schedule.git
```

**Note:** Your app name must be unique across ALL Heroku apps. If the name is taken, try:
- `manufacturing-schedule-prod`
- `yourname-manufacturing-schedule`
- Let Heroku auto-generate one

---

## Step 5: Set Environment Variables

Set your Airtable credentials as Heroku config variables:

```bash
# Replace with your actual credentials from backend/.env file
heroku config:set AIRTABLE_API_KEY=your_airtable_api_key_from_env_file

heroku config:set AIRTABLE_BASE_ID=your_airtable_base_id_from_env_file

heroku config:set NODE_ENV=production
```

**Note:** Your actual credentials are stored in `backend/.env` file. Use those values.

**Expected output for each command:**
```
Setting AIRTABLE_API_KEY and restarting ⬢ your-app... done, v3
```

### Verify Configuration:
```bash
heroku config
```

**Expected output:**
```
=== your-manufacturing-schedule Config Vars
AIRTABLE_API_KEY: your_api_key...
AIRTABLE_BASE_ID: your_base_id
NODE_ENV:         production
```

---

## Step 6: Deploy to Heroku

Deploy the application from your current branch:

```bash
git push heroku claude/check-hosting-connections-Umr96:main
```

**What happens during deployment:**
1. Heroku receives your code
2. Detects it's a Node.js app
3. Runs `npm install` in the backend directory
4. Installs all dependencies
5. Starts the server using the Procfile

**Expected output:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
remote: -----> Building on the Heroku-20 stack
remote: -----> Using buildpack: heroku/nodejs
remote: -----> Node.js app detected
remote: -----> Installing node modules
remote:        added XX packages in Xs
remote: -----> Build succeeded!
remote: -----> Discovering process types
remote:        Procfile declares types -> web
remote: -----> Compressing...
remote: -----> Launching...
remote:        https://your-manufacturing-schedule.herokuapp.com/ deployed to Heroku
```

---

## Step 7: Open Your Application

```bash
heroku open
```

This will open your app in the default browser at:
`https://your-manufacturing-schedule.herokuapp.com`

---

## Step 8: Monitor Your Application

### View Real-time Logs:
```bash
heroku logs --tail
```

**What to look for:**
```
2024-01-19T15:30:00.000000+00:00 app[web.1]: 🚀 Server running on port 12345
2024-01-19T15:30:00.000000+00:00 app[web.1]: 📊 Environment: production
```

Press `Ctrl+C` to exit log viewing.

### View Recent Logs:
```bash
heroku logs -n 100
```

### Check App Status:
```bash
heroku ps
```

**Expected output:**
```
=== web (Free): cd backend && node server.js (1)
web.1: up 2024/01/19 15:30:00 +0000 (~ 5m ago)
```

---

## Step 9: Test Your Application

### Test Health Endpoint:
```bash
curl https://your-manufacturing-schedule.herokuapp.com/health
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-19T15:30:00.000Z",
  "environment": "production"
}
```

### Test Jobs API:
```bash
curl https://your-manufacturing-schedule.herokuapp.com/api/jobs
```

**Expected output:**
```json
[
  {
    "id": "rec123456",
    "jobName": "Example Job",
    ...
  }
]
```

### Test in Browser:
1. Open: `https://your-manufacturing-schedule.herokuapp.com`
2. You should see the Manufacturing Schedule interface
3. Try adding a job
4. Test drag-and-drop functionality

---

## Troubleshooting Common Issues

### Issue: App Crashes Immediately

**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
1. **Missing environment variables**
   ```bash
   heroku config
   # Verify AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set
   ```

2. **Incorrect Airtable credentials**
   - Double-check your API key and Base ID
   - Update if needed:
   ```bash
   heroku config:set AIRTABLE_API_KEY=your_correct_key
   ```

3. **Port binding issue**
   - The app should use `process.env.PORT` (already configured)

### Issue: "Application Error" Page

**Restart the app:**
```bash
heroku restart
```

**Check dyno status:**
```bash
heroku ps
```

If dyno is crashed, check logs for error details.

### Issue: Cannot Connect to Airtable

**Test Airtable connection:**
```bash
heroku run bash
# Inside the dyno:
node -e "console.log(process.env.AIRTABLE_API_KEY)"
```

**Verify:**
1. API key is valid (check Airtable account settings)
2. Base ID is correct (check Airtable base URL)
3. Tables exist: `Jobs` and `MachinePriorities`

### Issue: "Push Rejected" During Deploy

**Error:** `Updates were rejected because the remote contains work that you do not have locally`

**Solution:**
```bash
git pull heroku main
# Resolve any conflicts
git push heroku claude/check-hosting-connections-Umr96:main
```

### Issue: Build Fails

**Check build logs:**
```bash
heroku logs --tail
```

**Common causes:**
1. Missing dependencies in `backend/package.json`
2. Node version incompatibility
3. Build script errors

**Fix:**
```bash
# Clear buildpack cache
heroku plugins:install heroku-repo
heroku repo:purge_cache -a your-app-name
git commit --allow-empty -m "Rebuild"
git push heroku claude/check-hosting-connections-Umr96:main
```

---

## Airtable Setup Requirements

### Required Tables in Your Airtable Base

#### Table 1: Jobs
Create a table named exactly `Jobs` with these fields:

| Field Name | Type | Notes |
|------------|------|-------|
| jobName | Single line text | Required |
| workOrder | Single line text | Required |
| numParts | Number | Integer |
| cycleTime | Number | Decimal allowed |
| numCavities | Number | Integer |
| material | Single line text | Required |
| totalMaterial | Number | Decimal (lbs) |
| totalHours | Number | Auto-calculated |
| dueDate | Date | MM/DD/YYYY |
| percentComplete | Number | 0-100 |
| machine | Single line text | Machine ID |
| type | Single line text | "job" or "setup" |
| toolNumber | Single line text | For setup types |
| toolReady | Single line text | "yes" or "no" |
| notes | Long text | For setup types |

#### Table 2: MachinePriorities
Create a table named exactly `MachinePriorities` with these fields:

| Field Name | Type | Notes |
|------------|------|-------|
| machine | Single line text | Machine ID |
| priority | Number | Integer (1-22) |

### Sample MachinePriorities Data:

Add these records to get started:

| machine | priority |
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
| 260-2   | 11       |
| 260-3   | 12       |
| 260-4   | 13       |
| 500-1   | 14       |
| 500-2   | 15       |
| 550     | 16       |
| 770     | 17       |
| 950     | 18       |
| 1100-1  | 19       |
| 1100-2  | 20       |
| 1200-1  | 21       |
| 1200-2  | 22       |

---

## Useful Heroku Commands Reference

```bash
# View app info
heroku info

# Open app dashboard in browser
heroku dashboard

# Restart app
heroku restart

# Scale dynos (free tier: max 1)
heroku ps:scale web=1

# View recent activity
heroku releases

# Rollback to previous version
heroku rollback

# Run one-off commands
heroku run node --version
heroku run bash

# Set config variable
heroku config:set KEY=value

# Remove config variable
heroku config:unset KEY

# Download config to local .env
heroku config:get AIRTABLE_API_KEY

# View all addons
heroku addons

# Maintenance mode
heroku maintenance:on
heroku maintenance:off
```

---

## Performance Optimization Tips

### 1. Monitor Performance
```bash
# Check response times
heroku logs --tail | grep "GET"
```

### 2. Enable Logging
Already configured with Morgan middleware for request logging.

### 3. Database Connection Pooling
Airtable has built-in rate limiting (5 requests/second per base).

### 4. Use Environment Variables Properly
All sensitive data is stored in config vars, not in code.

---

## Cost Breakdown

### Heroku Free Tier (Hobby)
- **Cost:** $0/month
- **Dyno hours:** 550-1000 hours/month
- **Limitations:**
  - App sleeps after 30 minutes of inactivity
  - 512MB RAM
  - Wakes up on first request (slight delay)

### Heroku Hobby Tier
- **Cost:** $7/month
- **Features:**
  - Never sleeps
  - Custom domain SSL
  - Better for production

### Airtable Free Tier
- **Cost:** $0/month
- **Limitations:**
  - 1,200 records per base
  - 2GB attachments
  - Unlimited bases

---

## Security Checklist

- [x] Environment variables used for secrets
- [x] `.env` file excluded from git
- [x] Helmet.js security headers enabled
- [x] CORS configured
- [x] Rate limiting enabled (100 req/15min)
- [x] HTTPS enforced by Heroku
- [ ] Rotate API keys regularly (recommended monthly)
- [ ] Monitor logs for suspicious activity
- [ ] Set up alerts for downtime

---

## Update Process

When you make changes to your code:

```bash
# 1. Make your changes locally
# 2. Test locally if possible

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin claude/check-hosting-connections-Umr96

# 5. Deploy to Heroku
git push heroku claude/check-hosting-connections-Umr96:main

# 6. Monitor deployment
heroku logs --tail
```

---

## Support Resources

- **Heroku Dev Center:** https://devcenter.heroku.com/
- **Heroku Status:** https://status.heroku.com/
- **Airtable API Docs:** https://airtable.com/developers/web/api/introduction
- **Repository Issues:** https://github.com/brockallen24/Manufacturing-Schedule/issues

---

## ✅ Deployment Complete!

Once you've completed all steps:
1. Your app is live at: `https://your-app-name.herokuapp.com`
2. GitHub repository: `https://github.com/brockallen24/Manufacturing-Schedule`
3. Airtable base: Connected and syncing
4. Ready for production use!

**Next Steps:**
- Add sample data in Airtable
- Test all features (drag-and-drop, add jobs, etc.)
- Share the URL with your team
- Set up monitoring/alerts if needed

---

**Congratulations! Your Manufacturing Schedule app is now live! 🎉**
