# Deploy Backend to Heroku - Quick Guide

## Two Deployment Methods

### Method 1: Using Git Subtree (Recommended - No Code Changes)

This method deploys only the `backend/` folder to Heroku without changing your repository structure.

#### Prerequisites
- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

#### Steps

1. **Install Heroku CLI** (if not already installed):
   ```bash
   # On macOS:
   brew tap heroku/brew && brew install heroku

   # On Windows:
   # Download installer from: https://devcenter.heroku.com/articles/heroku-cli

   # On Linux:
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   heroku create manufacturing-schedule-api
   # Or use your preferred name:
   # heroku create your-custom-name
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set AIRTABLE_API_KEY=your_airtable_api_key_here
   heroku config:set AIRTABLE_BASE_ID=your_airtable_base_id_here
   heroku config:set NODE_ENV=production
   ```

5. **Add Heroku Remote** (if not already added):
   ```bash
   heroku git:remote -a manufacturing-schedule-api
   ```

6. **Deploy Backend Subdirectory**:
   ```bash
   git subtree push --prefix backend heroku claude/deploy-app-setup-md53Z:main
   ```

   If this fails, try:
   ```bash
   git push heroku `git subtree split --prefix backend claude/deploy-app-setup-md53Z`:main --force
   ```

7. **Verify Deployment**:
   ```bash
   heroku open
   # Or visit: https://manufacturing-schedule-api.herokuapp.com/
   ```

8. **Check Logs** (if there are issues):
   ```bash
   heroku logs --tail
   ```

---

### Method 2: Using Heroku Dashboard (No CLI Required)

If you can't install the Heroku CLI, you can deploy through the web interface.

#### Steps

1. **Create Heroku App**:
   - Go to: https://dashboard.heroku.com/
   - Click "New" → "Create new app"
   - Name: `manufacturing-schedule-api`
   - Click "Create app"

2. **Set Environment Variables**:
   - Go to "Settings" tab
   - Click "Reveal Config Vars"
   - Add these variables:
     - `AIRTABLE_API_KEY`: (your Airtable API key)
     - `AIRTABLE_BASE_ID`: (your Airtable Base ID)
     - `NODE_ENV`: `production`

3. **Deploy Using GitHub Integration**:
   - Go to "Deploy" tab
   - Under "Deployment method", click "GitHub"
   - Connect to GitHub and select `Manufacturing-Schedule` repo
   - Select branch: `claude/deploy-app-setup-md53Z`

   ⚠️ **Problem**: Heroku can't deploy subdirectories via GitHub integration directly.

   **Solution**: We need to create a deployment branch with backend at root.

4. **Create Deployment Branch** (one-time setup):

   Run these commands locally:
   ```bash
   # Create a new branch with just the backend at root
   git checkout -b heroku-backend

   # Remove everything
   git rm -rf .

   # Copy backend files to root
   git checkout claude/deploy-app-setup-md53Z -- backend/

   # Move backend contents to root
   mv backend/* .
   mv backend/.env.example .
   rmdir backend

   # Commit
   git add .
   git commit -m "Prepare backend for Heroku deployment"

   # Push to GitHub
   git push origin heroku-backend

   # Switch back to main branch
   git checkout claude/deploy-app-setup-md53Z
   ```

5. **Deploy from Heroku Dashboard**:
   - In Heroku Dashboard → Deploy tab
   - Select branch: `heroku-backend`
   - Click "Deploy Branch"
   - Wait for build to complete

---

## Alternative: Deploy Using Docker (Advanced)

If you're familiar with Docker, you can also deploy using Heroku Container Registry.

---

## Quick Test After Deployment

Once deployed, test these endpoints:

1. **Root**: `https://your-app.herokuapp.com/`
   - Should return API information

2. **Health Check**: `https://your-app.herokuapp.com/health`
   - Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

3. **Jobs API**: `https://your-app.herokuapp.com/api/jobs`
   - Should return: `{"jobs":[],"count":0}` (empty array initially)

4. **Priorities API**: `https://your-app.herokuapp.com/api/priorities`
   - Should return machine priorities

---

## Troubleshooting

### Error: "heroku: command not found"
- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

### Error: "No app specified" or "No such app"
- Make sure you added the Heroku remote: `heroku git:remote -a your-app-name`

### Error: "Application Error" when visiting Heroku URL
- Check logs: `heroku logs --tail`
- Common causes:
  - Missing environment variables
  - Port binding issue (Heroku provides PORT automatically)
  - Dependencies not installed

### Build Failed
- Check that `backend/package.json` has all dependencies
- Verify `backend/Procfile` exists and contains: `web: node server.js`
- Check Node.js version in `package.json` engines

---

## After Successful Deployment

1. **Copy your Heroku app URL**: `https://your-app-name.herokuapp.com`

2. **Update frontend**:
   - Edit `frontend/js/main.js`
   - Change line 3 to: `const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';`

3. **Update CORS**:
   ```bash
   heroku config:set ALLOWED_ORIGINS=https://your-frontend-url.netlify.app
   ```

4. **Redeploy frontend** to Netlify/Vercel/GitHub Pages

---

## Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# View config variables
heroku config

# Set config variable
heroku config:set KEY=value

# Open app in browser
heroku open

# Run bash on Heroku
heroku run bash

# Scale dynos
heroku ps:scale web=1
```

---

## Cost & Limits

- **Free Tier**: Good for development and light usage
  - 550-1000 free dyno hours per month
  - Apps sleep after 30 minutes of inactivity

- **Hobby Tier** ($7/month):
  - Always-on
  - No sleep
  - Custom domains with SSL

- **Production Tier** ($25+/month):
  - For high-traffic apps
  - Better performance

---

**You're ready to deploy! 🚀**

Choose Method 1 if you have Heroku CLI, or Method 2 if you prefer the web interface.
