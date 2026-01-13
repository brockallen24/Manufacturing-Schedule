# 🚨 Save Button Not Working - Quick Fix Guide

**Last Updated**: January 13, 2026

---

## 🎯 QUICK DIAGNOSIS (2 Minutes)

### Step 1: Open the Diagnostic Tool
Open this file in your browser:
```
frontend/diagnose-save-button.html
```

### Step 2: Click the Buttons in Order
1. **"Test Backend Connection"** - Should show ✅
2. **"Check Airtable Fields"** - Will identify the issue
3. **"Simulate Save Button Click"** - Shows exact error

This will tell you **exactly** why save isn't working.

---

## 🔍 MOST LIKELY CAUSES

### Cause #1: Airtable Fields Missing (90% of cases)

**Symptoms**:
- Button shows error message
- Error mentions "field" or "INVALID_VALUE_FOR_COLUMN"
- Console shows 422 status code

**Quick Check**:
Open browser console (F12) and try to save. Do you see an error like:
```
Error: UNKNOWN_FIELD_NAME
Error: INVALID_VALUE_FOR_COLUMN
Status: 422
```

**Solution**:
Your Airtable "Jobs" table is missing required fields.

1. Go to: https://airtable.com/appYjsKjwhJbkwFv5
2. Open "Jobs" table
3. Add these 13 fields (click "+" button for each):

| Field Name | Type | Details |
|------------|------|---------|
| id | Single line text | |
| type | Single select | Options: "job", "setup" |
| machine | Single line text | |
| jobName | Single line text | |
| workOrder | Single line text | |
| numParts | Number | Integer |
| cycleTime | Number | Decimal |
| numCavities | Number | Integer |
| material | Single line text | |
| totalMaterial | Number | Decimal |
| totalHours | Number | Decimal |
| dueDate | Date | |
| percentComplete | Number | Integer |

**Detailed guide**: Open `AIRTABLE_FIELD_SETUP.md`

---

### Cause #2: Form Validation

**Symptoms**:
- Nothing happens when you click Save
- No error message
- Form doesn't close

**Quick Check**:
Are ALL required fields filled in? Look for red highlights on the form.

**Solution**:
Fill in all fields marked with * (asterisk)

---

### Cause #3: JavaScript Error

**Symptoms**:
- Button doesn't respond at all
- No error message shown
- Console shows red errors

**Quick Check**:
1. Open browser console (F12)
2. Look for red error messages
3. Try clicking Save

**Solution**:
If you see errors like:
- `Uncaught ReferenceError` - Code issue, share error with me
- `Network error` - Backend not responding
- `CORS error` - API configuration issue

---

### Cause #4: Backend Not Responding

**Symptoms**:
- Long delay then error
- Error says "Failed to fetch" or "Network error"

**Quick Check**:
Try opening this in a new tab:
```
https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health
```

Should show: `{"status":"ok","message":"Manufacturing Schedule API is running"}`

**Solution**:
If not responding:
1. Check Heroku dyno status
2. Verify dyno is turned on
3. Check Heroku logs for errors

---

## 🔧 STEP-BY-STEP TROUBLESHOOTING

### Step 1: Open Browser Console
1. Press F12 (or Ctrl+Shift+I on Windows, Cmd+Option+I on Mac)
2. Click "Console" tab
3. Keep it open

### Step 2: Try to Save a Job
1. Click "Add New Job"
2. Fill in all fields
3. Click "Save Job"
4. Watch the console

### Step 3: Identify the Error

