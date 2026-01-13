# 🔍 DIAGNOSTIC CHECKLIST - Why Saving Failed

## 📊 System Status

**Your Configuration:**
- Backend API: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com`
- Airtable Base ID: `appYjsKjwhJbkwFv5`
- Frontend: Deployed to Netlify

---

## ✅ Step-by-Step Diagnostic

### **STEP 1: Check if Backend is Running** (CRITICAL)

Open these URLs in your browser RIGHT NOW:

#### Test 1.1: Root Endpoint
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/`

**What you should see**:
```json
{
  "message": "Manufacturing Schedule API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

**If you see an error page**: Backend is down or not deployed properly

---

#### Test 1.2: Health Check
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health`

**What you should see**:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

**If you see an error**: Backend crashed or config issue

---

#### Test 1.3: Jobs API
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`

**What you should see**:
```json
{
  "jobs": [],
  "count": 0,
  "timestamp": "..."
}
```

**If you see errors about fields**: Airtable table not set up correctly

---

### **STEP 2: Check Heroku Deployment Status**

1. Go to: **https://dashboard.heroku.com/apps/manufacturing-schedule-7575b6f1cdb3**

2. Check these indicators:

   #### 2.1: Is the dyno running?
   - Go to **"Resources"** tab
   - Look for "web" dyno
   - **Status should be**: Green circle with "Running"
   - **If OFF**: Click the pencil icon and turn it ON

   #### 2.2: Check Recent Activity
   - Go to **"Activity"** tab
   - Look for recent deploys
   - **Last deploy should be**: Within last hour (your recent fix)
   - **If old**: You need to redeploy from the `claude/heroku-backend-md53Z` branch

   #### 2.3: Check Logs for Errors
   - Click **"More"** → **"View logs"**
   - Look for red ERROR messages
   - Common errors:
     - `Table 'Jobs' could not be found` → Airtable table missing
     - `Invalid API key` → Wrong AIRTABLE_API_KEY
     - `Base not found` → Wrong AIRTABLE_BASE_ID

---

### **STEP 3: Verify Heroku Config Vars**

1. Go to: **https://dashboard.heroku.com/apps/manufacturing-schedule-7575b6f1cdb3/settings**

2. Click **"Reveal Config Vars"**

3. Verify EXACTLY these 4 variables exist:

   | KEY | VALUE STARTS WITH | Status |
   |-----|-------------------|--------|
   | `AIRTABLE_API_KEY` | `patK8dYv5ID2BLAqK...` | [ ] OK |
   | `AIRTABLE_BASE_ID` | `appYjsKjwhJbkwFv5` | [ ] OK |
   | `NODE_ENV` | `production` | [ ] OK |
   | `ALLOWED_ORIGINS` | `*` or your Netlify URL | [ ] OK |

   **If any are missing or wrong**: Update them!

---

### **STEP 4: Check Airtable Tables**

1. Go to: **https://airtable.com/appYjsKjwhJbkwFv5**

2. Verify these tables exist:

   #### 4.1: Jobs Table
   - [ ] Table named EXACTLY **"Jobs"** (capital J)
   - [ ] Has at least these fields:
     - `id` (Single line text)
     - `type` (Single select)
     - `machine` (Single line text)
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

   #### 4.2: MachinePriorities Table
   - [ ] Table named EXACTLY **"MachinePriorities"** (capital M and P)
   - [ ] Has fields: `machine` and `priority`
   - [ ] Has rows for all 22 machines

   **If tables don't exist**: Create them using `AIRTABLE_SETUP_GUIDE.md`

---

### **STEP 5: Test API with Browser Console**

1. Open your frontend in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this command and press Enter:

```javascript
fetch('https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs')
  .then(r => r.json())
  .then(d => console.log('SUCCESS:', d))
  .catch(e => console.error('ERROR:', e))
