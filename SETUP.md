# Manufacturing Schedule - Quick Deployment Setup

Your code is now organized and ready for deployment! Follow these steps to deploy your application using GitHub, Airtable, and Heroku.

## Current Status ✅

- ✅ Repository organized with `frontend/` and `backend/` folders
- ✅ Backend API configured with Express.js
- ✅ Frontend with drag-and-drop interface ready
- ✅ Code pushed to GitHub branch: `claude/deploy-app-setup-md53Z`

---

## Step 1: Set Up Airtable (10 minutes)

### 1.1 Create Airtable Base

1. **Go to Airtable**: https://airtable.com/
2. **Sign in** or create an account
3. **Create a new base** called `Manufacturing Schedule`
4. You'll need to create 2 tables (see below)

### 1.2 Create "Jobs" Table

Create a table called `Jobs` with these fields:

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| `id` | Single line text | Primary key |
| `type` | Single select | Options: "job", "setup" |
| `jobName` | Single line text | |
| `workOrder` | Single line text | |
| `numParts` | Number | Integer |
| `numCavities` | Number | Integer |
| `cycleTime` | Number | Decimal |
| `material` | Single line text | |
| `totalMaterial` | Number | Decimal |
| `totalHours` | Number | Decimal |
| `dueDate` | Date | |
| `percentComplete` | Number | Integer, 0-100 |
| `machine` | Single line text | |
| `toolNumber` | Single line text | For setup jobs |
| `toolReady` | Single select | Options: "yes", "no" |
| `setupHours` | Number | Decimal |
| `setupNotes` | Long text | |

### 1.3 Create "MachinePriorities" Table

Create a table called `MachinePriorities` with these fields:

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| `machine` | Single line text | Primary key |
| `priority` | Single select | Options: "low", "medium", "high", "critical" |

**Add these machine records** (one row for each):
- 22, 55, 90-1, 90-2, 90-3, Sumi1, 170-1, 170-2, Sumi2
- 260-1, 260-2, 260-3, 260-4, 500-1, 500-2, 550
- 770, 950, 1100-1, 1100-2, 1200-1, 1200-2

Set the initial priority to "medium" for all machines.

### 1.4 Get Your Airtable Credentials

1. **API Key**:
   - Go to https://airtable.com/account
   - Click "Generate API key" if you don't have one
   - **Copy your API key** (starts with "key...")
   - ⚠️ Keep this secret!

2. **Base ID**:
   - Go to https://airtable.com/api
   - Click on your "Manufacturing Schedule" base
   - Your Base ID is in the URL and documentation (starts with "app...")
   - **Copy your Base ID**

**Save these values - you'll need them for Heroku!**

---

## Step 2: Deploy Backend to Heroku (15 minutes)

### 2.1 Create Heroku App

1. **Go to Heroku**: https://dashboard.heroku.com/
2. **Sign in** or create an account (free tier is fine)
3. **Click "New" → "Create new app"**
4. **App name**: `manufacturing-schedule-api` (or any unique name)
5. **Region**: Choose your region (United States or Europe)
6. **Click "Create app"**

### 2.2 Connect to GitHub

1. In your new Heroku app, go to the **"Deploy"** tab
2. Under **"Deployment method"**, click **"GitHub"**
3. Click **"Connect to GitHub"** (authorize if needed)
4. Search for: `Manufacturing-Schedule`
5. Click **"Connect"** next to your repository

### 2.3 Configure Build Settings

1. Still in the **"Deploy"** tab
2. Under **"App connected to GitHub"**, you'll see your repo
3. **Manual deploy section**:
   - Branch to deploy: Select `claude/deploy-app-setup-md53Z`
   - Click **"Deploy Branch"**
   - ⚠️ **WAIT!** Before deploying, we need to set up environment variables first

### 2.4 Set Environment Variables

1. Go to the **"Settings"** tab
2. Click **"Reveal Config Vars"**
3. Add these environment variables:

