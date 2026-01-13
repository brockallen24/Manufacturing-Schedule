# ✅ Final Deployment Verification Checklist

## 📋 Status Summary

### ✅ Code Status
- **Frontend**: All files present (`index.html`, `css/style.css`, `js/main.js`)
- **Backend**: Deployed to Heroku on `claude/heroku-backend-md53Z` branch
- **API URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api`
- **Airtable Credentials**: Set in Heroku Config Vars

---

## 🧪 Manual Testing Checklist

### **Part 1: Backend API Tests** (5 minutes)

Open these URLs in your browser and verify the responses:

#### Test 1: Root Endpoint
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/`

**Expected Response**:
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

**Status**: [ ] PASS / [ ] FAIL

---

#### Test 2: Health Check
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health`

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "environment": "production"
}
```

**Status**: [ ] PASS / [ ] FAIL

---

#### Test 3: Jobs API (Empty)
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`

**Expected Response**:
```json
{
  "jobs": [],
  "count": 0
}
```

**Status**: [ ] PASS / [ ] FAIL

---

#### Test 4: Priorities API
**URL**: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/priorities`

**Expected Response**: JSON object with machine priorities (may be empty `{}` initially)

**Status**: [ ] PASS / [ ] FAIL

---

### **Part 2: Airtable Connection Tests** (3 minutes)

#### Test 5: Verify Airtable Tables Exist

1. Go to: `https://airtable.com/appYjsKjwhJbkwFv5`
2. Check for these tables:
   - [ ] **Jobs** table exists
   - [ ] **MachinePriorities** table exists

#### Test 6: Check Jobs Table Fields

In the **Jobs** table, verify these fields exist:

- [ ] `id` (Single line text)
- [ ] `type` (Single select: "job", "setup")
- [ ] `jobName` (Single line text)
- [ ] `workOrder` (Single line text)
- [ ] `numParts` (Number)
- [ ] `cycleTime` (Number)
- [ ] `numCavities` (Number)
- [ ] `material` (Single line text)
- [ ] `totalMaterial` (Number)
- [ ] `totalHours` (Number)
- [ ] `dueDate` (Date)
- [ ] `percentComplete` (Number)
- [ ] `machine` (Single line text)
- [ ] `toolNumber` (Single line text)
- [ ] `toolReady` (Single select: "yes", "no")
- [ ] `setupHours` (Number)
- [ ] `setupNotes` (Long text)

#### Test 7: Check MachinePriorities Table

In the **MachinePriorities** table:

- [ ] Has `machine` field (Single line text)
- [ ] Has `priority` field (Single select: "low", "medium", "high", "critical")
- [ ] Has 22 rows for all machines (22, 55, 90-1, 90-2, 90-3, Sumi1, 170-1, 170-2, Sumi2, 260-1, 260-2, 260-3, 260-4, 500-1, 500-2, 550, 770, 950, 1100-1, 1100-2, 1200-1, 1200-2)

---

### **Part 3: Frontend Tests** (5 minutes)

#### Test 8: Open Frontend Locally

1. Open `frontend/index.html` in your browser
2. Verify the page loads without errors

**Checklist**:
- [ ] Page loads successfully
- [ ] Title shows "Manufacturing Schedule - Drag & Drop"
- [ ] All 22 machine columns visible
- [ ] Header buttons visible (Add New Job, Add Setup/Maintenance, Print/PDF, Clear All)
- [ ] No errors in browser console (F12)

---

#### Test 9: Add a Job to Airtable

1. Click **"Add New Job"** button
2. Fill in the form:
   - **Job Name**: `Test Job 1`
   - **Work Order #**: `WO-001`
   - **# Parts**: `1000`
   - **Cycle Time**: `30` (seconds)
   - **# Cavities**: `2`
   - **Material**: `Steel`
   - **Total Material**: `50` (lbs)
   - **Due Date**: (pick any date)
   - **Percent Complete**: `0`
   - **Machine**: Select `22`
3. Click **"Save Job"**

**Expected Results**:
- [ ] Modal closes without errors
- [ ] Job appears in the `22` machine column
- [ ] Job shows all entered information
- [ ] No error alerts appear

**Verify in Airtable**:
- [ ] Go to your Airtable base
- [ ] Open the **Jobs** table
- [ ] Verify "Test Job 1" appears in the table

---

#### Test 10: Edit a Job

1. Double-click on "Test Job 1" in machine 22
2. Change **Percent Complete** to `50`
3. Click **"Save Job"**

**Expected Results**:
- [ ] Modal closes
- [ ] Progress bar updates to 50%
- [ ] Change saved to Airtable (verify in Airtable)

---

#### Test 11: Drag and Drop

1. Drag "Test Job 1" from machine `22` to machine `55`

