# Browser-Based Troubleshooting Guide

## **Quick Fix: Connect Your Airtable**

Your app is deployed but can't connect to Airtable. Follow these steps to fix it.

---

## **Step 1: Set Environment Variables in Heroku Dashboard**

### **Option A: Use Heroku Dashboard (Easiest - No Terminal Needed)**

1. **Go to Heroku Dashboard**
   - Open your browser
   - Visit: https://dashboard.heroku.com/apps
   - Log in if prompted

2. **Find Your App**
   - You'll see a list of your apps
   - Click on your app name (the one you created)

3. **Open Settings Tab**
   - Click the **"Settings"** tab at the top
   - Scroll down to **"Config Vars"** section
   - Click **"Reveal Config Vars"** button

4. **Add Airtable Credentials**

   **First Variable:**
   - In the **KEY** field, type: `AIRTABLE_API_KEY`
   - In the **VALUE** field, paste your Airtable API key from `backend/.env`
   - Click **"Add"**

   **Second Variable:**
   - In the **KEY** field, type: `AIRTABLE_BASE_ID`
   - In the **VALUE** field, paste your Airtable Base ID from `backend/.env`
   - Click **"Add"**

   **Third Variable:**
   - In the **KEY** field, type: `NODE_ENV`
   - In the **VALUE** field, type: `production`
   - Click **"Add"**

5. **Verify**
   - You should now see 3 config vars listed
   - AIRTABLE_API_KEY
   - AIRTABLE_BASE_ID
   - NODE_ENV

---

### **Option B: Use Terminal (If You Prefer)**

```bash
heroku config:set AIRTABLE_API_KEY=your_api_key_from_backend_env

heroku config:set AIRTABLE_BASE_ID=your_base_id_from_backend_env

heroku config:set NODE_ENV=production
```

**Note:** Replace the placeholder values with your actual credentials from `backend/.env` file.

---

## **Step 2: Set Up Airtable Tables**

### **Go to Your Airtable Base**

1. **Open Airtable**
   - Visit: https://airtable.com
   - Log in to your account

2. **Find Your Base**
   - Look for the base you want to use (your base ID is in `backend/.env`)
   - Click to open it

3. **Create First Table: "Jobs"**

   **If the table doesn't exist:**
   - Click the **"+"** icon next to existing tables
   - Name it exactly: **Jobs** (capital J)

   **Add These Fields (click "+ Add field" for each):**
   - jobName → Single line text
   - workOrder → Single line text
   - numParts → Number (Integer)
   - cycleTime → Number (Decimal)
   - numCavities → Number (Integer)
   - material → Single line text
   - totalMaterial → Number (Decimal)
   - totalHours → Number (Decimal)
   - dueDate → Date
   - percentComplete → Number (Integer)
   - machine → Single line text
   - type → Single line text
   - toolNumber → Single line text
   - toolReady → Single line text
   - notes → Long text

4. **Create Second Table: "MachinePriorities"**

   **Create the table:**
   - Click the **"+"** icon next to tables
   - Name it exactly: **MachinePriorities** (capital M and P, no space)

   **Add These Fields:**
   - machine → Single line text
   - priority → Number (Integer)

5. **Add Machine Priority Data**

   Click "Add record" or paste these rows:

   | machine | priority |
   |---------|----------|
   | 22      | 1        |
   | 55      | 2        |
   | 90-1    | 3        |
   | 90-2    | 4        |
   | 90-3    | 5        |
   | Sumi1   | 6        |
   | 170-1   | 7        |
   | 170-2   | 8        |
   | Sumi2   | 9        |
   | 260-1   | 10       |
   | 260-2   | 11       |
   | 260-3   | 12       |
   | 260-4   | 13       |
   | 500-1   | 14       |
   | 500-2   | 15       |
   | 550     | 16       |
   | 770     | 17       |
   | 950     | 18       |
   | 1100-1  | 19       |
   | 1100-2  | 20       |
   | 1200-1  | 21       |
   | 1200-2  | 22       |

---

## **Step 3: Restart Your Heroku App**

### **Option A: Heroku Dashboard**

1. Go to: https://dashboard.heroku.com/apps
2. Click your app name
3. Click **"More"** button (top right)
4. Click **"Restart all dynos"**
5. Click **"Restart"** to confirm

### **Option B: Terminal**

```bash
heroku restart
```

---

## **Step 4: Test Your App**

### **Open Your App**

1. **Get Your App URL**
   - Go to: https://dashboard.heroku.com/apps
   - Click your app name
   - Click **"Open app"** button (top right)

   OR

   - Your URL is: `https://your-app-name.herokuapp.com`

2. **What You Should See:**
   - Manufacturing Schedule interface
   - 22 machine columns (22, 55, 90-1, etc.)
   - "Add New Job" button
   - "Add Setup/Maintenance" button

### **Test Health Check**

1. In your browser, visit:
   ```
   https://your-app-name.herokuapp.com/health
   ```

2. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-19T...",
     "environment": "production"
   }
   ```

### **Test API**

1. In your browser, visit:
   ```
   https://your-app-name.herokuapp.com/api/jobs
   ```

2. You should see:
   - Empty array: `[]`
   - OR list of jobs if you added any

3. Visit:
   ```
   https://your-app-name.herokuapp.com/api/priorities
   ```

4. You should see your 22 machines with priorities

---

## **Step 5: View Logs (If Still Having Issues)**

### **Heroku Dashboard:**

1. Go to: https://dashboard.heroku.com/apps
2. Click your app name
3. Click **"More"** → **"View logs"**
4. Look for error messages

### **Terminal:**

```bash
heroku logs --tail
```

**Common Errors to Look For:**
- `AIRTABLE_API_KEY is not defined` → Go back to Step 1
- `404 NOT_FOUND` → Check table names (must be exactly "Jobs" and "MachinePriorities")
- `401 UNAUTHORIZED` → Check your API key is correct
- `UNKNOWN_FIELD_NAME` → Check your field names in Airtable

---

## **Quick Checklist**

Use this to verify everything is set up:

- [ ] Config vars set in Heroku (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, NODE_ENV)
- [ ] Airtable base exists (check base ID in backend/.env)
- [ ] Table "Jobs" exists with all required fields
- [ ] Table "MachinePriorities" exists with machine and priority fields
- [ ] 22 machine priorities added to MachinePriorities table
- [ ] App restarted after adding config vars
- [ ] Health check shows "ok" status
- [ ] API endpoints return data (not 500 error)

---

## **Where to Find Your App URL**

### **Method 1: Heroku Dashboard**
1. Visit: https://dashboard.heroku.com/apps
2. Click your app name
3. Click **"Open app"** (top right)
4. The URL is in your browser address bar

### **Method 2: Terminal**
```bash
heroku apps:info
```
Look for "Web URL:" in the output

### **Method 3: Remember Pattern**
Your URL follows this pattern:
```
https://your-app-name.herokuapp.com
```

---

## **Understanding the Error Messages**

### **"Using offline mode"**
- Means: Can't connect to Airtable
- Fix: Set environment variables (Step 1)

### **"500 Internal Server Error"**
- Means: Server crashed trying to access Airtable
- Fix: Check environment variables and table names

### **"Failed to fetch jobs"**
- Means: API request failed
- Fix: Check Airtable tables exist and have correct names

### **"state.machinePriorities.find is not a function"**
- Means: No machine priorities data
- Fix: Add data to MachinePriorities table (Step 2)

---

## **Video Walkthrough Steps**

### **Setting Config Vars:**
1. Click Settings tab
2. Find Config Vars section
3. Click Reveal Config Vars
4. Add each variable one by one
5. Click Add after each

### **Creating Airtable Tables:**
1. Open your base
2. Click + next to tables
3. Name the table
4. Click + Add field
5. Choose field type
6. Name the field
7. Repeat for all fields
8. Add data by clicking into cells

### **Testing:**
1. Open app URL in browser
2. Check if interface loads
3. Try adding a job
4. Check browser console for errors (F12 → Console tab)

---

## **Still Not Working?**

### **Check These in Order:**

1. **Environment Variables**
   - Heroku Dashboard → App → Settings → Reveal Config Vars
   - Should see AIRTABLE_API_KEY, AIRTABLE_BASE_ID, NODE_ENV

2. **Airtable Tables**
   - Open Airtable base
   - Verify table names: "Jobs" and "MachinePriorities" (exact spelling)
   - Check that MachinePriorities has 22 rows of data

3. **API Key is Valid**
   - Go to: https://airtable.com/create/tokens
   - Check if your token is still active
   - Make sure it has access to your base

4. **Base ID is Correct**
   - In Airtable, open your base
   - Look at URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
   - The part starting with "app" is your base ID
   - Should match the value in your `backend/.env` file

---

## **Success! What Next?**

Once everything is working:

1. **Add Your First Job**
   - Click "Add New Job"
   - Fill in the form
   - Select a machine
   - Click Save

2. **Test Drag and Drop**
   - Click and hold a job card
   - Drag to a different machine column
   - Release to drop

3. **Add Setup/Maintenance**
   - Click "Add Setup/Maintenance"
   - Enter tool number
   - Select machine
   - Click Save

4. **Print Schedule**
   - Click "Print/PDF" button
   - Choose your printer or save as PDF

5. **Share With Team**
   - Share your app URL: `https://your-app-name.herokuapp.com`
   - Anyone can access it!

---

## **Your App URLs**

Replace `your-app-name` with your actual Heroku app name:

- **Main App:** `https://your-app-name.herokuapp.com`
- **Health Check:** `https://your-app-name.herokuapp.com/health`
- **Jobs API:** `https://your-app-name.herokuapp.com/api/jobs`
- **Priorities API:** `https://your-app-name.herokuapp.com/api/priorities`
- **Heroku Dashboard:** `https://dashboard.heroku.com/apps/your-app-name`

---

**Need more help? Let me know which step you're stuck on!** 🚀