```

**What should happen**:
- Should log: `SUCCESS: {jobs: [], count: 0, ...}`

**If you see errors**:
- `CORS error`: Check `ALLOWED_ORIGINS` in Heroku
- `404 Not Found`: Backend not deployed
- `500 Server Error`: Check Heroku logs

---

### **STEP 6: Test Saving a Job**

1. Open your frontend
2. Open browser console (F12 → Console tab)
3. Click **"Add New Job"**
4. Fill in the form:
   - Job Name: `Test`
   - Work Order: `001`
   - # Parts: `100`
   - Cycle Time: `30`
   - # Cavities: `2`
   - Material: `Steel`
   - Total Material: `50`
   - Due Date: (any date)
   - Machine: `22`
5. Click **"Save Job"**

**Watch the console for errors**:

#### Possible Error Messages:

**Error: "Failed to save job to Airtable"**
- Backend is working but Airtable has issues
- Check Airtable tables exist
- Check field names match exactly

**Error: "Network request failed" or "ERR_CONNECTION_REFUSED"**
- Backend is not running
- Check Heroku dyno is ON
- Check backend URL is correct

**Error: "CORS policy blocked"**
- CORS not configured properly
- Update `ALLOWED_ORIGINS` in Heroku Config Vars

**Error: "422 Unprocessable Entity"**
- Missing required fields in Airtable
- Check all fields exist in Jobs table

---

## 🔧 IMMEDIATE ACTION PLAN

Based on the most common issues, do these RIGHT NOW:

### **Action 1: Redeploy Backend** (2 minutes)

The fix I just made needs to be deployed to Heroku:

1. Go to: https://dashboard.heroku.com/apps/manufacturing-schedule-7575b6f1cdb3
2. Click **"Deploy"** tab
3. Scroll to **"Manual deploy"**
4. Branch: `claude/heroku-backend-md53Z`
5. Click **"Deploy Branch"**
6. **WAIT** for build to complete (2-3 minutes)
7. Check logs show "Build succeeded"

**This is CRITICAL - the fix won't work until you redeploy!**

---

### **Action 2: Verify Airtable Tables** (5 minutes)

1. Go to: https://airtable.com/appYjsKjwhJbkwFv5
2. Check you have 2 tables: **"Jobs"** and **"MachinePriorities"**
3. Click on **Jobs** table
4. Click **"+ Add field"** and verify these fields exist:
   - `id`, `type`, `machine`, `jobName`, `workOrder`, `numParts`, `cycleTime`, `numCavities`, `material`, `totalMaterial`, `totalHours`, `dueDate`, `percentComplete`

**If ANY fields are missing**: Add them now!

**Field Types**:
- Text fields: `id`, `machine`, `jobName`, `workOrder`, `material`
- Number fields: `numParts`, `cycleTime`, `numCavities`, `totalMaterial`, `totalHours`, `percentComplete`
- Date field: `dueDate`
- Single select: `type` (options: "job", "setup")

---

### **Action 3: Test Backend API** (1 minute)

Open this URL: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`

**If it shows JSON**: Backend is working ✅
**If it shows HTML error page**: Backend failed ❌

---

### **Action 4: Check Browser Console** (1 minute)

1. Open your frontend
2. Press **F12**
3. Go to **Console** tab
4. Try adding a job
5. **Read the error message** in the console
6. **Tell me EXACTLY what error you see**

---

## 📋 Quick Diagnostic Questions

Answer these to help me identify the issue:

1. **Backend API Test**:
   - Does `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health` return JSON?
   - [ ] Yes (shows `{"status":"ok"}`)
   - [ ] No (shows HTML error page or nothing)

2. **Heroku Status**:
   - Is the web dyno running (green)?
   - [ ] Yes
   - [ ] No
   - [ ] Don't know how to check

3. **Recent Deploy**:
   - Did you redeploy after I pushed the fix?
   - [ ] Yes, deployed within last hour
   - [ ] No, haven't redeployed
   - [ ] Don't know

4. **Airtable Tables**:
   - Do you have a table named exactly "Jobs"?
   - [ ] Yes
   - [ ] No
   - [ ] Not sure

5. **Error Message**:
   - What error do you see when trying to save?
   - (Paste the exact error from browser console)

---

## 🎯 Most Likely Issues (Ranked)

### #1: Backend Not Redeployed ⭐⭐⭐⭐⭐
**Probability**: 90%
**Fix**: Redeploy from `claude/heroku-backend-md53Z` branch
**Time**: 2 minutes

### #2: Airtable Tables Not Set Up ⭐⭐⭐⭐
**Probability**: 80%
**Fix**: Create "Jobs" table with all required fields
**Time**: 5 minutes

### #3: Heroku Dyno Not Running ⭐⭐⭐
**Probability**: 40%
**Fix**: Turn on dyno in Resources tab
**Time**: 30 seconds

### #4: Wrong Config Vars ⭐⭐
**Probability**: 20%
**Fix**: Verify all 4 Config Vars in Heroku
**Time**: 1 minute

### #5: CORS Issues ⭐
**Probability**: 10%
**Fix**: Update ALLOWED_ORIGINS
**Time**: 1 minute

---

## 🚨 Emergency Fix - If Nothing Works

If all else fails, try this:

1. **Check Heroku logs** for the EXACT error:
   ```
   Dashboard → More → View logs
   ```

2. **Copy the error message** and send it to me

3. **Take a screenshot** of:
   - Your Airtable base (showing table names)
   - Heroku Config Vars
   - Browser console errors

---

## ✅ Report Back

After checking everything above, tell me:

1. **Backend API status**: Working / Not working
2. **Heroku dyno status**: Running / Not running
3. **Airtable tables**: Exist / Don't exist
4. **Exact error message**: (paste from browser console)
5. **Last deploy time**: (from Heroku Activity tab)

With this information, I can pinpoint the exact issue!

---

**Start with Action 1 (Redeploy) - this is most likely the issue!**