**Expected Results**:
- [ ] Job moves to machine 55 column
- [ ] Change saved to Airtable (verify job's `machine` field changed to "55")

---

#### Test 12: Delete a Job

1. Click the trash icon on "Test Job 1"
2. Confirm deletion

**Expected Results**:
- [ ] Job removed from screen
- [ ] Job deleted from Airtable (verify in Airtable)

---

#### Test 13: Add Setup/Maintenance

1. Click **"Add Setup/Maintenance"**
2. Fill in:
   - **Tool Number**: `TOOL-123`
   - **Tool Ready**: `Yes`
   - **Total Hours**: `2`
   - **Notes**: `Test setup`
   - **Machine**: Select `55`
3. Click **"Save Setup/Maintenance"**

**Expected Results**:
- [ ] Setup block appears in machine 55 (green color)
- [ ] Setup saved to Airtable

---

#### Test 14: Page Refresh (Data Persistence)

1. Refresh the browser page (F5)

**Expected Results**:
- [ ] Page reloads from Airtable
- [ ] All jobs and setups still visible
- [ ] Data matches what's in Airtable

---

#### Test 15: Machine Priorities

1. Click on the priority dropdown at the top of machine `22`
2. Change to **"High"**

**Expected Results**:
- [ ] Priority changes on screen
- [ ] Priority saved to Airtable MachinePriorities table

---

### **Part 4: Error Handling Tests** (2 minutes)

#### Test 16: Test with Backend Down

1. In Heroku, temporarily stop your app:
   - Go to Heroku Dashboard → Resources → Click the pencil icon
   - Turn off the dyno
2. Try to add a new job in the frontend

**Expected Results**:
- [ ] Alert appears: "Failed to save job to Airtable"
- [ ] Modal stays open (doesn't close)
- [ ] No job added to screen

3. Turn the Heroku dyno back on

---

### **Part 5: Browser Console Check** (1 minute)

#### Test 17: Check for Errors

1. Open browser console (F12 → Console tab)
2. Look for any errors

**Expected Results**:
- [ ] No red errors (warnings in yellow are OK)
- [ ] If API is working: No "Failed to load" messages
- [ ] If API is down: Warning messages about using cached data

---

## 🎯 Final Results

### Backend API Tests
- Test 1 (Root): [ ] PASS
- Test 2 (Health): [ ] PASS
- Test 3 (Jobs): [ ] PASS
- Test 4 (Priorities): [ ] PASS

### Airtable Tests
- Test 5 (Tables exist): [ ] PASS
- Test 6 (Jobs fields): [ ] PASS
- Test 7 (Priorities setup): [ ] PASS

### Frontend Tests
- Test 8 (Page loads): [ ] PASS
- Test 9 (Add job): [ ] PASS
- Test 10 (Edit job): [ ] PASS
- Test 11 (Drag/drop): [ ] PASS
- Test 12 (Delete job): [ ] PASS
- Test 13 (Add setup): [ ] PASS
- Test 14 (Data persistence): [ ] PASS
- Test 15 (Priorities): [ ] PASS

### Error Handling
- Test 16 (Backend down): [ ] PASS
- Test 17 (No errors): [ ] PASS

---

## 🚨 Troubleshooting Guide

### If Backend Tests Fail:

**Problem**: Can't access Heroku URLs

**Solutions**:
1. Check Heroku app status:
   - Go to Heroku Dashboard
   - Check if dyno is running (should be ON)
2. View Heroku logs:
   - Dashboard → More → View logs
   - Look for startup errors
3. Verify Config Vars:
   - Settings → Config Vars
   - Check all 4 variables are set correctly
4. Restart app:
   - More → Restart all dynos

---

### If Airtable Tests Fail:

**Problem**: "Table not found" or "Field not found" errors

**Solutions**:
1. Verify table names are EXACT:
   - Must be "Jobs" not "jobs"
   - Must be "MachinePriorities" not "Machine Priorities"
2. Verify field names match exactly (case-sensitive)
3. Check Airtable API key and Base ID in Heroku Config Vars
4. Regenerate Airtable API key if needed

---

### If Frontend Tests Fail:

**Problem**: Jobs don't save / errors appear

**Solutions**:
1. Check browser console for specific errors
2. Verify API URL in `frontend/js/main.js` line 11
3. Check CORS settings in Heroku Config Vars (`ALLOWED_ORIGINS`)
4. Test backend URLs directly first

---

**Problem**: "Failed to save to Airtable" alerts

**Solutions**:
1. Verify backend is running (test backend URLs)
2. Check Airtable tables have correct fields
3. View Heroku logs for detailed error messages
4. Verify Config Vars in Heroku

---

## ✅ Success Criteria

Your app is **FULLY WORKING** if:

1. ✅ All 4 backend API tests pass
2. ✅ Airtable tables are set up correctly
3. ✅ Frontend loads without errors
4. ✅ Can add a job and it appears in Airtable
5. ✅ Can edit, move, and delete jobs
6. ✅ Jobs persist after page refresh
7. ✅ No errors in browser console

---

## 📊 Quick Status Check

Run through these 5 quick tests (2 minutes):

1. **Backend alive?** → Open: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health`
2. **Airtable connected?** → Open: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`
3. **Frontend works?** → Open: `frontend/index.html`
4. **Can save?** → Add a test job
5. **Data persists?** → Refresh page, job still there?

If all 5 pass → **🎉 YOUR APP IS LIVE AND WORKING!**

---

## 🎉 Next Steps After Verification

Once all tests pass:

1. **Deploy Frontend** to Netlify/Vercel for public access
2. **Add real jobs** to start using the app
3. **Share the link** with your team
4. **Set up Airtable** with actual machine data
5. **Consider upgrading** Heroku to Hobby tier for always-on availability

---

**Deployment Date**: January 13, 2026
**Backend URL**: https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com
**Airtable Base**: appYjsKjwhJbkwFv5
**Status**: Ready for Testing ✅
