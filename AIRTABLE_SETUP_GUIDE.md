# 🔧 Airtable Setup Guide - CRITICAL for Saving Jobs

## ⚠️ IMPORTANT: This setup is REQUIRED for the app to work!

Your Airtable base **MUST** have these exact tables and fields, or saving will fail.

---

## 📊 Required Tables

Your Airtable base needs **2 tables**:

1. **Jobs** (stores all job and setup data)
2. **MachinePriorities** (stores machine priority levels)

---

## 📋 Table 1: Jobs

### Table Name (EXACT):
```
Jobs
```
**⚠️ Case-sensitive! Must be "Jobs" not "jobs"**

### Required Fields:

Create these fields in your Airtable **Jobs** table:

| Field Name | Field Type | Options/Settings | Required? |
|------------|------------|------------------|-----------|
| `id` | Single line text | | ✅ Yes |
| `type` | Single select | Options: `job`, `setup` | ✅ Yes |
| `machine` | Single line text | | ✅ Yes |
| `jobName` | Single line text | | For job type |
| `workOrder` | Single line text | | For job type |
| `numParts` | Number | Integer, Allow negative: No | For job type |
| `cycleTime` | Number | Decimal, Precision: 2 | For job type |
| `numCavities` | Number | Integer, Allow negative: No | For job type |
| `material` | Single line text | | For job type |
| `totalMaterial` | Number | Decimal, Precision: 2 | For job type |
| `totalHours` | Number | Decimal, Precision: 2 | For job type |
| `dueDate` | Date | Date format: Local | For job type |
| `percentComplete` | Number | Integer, 0-100 | ✅ Yes |
| `toolNumber` | Single line text | | For setup type |
| `toolReady` | Single select | Options: `yes`, `no` | For setup type |
| `setupHours` | Number | Decimal, Precision: 2 | For setup type |
| `setupNotes` | Long text | Enable rich text: No | For setup type |

### Field Setup Instructions:

