# 🚀 Deploy Manufacturing Schedule Backend to Heroku - Step by Step

## ✅ Prerequisites Checklist
- [ ] Heroku account created (https://heroku.com)
- [ ] Airtable account created (https://airtable.com)
- [ ] Airtable base set up with Jobs and MachinePriorities tables
- [ ] GitHub repository accessible

---

## 📋 Part 1: Get Your Airtable Credentials

### Step 1: Get Your Airtable API Key

1. Go to **https://airtable.com/account**
2. Scroll down to the **"API"** section
3. You'll see **"Personal access token"** or **"API key"**
4. Click **"Generate token"** or **"Generate API key"** if you don't have one
5. **Copy the key** - it looks like: `keyXXXXXXXXXXXXXX`
6. ⚠️ **Save this securely** - you'll need it for Heroku

### Step 2: Get Your Airtable Base ID

1. Go to **https://airtable.com/api**
2. Click on your **"Manufacturing Schedule"** base
3. In the documentation page, look at the URL or the introduction
4. Your Base ID is shown - it looks like: `appXXXXXXXXXXXXXX`
5. **Copy this Base ID** - you'll need it for Heroku

### Step 3: Verify Your Airtable Tables

Make sure you have these two tables in your Airtable base:

**Table 1: Jobs**
- Must have these fields: `id`, `type`, `jobName`, `workOrder`, `numParts`, `cycleTime`, `numCavities`, `material`, `totalMaterial`, `totalHours`, `dueDate`, `percentComplete`, `machine`, `toolNumber`, `toolReady`, `setupHours`, `setupNotes`

**Table 2: MachinePriorities**
- Must have these fields: `machine`, `priority`
- Should have 22 rows (one for each machine: 22, 55, 90-1, 90-2, etc.)

---

## 🔧 Part 2: Deploy Backend to Heroku

### Option A: Deploy via Heroku Dashboard (Recommended - No CLI needed)

#### Step 1: Create Heroku App

1. **Go to**: https://dashboard.heroku.com/apps
2. Click the **"New"** button (top right)
3. Select **"Create new app"**
4. **App name**: `manufacturing-schedule-7575b6f1cdb3` (or choose your own unique name)
   - ⚠️ **Important**: If you use a different name, you'll need to update the frontend code
5. **Region**: Choose "United States" or "Europe"
6. Click **"Create app"**

#### Step 2: Set Environment Variables (Config Vars)

1. In your new Heroku app, click the **"Settings"** tab
2. Scroll down to **"Config Vars"**
3. Click **"Reveal Config Vars"**
4. Add these **EXACT** variables:

| **KEY** | **VALUE** | **Notes** |
|---------|-----------|-----------|
| `AIRTABLE_API_KEY` | `keyXXXXXXXXXXXXXX` | Your key from Part 1, Step 1 |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | Your Base ID from Part 1, Step 2 |
| `NODE_ENV` | `production` | Exactly as shown |
| `ALLOWED_ORIGINS` | `*` | Allows all origins (you can restrict later) |

Click **"Add"** after entering each pair.

#### Step 3: Connect to GitHub

1. Click the **"Deploy"** tab
2. Under **"Deployment method"**, click **"GitHub"**
3. Click **"Connect to GitHub"** (authorize if prompted)
4. In the search box, type: **`Manufacturing-Schedule`**
5. Click **"Search"**
6. Find your repository and click **"Connect"**

#### Step 4: Deploy the Backend Branch

1. Still in the **"Deploy"** tab
2. Scroll to **"Manual deploy"** section
3. In the **"Choose a branch to deploy"** dropdown, select: **`claude/heroku-backend-md53Z`**
   - ⚠️ **Important**: This is the special branch with backend at root level
4. Click **"Deploy Branch"**
5. **Wait 2-3 minutes** while Heroku builds and deploys
6. You'll see build logs scrolling
7. When complete, you'll see: ✅ **"Your app was successfully deployed"**

#### Step 5: Verify Deployment

1. Click **"View"** or **"Open app"** button
2. You should see a JSON response like:
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

3. **Test the health endpoint**: Add `/health` to your URL
   - Example: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health`
   - Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

4. **Test the jobs endpoint**: Add `/api/jobs` to your URL
   - Example: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`
   - Should return: `{"jobs":[],"count":0}` (empty array if no jobs yet)

#### Step 6: Copy Your Heroku App URL

**Your Heroku URL is**: `https://YOUR-APP-NAME.herokuapp.com`

For example: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com`

⚠️ **SAVE THIS URL** - you need it for the frontend!

---

### Option B: Deploy via Heroku CLI (Advanced)

If you prefer using the command line:

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create manufacturing-schedule-7575b6f1cdb3

# 4. Set environment variables
heroku config:set AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX --app manufacturing-schedule-7575b6f1cdb3
heroku config:set AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX --app manufacturing-schedule-7575b6f1cdb3
heroku config:set NODE_ENV=production --app manufacturing-schedule-7575b6f1cdb3
heroku config:set ALLOWED_ORIGINS=* --app manufacturing-schedule-7575b6f1cdb3

# 5. Deploy from the backend branch
git push heroku claude/heroku-backend-md53Z:main

# 6. Open app
heroku open --app manufacturing-schedule-7575b6f1cdb3

# 7. View logs (if needed)
heroku logs --tail --app manufacturing-schedule-7575b6f1cdb3
```

---

## 🔗 Part 3: Update Frontend to Use Heroku Backend

Your frontend is **already configured** to use:
```javascript
const API_BASE_URL = 'https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api';
```

✅ **If you used the exact app name** `manufacturing-schedule-7575b6f1cdb3`, no changes needed!

❌ **If you used a DIFFERENT app name**, you need to update the frontend:

1. Open: `frontend/js/main.js`
2. Find line 11: `const API_BASE_URL = '...'`
3. Change it to: `const API_BASE_URL = 'https://YOUR-ACTUAL-APP-NAME.herokuapp.com/api';`
4. Commit and push:
```bash
git add frontend/js/main.js
git commit -m "Update API URL to match Heroku app name"
git push origin claude/deploy-app-setup-md53Z
```

---

## 🧪 Part 4: Test Everything End-to-End

### Test 1: Backend API Directly

Open these URLs in your browser:

1. **Root**: `https://YOUR-APP-NAME.herokuapp.com/`
   - ✅ Should show API info

2. **Health**: `https://YOUR-APP-NAME.herokuapp.com/health`
   - ✅ Should show `{"status":"ok",...}`

3. **Jobs**: `https://YOUR-APP-NAME.herokuapp.com/api/jobs`
   - ✅ Should show `{"jobs":[],"count":0}`

4. **Priorities**: `https://YOUR-APP-NAME.herokuapp.com/api/priorities`
   - ✅ Should show machine priorities

### Test 2: Frontend with Backend

1. Open your frontend application (e.g., from Netlify, local file, etc.)
2. **Add a test job**:
   - Click "Add New Job"
   - Fill in all fields
   - Click "Save Job"
   - ✅ Job should save without errors
3. **Check Airtable**:
   - Go to your Airtable base
   - Open the "Jobs" table
   - ✅ You should see the new job!
4. **Refresh the frontend**:
   - ✅ Job should still be there (loaded from Airtable)
5. **Try dragging the job** to a different machine:
   - ✅ Should update in Airtable
6. **Delete the job**:
   - ✅ Should remove from Airtable

---

## 🔧 Part 5: Enable Automatic Deploys (Optional but Recommended)

1. In Heroku **"Deploy"** tab
2. Scroll to **"Automatic deploys"** section
3. Select branch: **`claude/heroku-backend-md53Z`**
4. Click **"Enable Automatic Deploys"**
5. ✅ Now every time you push to this branch, Heroku will automatically redeploy!

---

## 📊 Monitoring & Logs

### View Logs in Dashboard
1. Go to your Heroku app
2. Click **"More"** (top right) → **"View logs"**
3. See real-time logs of API requests and errors

### View Logs via CLI
```bash
heroku logs --tail --app manufacturing-schedule-7575b6f1cdb3
```

### View App Metrics
1. Go to **"Metrics"** tab in Heroku dashboard
2. See dyno load, response times, throughput

---

## ⚠️ Troubleshooting

### Error: "Application Error" when opening app

**Check logs**:
```bash
heroku logs --tail --app manufacturing-schedule-7575b6f1cdb3
```

**Common causes**:
- Missing environment variables (check Config Vars)
- Wrong Airtable credentials
- Deployed wrong branch (must use `claude/heroku-backend-md53Z`)

### Error: "Failed to save job to Airtable"

**Causes**:
- Wrong `AIRTABLE_API_KEY` or `AIRTABLE_BASE_ID`
- Missing tables in Airtable
- Wrong table names (must be exactly "Jobs" and "MachinePriorities")

**Fix**:
1. Verify Config Vars in Heroku Settings
2. Check Airtable base has correct tables
3. Restart Heroku app: **"More"** → **"Restart all dynos"**

### Error: CORS issues in browser console

**Symptoms**:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix**:
1. Go to Heroku Settings → Config Vars
2. Update `ALLOWED_ORIGINS` to include your frontend URL
3. Example: `https://your-site.netlify.app,https://another-domain.com`
4. Or use `*` to allow all origins (not recommended for production)

### Build fails during deployment

**Check**:
- Make sure you're deploying the `claude/heroku-backend-md53Z` branch (not the main branch)
- Check that `package.json` has all dependencies
- Look for error messages in build log

---

## 💰 Heroku Pricing & Limits

### Free Tier (Eco Dynos - $5/month for 1000 hours)
- Good for development and testing
- Apps sleep after 30 minutes of inactivity
- 1000 dyno hours per month shared across all apps

### Hobby Tier ($7/month per app)
- App never sleeps
- Custom domains with SSL
- Better for production use

### Production Tier ($25+/month)
- Higher performance
- Dedicated resources
- Better for high-traffic applications

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend URL accessible: `https://YOUR-APP-NAME.herokuapp.com/`
- [ ] Health endpoint works: `/health` returns `{"status":"ok"}`
- [ ] Jobs endpoint works: `/api/jobs` returns jobs array
- [ ] Frontend can save jobs to Airtable
- [ ] Jobs appear in Airtable base after saving
- [ ] Jobs persist after page refresh
- [ ] Drag-and-drop updates Airtable
- [ ] Delete removes from Airtable
- [ ] No errors in browser console
- [ ] No errors in Heroku logs

---

## 🎉 You're Done!

Your backend is now running on Heroku and connected to Airtable!

**Next Steps**:
1. Deploy your frontend to Netlify/Vercel/GitHub Pages
2. Update CORS settings to restrict to your frontend domain
3. Set up automatic deploys for convenience
4. Monitor logs for any issues
5. Consider upgrading to Hobby tier for production use

---

**Your Stack**:
```
Frontend (HTML/CSS/JS) → Netlify/Vercel
         ↓ HTTPS
Backend (Node.js/Express) → Heroku
         ↓ Airtable API
Database (Airtable) → Cloud
```

🚀 **Happy Scheduling!**