| KEY | VALUE |
|-----|-------|
| `AIRTABLE_API_KEY` | (Your API key from Step 1.4) |
| `AIRTABLE_BASE_ID` | (Your Base ID from Step 1.4) |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | (We'll update this after frontend deployment) |

Click **"Add"** for each variable.

### 2.5 Configure Buildpack

1. Still in **"Settings"** tab
2. Scroll down to **"Buildpacks"**
3. Click **"Add buildpack"**
4. Select **"nodejs"**
5. Click **"Save changes"**

### 2.6 Set App Root Directory

Since your backend is in a subdirectory, we need to tell Heroku:

1. Still in **"Settings"** → **"Config Vars"**
2. Add one more config var:

| KEY | VALUE |
|-----|-------|
| `PROJECT_PATH` | `backend` |

Actually, Heroku doesn't directly support subdirectory deployment. We have **two options**:

#### Option A: Deploy backend subdirectory (Recommended)

Use the Heroku CLI (you can install it on your local machine):

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
# Login to Heroku
heroku login

# Add Heroku remote (replace with your app name)
heroku git:remote -a manufacturing-schedule-api

# Deploy only the backend folder
git subtree push --prefix backend heroku claude/deploy-app-setup-md53Z:main
```

#### Option B: Move backend to root (Simpler, but requires code changes)

I can help you restructure the repo if you prefer this method.

For now, let's use **Option A**.

### 2.7 Deploy the Backend

After setting up environment variables, go back to **"Deploy"** tab:

1. Scroll to **"Manual deploy"**
2. Select branch: `claude/deploy-app-setup-md53Z`
3. Click **"Deploy Branch"**
4. Wait for the build to complete (2-3 minutes)
5. You should see "Your app was successfully deployed"

### 2.8 Verify Deployment

1. Click **"View"** or **"Open app"**
2. Your backend URL should be: `https://manufacturing-schedule-api.herokuapp.com/`
3. You should see a JSON response like:
```json
{
  "message": "Manufacturing Schedule API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "jobs": "/api/jobs",
    "priorities": "/api/priorities"
  }
}
```

4. Test the health endpoint: `https://manufacturing-schedule-api.herokuapp.com/health`

**🎉 Backend is deployed! Copy your Heroku app URL - you'll need it for the frontend.**

---

## Step 3: Deploy Frontend (10 minutes)

You have several options for hosting the frontend:

### Option A: GitHub Pages (Easiest)

1. **Go to your GitHub repository**: https://github.com/brockallen24/Manufacturing-Schedule
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** (left sidebar)
4. Under **"Source"**:
   - Branch: `claude/deploy-app-setup-md53Z`
   - Folder: Select `/ (root)` first, then we'll adjust
5. Click **"Save"**

⚠️ **Note**: GitHub Pages doesn't support subdirectories directly. You'll need to either:
- Move frontend files to root, OR
- Use a different hosting option

### Option B: Netlify (Recommended - Easiest for subdirectories)

1. **Go to Netlify**: https://app.netlify.com/
2. **Sign up** with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"GitHub"** and authorize
5. Select your repository: `Manufacturing-Schedule`
6. **Configure settings**:
   - Branch: `claude/deploy-app-setup-md53Z`
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `.` (or leave as default)
7. Click **"Deploy site"**
8. Wait for deployment (1-2 minutes)
9. Your site will be live at: `https://random-name.netlify.app`
10. You can customize the domain in Site settings

### Option C: Vercel

1. **Go to Vercel**: https://vercel.com/
2. **Sign up** with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - Root Directory: `frontend`
   - Framework: Other
6. Deploy

### Option D: Heroku Static Site

You can also host the frontend on Heroku as a static site using a simple Node.js server.

---

## Step 4: Update Frontend API URL (5 minutes)

Once your backend is deployed, update the frontend to use the real API:

1. **Get your Heroku backend URL**: `https://manufacturing-schedule-api.herokuapp.com`

2. **Update the frontend JavaScript**:
   - Open `frontend/js/main.js`
   - Find line 3: `const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';`
   - Replace with: `const API_BASE_URL = 'https://manufacturing-schedule-api.herokuapp.com/api';`

3. **Update Heroku CORS settings**:
   - Get your frontend URL (from Netlify, Vercel, or GitHub Pages)
   - Example: `https://your-site.netlify.app`
   - Go to Heroku → Settings → Config Vars
   - Update `ALLOWED_ORIGINS` to your frontend URL:
     ```
     ALLOWED_ORIGINS=https://your-site.netlify.app
     ```

4. **Commit and push the change**:
```bash
git add frontend/js/main.js
git commit -m "Update API URL to use Heroku backend"
git push origin claude/deploy-app-setup-md53Z
```

5. **Redeploy your frontend** (Netlify/Vercel will auto-deploy, or manually trigger)

---

## Step 5: Test Everything! (5 minutes)

1. **Open your frontend URL**
2. **Test these features**:
   - ✅ Click "Add New Job" - should open modal
   - ✅ Fill in job details and save
   - ✅ Check Airtable - new job should appear in the Jobs table
   - ✅ Refresh the page - job should persist
   - ✅ Drag and drop a job to a different machine
   - ✅ Edit a job (double-click)
   - ✅ Delete a job
   - ✅ Add a Setup/Maintenance item
   - ✅ Change machine priority
   - ✅ Print view (should hide buttons)

3. **Check browser console** (F12) for any errors

4. **Check Heroku logs** if something isn't working:
   - Go to Heroku Dashboard → Your App → More → View logs
   - Or use CLI: `heroku logs --tail`

---

## Troubleshooting

### Frontend can't connect to backend

1. **Check CORS settings**:
   - Make sure `ALLOWED_ORIGINS` in Heroku includes your frontend URL
   - Should be exactly like: `https://your-site.netlify.app` (no trailing slash)

2. **Check browser console**:
   - Look for CORS errors or network errors
   - Verify the API URL is correct

3. **Test backend directly**:
   - Visit: `https://your-app.herokuapp.com/health`
   - Should return JSON with status "ok"

### Airtable errors

1. **Verify credentials**:
   - Check Config Vars in Heroku
   - Make sure API key and Base ID are correct
   - API key starts with "key..."
   - Base ID starts with "app..."

2. **Check table names**:
   - Must be exactly: `Jobs` and `MachinePriorities`
   - Case-sensitive!

3. **Check field names**:
   - Must match exactly as specified in Step 1.2 and 1.3

### Heroku app crashes

1. **Check logs**:
   - Heroku Dashboard → More → View logs
   - Look for error messages

2. **Common issues**:
   - Missing environment variables
   - Wrong Node.js version (should be 18.x)
   - Missing dependencies in package.json

3. **Restart app**:
   - Heroku Dashboard → More → Restart all dynos

---

## Summary of URLs

After deployment, you should have:

| Service | URL | Purpose |
|---------|-----|---------|
| **GitHub Repo** | https://github.com/brockallen24/Manufacturing-Schedule | Code repository |
| **Heroku Backend** | https://manufacturing-schedule-api.herokuapp.com | API server |
| **Frontend** | https://your-site.netlify.app | User interface |
| **Airtable Base** | https://airtable.com/... | Database |

---

## Next Steps

- ✅ Set up custom domain for frontend (optional)
- ✅ Configure automatic deployments on Heroku
- ✅ Add more users to Airtable base
- ✅ Set up monitoring and alerts
- ✅ Add authentication (future enhancement)
- ✅ Create mobile-responsive improvements

---

## Need Help?

If you run into issues:

1. Check this guide carefully
2. Review the DEPLOYMENT_GUIDE.md for detailed API documentation
3. Check Heroku logs for errors
4. Verify all URLs and credentials are correct

---

**Your app is ready to deploy! 🚀**

Follow each step carefully, and you'll have a fully functional manufacturing schedule app running on the cloud!
