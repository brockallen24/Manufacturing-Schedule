# Airtable Setup and Troubleshooting Guide

## Step 1: Verify Heroku Environment Variables

Your app needs these environment variables set on Heroku:

### Check if they're set:
```bash
heroku config --app your-app-name
```

### You should see:
```
AIRTABLE_API_KEY: patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID: appXXXXXXXXXXXXXX
```

### If they're missing, set them:
```bash
heroku config:set AIRTABLE_API_KEY=your_key_here --app your-app-name
heroku config:set AIRTABLE_BASE_ID=your_base_id_here --app your-app-name
```

### Where to find these values:

**AIRTABLE_API_KEY:**
1. Go to https://airtable.com/account
2. Click "Generate API key" or copy existing key
3. Format: `patXXXXXXXXXXXXXX` (starts with "pat")

**AIRTABLE_BASE_ID:**
1. Go to https://airtable.com/api
2. Select your base
3. Find "The ID of this base is appXXXXXXXXXXXXXX"
4. Format: `appXXXXXXXXXXXXXX` (starts with "app")

---

## Step 2: Check Your Airtable Base Structure

Your Airtable base MUST have these tables:

### Table 1: "Jobs"
This table stores all your manufacturing jobs.

### Table 2: "MachinePriorities"
This table stores machine priority settings.

---

## Step 3: Discover Your Exact Airtable Field Names

**CRITICAL:** The field names in Airtable must match exactly what the code expects.

### Method A: Check in Airtable Web Interface
1. Open your Airtable base
2. Click on the "Jobs" table
3. Look at the column headers - these are your field names
4. Write down the EXACT names (including spaces, capitalization)

### Method B: Run Diagnostic Script (Recommended)

I've created a diagnostic script that will show you exactly what field names Airtable has.

**To run it locally:**
```bash
# 1. Create .env file in backend directory
cd /home/user/Manufacturing-Schedule/backend
cat > .env << EOF
AIRTABLE_API_KEY=your_actual_key_here
AIRTABLE_BASE_ID=your_actual_base_id_here
EOF

# 2. Run diagnostic
node diagnose-airtable.js
```

**To run it on Heroku:**
```bash
heroku run node backend/diagnose-airtable.js --app your-app-name
```

This will output:
- ✓ Connection status
- ✓ Actual field names in your table
- ✓ Sample data
- ✓ Field types
- ✓ What's causing the error

---

## Step 4: Common Airtable Field Name Patterns

Based on your frontend, here's what the code expects and possible Airtable variations:

| Frontend Field | Possible Airtable Names |
|----------------|------------------------|
| `jobName` | `Name`, `Job Name`, `JobName`, `job_name` |
| `workOrder` | `Work Order`, `WorkOrder`, `work_order`, `WO` |
| `numParts` | `Num Parts`, `Number of Parts`, `Parts`, `num_parts` |
| `cycleTime` | `Cycle Time`, `CycleTime`, `cycle_time` |
| `numCavities` | `Num Cavities`, `Number of Cavities`, `Cavities` |
| `material` | `Material`, `Material Type` |
| `totalMaterial` | `Total Material`, `TotalMaterial`, `total_material` |
| `totalHours` | `Total Hours`, `TotalHours`, `total_hours`, `Hours` |
| `dueDate` | `Due Date`, `DueDate`, `due_date` |
| `percentComplete` | `Percent Complete`, `% Complete`, `percent_complete` |
| `machine` | `Machine`, `machine` |
| `type` | `Type`, `type`, `Job Type` |

---

## Step 5: Required Fields in Airtable

Check if these fields are marked as "Required" in Airtable:

1. Open your base settings
2. Check field options
3. If a field is required but not sent, the save will fail

**Minimum required fields for job creation:**
- `machine` (the code validates this)
- Any other fields Airtable marks as required

---

## Step 6: Check Browser Console for Error Details

When you try to save a job and it fails:

1. Open browser Developer Tools (F12)
2. Go to "Console" tab
3. Try to save a job
4. Look for red error messages
5. The error will show exactly what Airtable rejected

**Look for messages like:**
```
Error creating job: UNKNOWN_FIELD_NAME
Error: Field "XYZ" does not exist
Error: Invalid value for field "ABC"
```

---

## Step 7: Check Heroku Logs

See real-time errors from your Heroku app:

```bash
heroku logs --tail --app your-app-name
```

Then try to create a job. You'll see the exact error.

---

## Quick Fix Options

### Option A: Use Test Endpoint

Visit this URL in your browser (replace with your Heroku app URL):
```
https://your-app.herokuapp.com/api/test/create-job
```

This will attempt to create a test job and show you the exact error.

### Option B: Simplify Field Mapping

If you want to test with minimal fields, try creating a job with just:
- `machine`: "22"
- `type`: "job"

This will help identify if it's a field name issue or connection issue.

---

## Most Likely Solutions

### Solution 1: Field Names Use Lowercase in Airtable

If your Airtable uses lowercase field names like `jobname`, `workorder`, etc., update the mapping in `backend/routes/jobs.js`:

```javascript
const airtableFields = {
  'jobname': jobData.jobName,        // lowercase
  'workorder': jobData.workOrder,    // lowercase
  'machine': jobData.machine,
  // ... etc
};
```

### Solution 2: Field Names Use Exact Capitalization

If Airtable uses `Job Name` (with space), use:
```javascript
const airtableFields = {
  'Job Name': jobData.jobName,
  'Work Order': jobData.workOrder,
  // ... etc
};
```

### Solution 3: Send Raw Data (No Mapping)

As a test, try sending data directly without mapping:
```javascript
// In jobs.js POST route, replace mapping with:
const records = await jobsTable.create([
  { fields: req.body }  // Send exactly what frontend sends
]);
```

This only works if your Airtable field names match the frontend exactly (`jobName`, `workOrder`, etc.).

---

## Next Steps

1. **First**, run the diagnostic script to see actual field names
2. **Second**, check Heroku environment variables
3. **Third**, update field mapping based on diagnostic results
4. **Fourth**, redeploy and test

Let me know what the diagnostic shows!
