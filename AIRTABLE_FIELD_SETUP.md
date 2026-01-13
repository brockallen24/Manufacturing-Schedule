# 🔧 Airtable Fields Setup - Exact Steps

## ⚠️ CRITICAL: These fields MUST be added for jobs to save

Your Airtable table is missing the required fields. Follow these exact steps to fix it.

---

## 🎯 Quick Start (10 minutes)

1. Open: **https://airtable.com/appYjsKjwhJbkwFv5**
2. Click on the **"Jobs"** table
3. Follow the steps below to add each field

---

## 📋 Step-by-Step: Add Each Field

### STEP 1: Clean Up Existing Table

1. **Select all existing rows** (click checkbox at top left)
2. **Right-click** → **Delete records**
3. If you see a field called **"Attachment Summary"**, delete it:
   - Click the ▼ dropdown on that column
   - Select **"Delete field"**

---

### STEP 2: Add Fields One by One

Click the **"+" button** next to the last column to add each field below.

---

#### Field 1: id
- **Field name**: `id` (lowercase, no spaces)
- **Field type**: **Single line text**
- Click **"Create field"**

---

#### Field 2: type
- **Field name**: `type` (lowercase, no spaces)
- **Field type**: **Single select**
- **Options**:
  - Type: `job` and press Enter
  - Type: `setup` and press Enter
- Click **"Create field"**

---

#### Field 3: machine
- **Field name**: `machine` (lowercase, no spaces)
- **Field type**: **Single line text**
- Click **"Create field"**

---

#### Field 4: jobName
- **Field name**: `jobName` (exact case: j lowercase, N uppercase)
- **Field type**: **Single line text**
- Click **"Create field"**

---

#### Field 5: workOrder
- **Field name**: `workOrder` (exact case: w lowercase, O uppercase)
- **Field type**: **Single line text**
- Click **"Create field"**

---

#### Field 6: numParts
- **Field name**: `numParts` (exact case: n lowercase, P uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Integer**
  - Allow negative numbers: **No** (uncheck)
- Click **"Create field"**

---

#### Field 7: cycleTime
- **Field name**: `cycleTime` (exact case: c lowercase, T uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Decimal**
  - Precision: **2**
- Click **"Create field"**

---

#### Field 8: numCavities
- **Field name**: `numCavities` (exact case: n lowercase, C uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Integer**
  - Allow negative numbers: **No** (uncheck)
- Click **"Create field"**

---

#### Field 9: material
- **Field name**: `material` (lowercase, no spaces)
- **Field type**: **Single line text**
- Click **"Create field"**

---

#### Field 10: totalMaterial
- **Field name**: `totalMaterial` (exact case: t lowercase, M uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Decimal**
  - Precision: **2**
- Click **"Create field"**

---

#### Field 11: totalHours
- **Field name**: `totalHours` (exact case: t lowercase, H uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Decimal**
  - Precision: **2**
- Click **"Create field"**

---

#### Field 12: dueDate
- **Field name**: `dueDate` (exact case: d lowercase, D uppercase)
- **Field type**: **Date**
- **Formatting**:
  - Date format: **Local**
  - Include time: **No** (uncheck)
- Click **"Create field"**

---

#### Field 13: percentComplete
- **Field name**: `percentComplete` (exact case: p lowercase, C uppercase)
- **Field type**: **Number**
- **Formatting**:
  - Number format: **Integer**
  - Allow negative numbers: **No** (uncheck)
- Click **"Create field"**

---

## ✅ Verification Checklist

After adding all fields, verify:

- [ ] Table has 13 fields total (plus any default Airtable fields)
- [ ] Field names match EXACTLY (case-sensitive!)
- [ ] Number fields have correct format (Integer vs Decimal)
- [ ] `type` field has two options: "job" and "setup"
- [ ] `dueDate` is a Date field (not text)

---

## 🧪 Test Your Setup

After adding all fields:

1. Open `diagnose-airtable.html` in your browser
2. Click **"Check What Fields Exist"**
3. Click **"Try to Save a Test Job"**
4. Should see: ✅ "SUCCESS! Test job created successfully!"

---

## 📊 Field Summary Table

Copy this for reference:

| # | Field Name | Type | Format |
|---|------------|------|--------|
| 1 | id | Single line text | |
| 2 | type | Single select | job, setup |
| 3 | machine | Single line text | |
| 4 | jobName | Single line text | |
| 5 | workOrder | Single line text | |
| 6 | numParts | Number | Integer |
| 7 | cycleTime | Number | Decimal (2) |
| 8 | numCavities | Number | Integer |
| 9 | material | Single line text | |
| 10 | totalMaterial | Number | Decimal (2) |
| 11 | totalHours | Number | Decimal (2) |
| 12 | dueDate | Date | Local |
| 13 | percentComplete | Number | Integer |

---

## 🚨 Common Mistakes to Avoid

❌ **Wrong**: Field name is `JobName` (capital J and N)
✅ **Correct**: Field name is `jobName` (lowercase j, capital N)

❌ **Wrong**: `numParts` is Text field
✅ **Correct**: `numParts` is Number field (Integer)

❌ **Wrong**: `type` field with option "Job" (capital J)
✅ **Correct**: `type` field with option "job" (lowercase)

---

## 🎯 Quick Video Guide (Do This!)

**Follow along with these steps:**

1. Go to Airtable base
2. Open "Jobs" table
3. Look at the top - see the column headers?
4. All the way to the right, see a **"+"** button?
5. Click it
6. A panel opens on the right side
7. Type the field name EXACTLY as shown above
8. Select the field type
9. Configure options (if needed)
10. Click "Create field"
11. Repeat for all 13 fields

---

## ✅ Done? Test It!

After setup:

1. Open your frontend app
2. Click "Add New Job"
3. Fill in the form
4. Click "Save Job"
5. **It should work!**
6. Check Airtable - job should appear with all data

---

## 🆘 Need Help?

If you get stuck:

1. Take a screenshot of your Airtable column headers
2. Run `diagnose-airtable.html` and copy the results
3. Tell me what step you're stuck on

I'll guide you through it!

---

**Ready? Go to https://airtable.com/appYjsKjwhJbkwFv5 and start adding fields!** 🚀
