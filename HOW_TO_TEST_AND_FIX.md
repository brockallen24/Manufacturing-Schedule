# 🔧 How to Test and Fix Missing Fields

## ⚠️ Important Limitations

**What I Cannot Do:**
- ❌ Cannot make network calls from this environment to test your Airtable
- ❌ Cannot add fields to Airtable (API doesn't support schema changes)

**What You Can Do:**
- ✅ Run the test scripts I created to identify missing fields
- ✅ Add the fields manually through Airtable's web interface
- ✅ Verify everything works

---

## 🎯 OPTION 1: Quick Browser Test (RECOMMENDED)

### Step 1: Open the Diagnostic Tool
Open this file in your web browser:
```
frontend/test-save.html
```

### Step 2: Run Tests
Click each button:
1. **"Test Connection"** - Verifies Heroku backend is running
2. **"Check What Fields Exist"** - Shows current Airtable structure
3. **"Try to Save Test Job"** - Attempts to save and shows exact error

This will tell you **exactly** which fields are missing.

---

## 🎯 OPTION 2: Command Line Test

### Step 1: Run the Test Script
```bash
cd backend
node test-connection.js
```

This script will:
- ✅ Connect to your Airtable
- ✅ Show which fields currently exist
- ✅ List which fields are missing
- ✅ Try to save a test job
- ✅ Show detailed error messages

### Step 2: Read the Output
The script will show you exactly which fields need to be added.

---

## 📋 REQUIRED FIELDS

Your "Jobs" table MUST have these 13 fields:

| # | Field Name | Field Type | Format |
|---|------------|------------|--------|
| 1 | id | Single line text | |
| 2 | type | Single select | Options: "job", "setup" |
| 3 | machine | Single line text | |
| 4 | jobName | Single line text | |
| 5 | workOrder | Single line text | |
| 6 | numParts | Number | Integer |
| 7 | cycleTime | Number | Decimal (2 places) |
| 8 | numCavities | Number | Integer |
| 9 | material | Single line text | |
| 10 | totalMaterial | Number | Decimal (2 places) |
| 11 | totalHours | Number | Decimal (2 places) |
| 12 | dueDate | Date | Local format |
| 13 | percentComplete | Number | Integer |

---

## 🔧 HOW TO ADD FIELDS

### Step 1: Open Your Airtable Base
Go to: https://airtable.com/appYjsKjwhJbkwFv5

### Step 2: Open the "Jobs" Table
Click on the "Jobs" table in the left sidebar

### Step 3: Add Each Field
For each missing field:

1. Click the **"+"** button at the right end of the column headers
2. A panel opens on the right
3. Enter the field name **exactly** as shown above (case-sensitive!)
4. Select the field type
5. Configure any options (for "type" field, add "job" and "setup" options)
6. Click "Create field"
7. Repeat for all missing fields

### Detailed Guide
For step-by-step instructions with screenshots descriptions:
**Open file: `AIRTABLE_FIELD_SETUP.md`**

---

## ✅ HOW TO VERIFY IT WORKS

### Method 1: Run Browser Test Again
1. Open `frontend/test-save.html`
2. Click "Check What Fields Exist" - Should show all 13 fields
3. Click "Try to Save Test Job" - Should show ✅ SUCCESS
4. Click "Delete Test Job" to clean up

### Method 2: Run Command Line Test Again
```bash
cd backend
node test-connection.js
```

Should show: "🎉 ALL TESTS PASSED!"

### Method 3: Test Your App
1. Open your Manufacturing Schedule app
2. Click "Add New Job"
3. Fill in the form
4. Click "Save Job"
5. Should save without errors!
6. Check Airtable - job should appear with all data

---

## 🚨 COMMON ISSUES

### Issue: "Cannot find module 'airtable'"
**Solution**:
```bash
cd backend
npm install
```

### Issue: "Missing credentials"
**Solution**: The `.env` file should already be created with your credentials.
If not, create `backend/.env` with:
```
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```
(Use your actual API key and base ID)

### Issue: Field names don't match
**Solution**: Field names are case-sensitive!
- ✅ Correct: `jobName`
- ❌ Wrong: `JobName`, `Jobname`, `job_name`

### Issue: Still getting save errors
**Solution**:
1. Open browser console (F12)
2. Try to save a job
3. Look for the exact error message
4. Share the error with me for specific help

---

## 📊 QUICK SUMMARY

**To test**:
- Open `frontend/test-save.html` in browser (easiest)
- OR run `node backend/test-connection.js` in terminal

**To fix**:
1. Go to https://airtable.com/appYjsKjwhJbkwFv5
2. Open "Jobs" table
3. Add the 13 fields listed above
4. Follow `AIRTABLE_FIELD_SETUP.md` for details

**To verify**:
- Run the test again - should show SUCCESS
- Try adding a job in your app - should save

---

## 🎯 NEXT STEPS

1. **Right now**: Open `frontend/test-save.html` in your browser
2. **Click**: "Check What Fields Exist"
3. **See**: Exactly which fields are missing
4. **Go to**: https://airtable.com/appYjsKjwhJbkwFv5
5. **Add**: The missing fields
6. **Test again**: Should work!

---

**Time needed**: 10-15 minutes to add all fields

**Questions?** Share the output from the test tool and I can help troubleshoot!