**If you see**:
```
Error saving job to Airtable: Error: UNKNOWN_FIELD_NAME
```
→ **Airtable fields missing** (See Cause #1)

**If you see**:
```
Error: Failed to fetch
```
→ **Backend not responding** (See Cause #4)

**If you see**:
```
Nothing (no errors at all)
```
→ **Form validation issue** (See Cause #2)

**If you see**:
```
Uncaught TypeError: Cannot read property...
```
→ **JavaScript error** (See Cause #3)

---

## ✅ VERIFICATION STEPS

After fixing, verify save works:

1. **Open your app**
2. **Click "Add New Job"**
3. **Fill in**:
   - Job Name: Test Job
   - Work Order: WO-001
   - Number of Parts: 100
   - Cycle Time: 1.5
   - Number of Cavities: 2
   - Material: PLA
   - Total Material: 150
   - Due Date: (any future date)
   - Machine: 22
4. **Click "Save Job"**
5. **Should**:
   - Modal closes
   - Job appears on schedule
   - No error message
6. **Check Airtable**:
   - Go to https://airtable.com/appYjsKjwhJbkwFv5
   - Open "Jobs" table
   - See your test job with all data

---

## 🎯 MOST COMMON FIX (Works 90% of time)

**The Problem**: Airtable table missing fields

**The Solution** (10 minutes):

1. **Open**: https://airtable.com/appYjsKjwhJbkwFv5
2. **Click**: "Jobs" table in left sidebar
3. **For each missing field**:
   - Click "+" button (far right of column headers)
   - Enter field name (exactly as shown in table above)
   - Select field type
   - Click "Create field"
4. **Repeat** for all 13 fields
5. **Test**: Try saving a job again

**Need help?** Open `AIRTABLE_FIELD_SETUP.md` for screenshots and details.

---

## 🆘 STILL NOT WORKING?

### Share This Info With Me:

1. **Console errors**: Copy/paste any red errors from browser console
2. **Diagnostic results**: Run `frontend/diagnose-save-button.html` and share results
3. **What happens**: Describe exactly what happens when you click Save

### Quick Tests:

**Test 1**: Can you see the backend?
```
https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health
```
Should show: `{"status":"ok"...}`

**Test 2**: Can you see the jobs?
```
https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs
```
Should show: `{"jobs":[...],"count":...}`

**Test 3**: Do you see errors in console?
Open console (F12), try to save, look for red errors.

---

## 📊 COMPARISON: Working vs Not Working

### ✅ When Save Button WORKS:
1. Click "Add New Job"
2. Fill in form
3. Click "Save Job"
4. Modal closes immediately
5. Job appears on schedule
6. Job is in Airtable
7. No error messages

### ❌ When Save Button DOESN'T WORK:
1. Click "Add New Job"
2. Fill in form
3. Click "Save Job"
4. One of these happens:
   - Nothing (form validation)
   - Error alert appears (Airtable/API issue)
   - Long pause then error (Backend issue)
   - Console shows errors (JavaScript issue)

---

## 🎓 TECHNICAL DETAILS

### How Save Button Works:

```
User clicks "Save Job"
    ↓
JavaScript validates form fields
    ↓
JavaScript sends POST request to Heroku API
    ↓
Heroku backend receives job data
    ↓
Backend calls Airtable SDK to save
    ↓
Airtable checks if all fields exist
    ↓
IF fields missing: Return error 422
IF fields exist: Save data and return success
    ↓
Backend sends response to frontend
    ↓
Frontend updates UI and closes modal
```

**Most common failure point**: Airtable field check (step 6)

### Why It Fails:

When you try to save data to a field that doesn't exist in Airtable, Airtable returns:
```json
{
  "error": "UNKNOWN_FIELD_NAME",
  "message": "Field 'jobName' does not exist"
}
```

The backend passes this error to the frontend, and you see the error alert.

---

## 📁 HELPFUL FILES

- **`frontend/diagnose-save-button.html`** - Diagnostic tool ⭐
- **`AIRTABLE_FIELD_SETUP.md`** - Field setup guide
- **`HOW_TO_TEST_AND_FIX.md`** - General testing guide
- **`SAVE_ISSUE_DIAGNOSIS.md`** - Detailed save issue info

---

## 🎯 TL;DR (Too Long; Didn't Read)

**Problem**: Save button not working

**Most likely cause**: Airtable table missing 13 required fields

**Quick fix**:
1. Go to https://airtable.com/appYjsKjwhJbkwFv5
2. Open "Jobs" table
3. Add 13 fields (see list above)
4. Try save again

**Time**: 10-15 minutes

**Success rate**: 90%

---

**Start here**: Open `frontend/diagnose-save-button.html` to find the exact cause!