1. **Go to your Airtable base**: https://airtable.com/appYjsKjwhJbkwFv5
2. Open the **Jobs** table (create it if it doesn't exist)
3. Add each field above by clicking **+** next to the last column
4. For each field:
   - Set the **exact** field name (case-sensitive!)
   - Choose the correct field type
   - Configure options as specified

### Visual Field Order (Recommended):
```
id | type | machine | jobName | workOrder | numParts | cycleTime | numCavities | material | totalMaterial | totalHours | dueDate | percentComplete | toolNumber | toolReady | setupHours | setupNotes
```

---

## 📋 Table 2: MachinePriorities

### Table Name (EXACT):
```
MachinePriorities
```
**⚠️ Case-sensitive! Must be "MachinePriorities"**

### Required Fields:

| Field Name | Field Type | Options/Settings | Required? |
|------------|------------|------------------|-----------|
| `machine` | Single line text | Primary field | ✅ Yes |
| `priority` | Single select | Options: `low`, `medium`, `high`, `critical` | ✅ Yes |

### Pre-populate with Machine Data:

After creating the fields, add these **22 rows**:

| machine | priority |
|---------|----------|
| 22 | medium |
| 55 | medium |
| 90-1 | medium |
| 90-2 | medium |
| 90-3 | medium |
| Sumi1 | medium |
| 170-1 | medium |
| 170-2 | medium |
| Sumi2 | medium |
| 260-1 | medium |
| 260-2 | medium |
| 260-3 | medium |
| 260-4 | medium |
| 500-1 | medium |
| 500-2 | medium |
| 550 | medium |
| 770 | medium |
| 950 | medium |
| 1100-1 | medium |
| 1100-2 | medium |
| 1200-1 | medium |
| 1200-2 | medium |

**Tip**: You can copy this data and paste it directly into Airtable as a grid.

---

## ✅ Verification Checklist

After setting up your tables, verify:

### Jobs Table Checklist:
- [ ] Table name is exactly "Jobs" (capital J)
- [ ] Has 17 fields total
- [ ] `id` field is Single line text
- [ ] `type` field is Single select with options: "job" and "setup"
- [ ] `machine` field is Single line text
- [ ] `numParts`, `numCavities` are Integer numbers
- [ ] `cycleTime`, `totalMaterial`, `totalHours`, `setupHours` are Decimal numbers
- [ ] `percentComplete` is Integer number (0-100)
- [ ] `dueDate` is Date field
- [ ] `toolReady` is Single select with options: "yes" and "no"
- [ ] `setupNotes` is Long text field
- [ ] All field names match EXACTLY (case-sensitive)

### MachinePriorities Table Checklist:
- [ ] Table name is exactly "MachinePriorities" (capital M and P)
- [ ] Has 2 fields: `machine` and `priority`
- [ ] `priority` is Single select with 4 options: "low", "medium", "high", "critical"
- [ ] Has 22 rows (one for each machine)
- [ ] All 22 machine names are entered correctly

---

## 🧪 Test Your Setup

### Test 1: Create a Test Job via API

Open this URL in your browser:
```
https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs
```

**Expected**: Returns `{"jobs":[],"count":0}` with no errors

**If you see errors**: Check Heroku logs and verify table names

### Test 2: Add a Job from Frontend

1. Open your frontend app
2. Click "Add New Job"
3. Fill in the form:
   - Job Name: `Test Job`
   - Work Order: `WO-001`
   - # Parts: `100`
   - Cycle Time: `30`
   - # Cavities: `2`
   - Material: `Steel`
   - Total Material: `50`
   - Due Date: (any date)
   - Machine: `22`
4. Click "Save Job"

**Expected**: Job saves without error and appears in the UI

**If you see error**: Open browser console (F12) and check the error message

### Test 3: Verify in Airtable

1. Go to your Airtable base
2. Open the **Jobs** table
3. **Expected**: You should see "Test Job" with all data filled in

---

## 🚨 Common Issues & Fixes

### Issue 1: "Failed to save job to Airtable"

**Causes**:
- Table name is wrong (must be exactly "Jobs")
- Missing required fields
- Field names don't match exactly
- Field types are wrong

**Fix**:
1. Double-check table name: "Jobs" (capital J)
2. Verify ALL 17 fields exist
3. Check field names match exactly (case-sensitive)
4. Verify field types match the table above

---

### Issue 2: "Table 'Jobs' not found"

**Cause**: Table name is incorrect

**Fix**:
1. Go to Airtable
2. Find your Jobs table
3. Click the dropdown arrow next to the table name
4. Rename to exactly: `Jobs`

---

### Issue 3: "Unknown field name" error in Heroku logs

**Cause**: Frontend is sending a field that doesn't exist in Airtable

**Fix**:
1. Check Heroku logs to see which field is missing
2. Add that field to your Airtable Jobs table
3. Make sure field name matches exactly (case-sensitive)

---

### Issue 4: Jobs save but don't load

**Cause**: Missing `id` field or wrong field type

**Fix**:
1. Verify `id` field exists in Jobs table
2. Make sure it's "Single line text" type
3. Airtable will store the job's unique ID here

---

### Issue 5: Can't update machine priorities

**Cause**: MachinePriorities table not set up correctly

**Fix**:
1. Check table name is exactly "MachinePriorities"
2. Has `machine` field (Single line text)
3. Has `priority` field (Single select: low, medium, high, critical)
4. All 22 machines are in the table

---

## 📱 Quick Setup Steps (5 Minutes)

### For Jobs Table:

1. **Create table** named "Jobs"
2. **Add these 17 fields** (in order recommended):
   ```
   id (text) → type (select: job,setup) → machine (text) →
   jobName (text) → workOrder (text) → numParts (integer) →
   cycleTime (decimal) → numCavities (integer) → material (text) →
   totalMaterial (decimal) → totalHours (decimal) → dueDate (date) →
   percentComplete (integer) → toolNumber (text) →
   toolReady (select: yes,no) → setupHours (decimal) → setupNotes (long text)
   ```

### For MachinePriorities Table:

1. **Create table** named "MachinePriorities"
2. **Add 2 fields**:
   - `machine` (Single line text)
   - `priority` (Single select: low, medium, high, critical)
3. **Add 22 rows** with machine names (22, 55, 90-1, etc.)
4. **Set all priorities** to "medium" initially

---

## 🔍 Field Type Reference

**Single line text** = Short text field (like job name, work order #)
**Long text** = Multi-line text field (like notes)
**Number - Integer** = Whole numbers only (like 100, 1000)
**Number - Decimal** = Decimal numbers (like 12.5, 3.14)
**Date** = Date picker field
**Single select** = Dropdown with predefined options

---

## ✅ Final Verification

After setup is complete, test the full flow:

1. ✅ Backend API returns `{"jobs":[],"count":0}`
2. ✅ Can add a job from frontend without errors
3. ✅ Job appears in Airtable Jobs table
4. ✅ Can edit the job (double-click)
5. ✅ Can drag job to different machine
6. ✅ Can delete the job
7. ✅ Job is removed from Airtable
8. ✅ Refresh frontend - data loads from Airtable

**If all 8 tests pass → Your Airtable is set up correctly!** 🎉

---

## 📞 Need Help?

If you're still having issues:

1. **Check Heroku logs**:
   - Go to Heroku Dashboard
   - Click "More" → "View logs"
   - Look for specific error messages

2. **Check browser console**:
   - Open frontend
   - Press F12
   - Go to Console tab
   - Look for red errors

3. **Verify credentials**:
   - Heroku Config Vars have correct API key and Base ID
   - API key starts with `pat...`
   - Base ID starts with `app...`

4. **Test API directly**:
   - Open: `https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs`
   - Should return JSON, not HTML error page

---

**Your Airtable Credentials**:
- Base ID: `appYjsKjwhJbkwFv5`
- Base URL: https://airtable.com/appYjsKjwhJbkwFv5

**Quick Access Links**:
- Airtable Base: https://airtable.com/appYjsKjwhJbkwFv5
- Backend API: https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com
- Heroku Dashboard: https://dashboard.heroku.com/apps/manufacturing-schedule-7575b6f1cdb3

---

**Last Updated**: January 13, 2026
**Status**: Ready for Setup ✅
