# 🔑 Airtable Credentials for Heroku

This document shows you exactly where to find and how to use your Airtable credentials for the Manufacturing Schedule app.

---

## 📋 Required Credentials

You need **TWO** pieces of information from Airtable:

### 1. AIRTABLE_API_KEY
### 2. AIRTABLE_BASE_ID

---

## 🔍 How to Get Your AIRTABLE_API_KEY

### Step 1: Go to Your Airtable Account Settings
**URL**: https://airtable.com/account

### Step 2: Find the API Section
Scroll down until you see **"API"** or **"Personal access tokens"**

### Step 3: Generate or Copy Your API Key
- If you see an existing key: **Copy it**
- If you don't have one: Click **"Generate token"** or **"Generate API key"**

### What It Looks Like:
```
keyXXXXXXXXXXXXXX
```
Example: `key1a2b3c4d5e6f7g8`

⚠️ **IMPORTANT**:
- This is a **SECRET** - don't share it publicly
- Keep it secure - it gives full access to your Airtable account
- If compromised, regenerate it immediately

---

## 🔍 How to Get Your AIRTABLE_BASE_ID

### Step 1: Go to Airtable API Documentation
**URL**: https://airtable.com/api

### Step 2: Select Your Base
- You'll see a list of all your bases
- Click on **"Manufacturing Schedule"** (or whatever you named your base)

### Step 3: Find Your Base ID
Your Base ID is shown in:
1. **The URL** - Look at the browser address bar
2. **The introduction section** of the API docs
3. **Code examples** in the documentation

### What It Looks Like:
```
appXXXXXXXXXXXXXX
```
Example: `app1a2b3c4d5e6f7g`

### Alternative Method:
You can also find it in the URL when viewing your base:
```
https://airtable.com/appXXXXXXXXXXXXXX/...
                      ^^^^^^^^^^^^^^^^
                      This is your Base ID
```

---

## 🎯 Quick Copy Template

Use this template when setting up Heroku Config Vars:

```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

**Replace**:
- `keyXXXXXXXXXXXXXX` with your actual API key
- `appXXXXXXXXXXXXXX` with your actual Base ID

---

## 🔧 How to Set These in Heroku

### Method 1: Via Heroku Dashboard

1. Go to: https://dashboard.heroku.com/apps/YOUR-APP-NAME
2. Click **"Settings"** tab
3. Scroll to **"Config Vars"**
4. Click **"Reveal Config Vars"**
5. Add each credential:

| **KEY** | **VALUE** |
|---------|-----------|
| `AIRTABLE_API_KEY` | Paste your key (starts with `key`) |
| `AIRTABLE_BASE_ID` | Paste your Base ID (starts with `app`) |

6. Click **"Add"** after each one

### Method 2: Via Heroku CLI

```bash
# Set API Key
heroku config:set AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX --app YOUR-APP-NAME

# Set Base ID
heroku config:set AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX --app YOUR-APP-NAME

# Verify they're set
heroku config --app YOUR-APP-NAME
```

---

## ✅ Verify Your Credentials Are Working

### Test 1: Check Config Vars Are Set

**Dashboard**:
1. Go to Settings → Config Vars
2. You should see both `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`

**CLI**:
```bash
heroku config --app YOUR-APP-NAME
```

Should show:
```
AIRTABLE_API_KEY: keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID: appXXXXXXXXXXXXXX
```

### Test 2: Test API Connection

**Open in browser**:
```
https://YOUR-APP-NAME.herokuapp.com/api/jobs
```

**Success**: Returns `{"jobs":[],"count":0}`

**Failure**: Returns error message
- Check credentials are correct
- Check Airtable base has "Jobs" table
- Check Heroku logs: `heroku logs --tail --app YOUR-APP-NAME`

---

## 🛡️ Security Best Practices

### ✅ DO:
- Keep your API key secret
- Only share with trusted services (like Heroku)
- Use environment variables (Config Vars) - never hardcode in files
- Regenerate key if it's ever exposed
- Use `.env` files for local development (and add to `.gitignore`)

### ❌ DON'T:
- Commit API keys to Git repositories
- Share keys in emails, Slack, or public forums
- Hardcode keys in source code
- Use the same key for multiple projects (if possible)
- Leave keys in browser history or screenshots

---

## 📋 Complete Heroku Config Vars Checklist

When you're done, your Heroku app should have these Config Vars:

| **KEY** | **VALUE** | **Status** |
|---------|-----------|------------|
| `AIRTABLE_API_KEY` | `keyXXXXXXXXXXXXXX` | ✅ Required |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | ✅ Required |
| `NODE_ENV` | `production` | ✅ Required |
| `ALLOWED_ORIGINS` | `*` or your frontend URL | ✅ Required |
| `PORT` | (Heroku sets automatically) | ⚪ Auto-set |

---

## 🔄 Changing Credentials Later

If you need to update your credentials:

### Update in Heroku:
1. Go to Settings → Config Vars
2. Click the **pencil icon** ✏️ next to the variable
3. Enter new value
4. Click **"Save"**
5. Heroku will automatically restart your app

### Regenerate Airtable API Key:
1. Go to https://airtable.com/account
2. Find your current key
3. Click **"Regenerate"** or **"Delete"** and create new
4. **Immediately update** in Heroku Config Vars
5. Old key will stop working

---

## ❓ Troubleshooting

### Error: "Invalid Airtable API key"
- **Cause**: API key is wrong or expired
- **Fix**: Copy key again from Airtable account page
- **Update**: Paste into Heroku Config Vars

### Error: "Base not found"
- **Cause**: Base ID is wrong
- **Fix**: Get Base ID from Airtable API docs
- **Update**: Paste into Heroku Config Vars

### Error: "Table not found"
- **Cause**: Missing "Jobs" or "MachinePriorities" tables
- **Fix**: Create tables in Airtable with exact names
- **Names are case-sensitive**: "Jobs" not "jobs"

### Credentials are set but still getting errors
1. **Restart Heroku app**:
   - Dashboard: More → Restart all dynos
   - CLI: `heroku restart --app YOUR-APP-NAME`
2. **Check Heroku logs**:
   - Dashboard: More → View logs
   - CLI: `heroku logs --tail --app YOUR-APP-NAME`
3. **Verify table structure** in Airtable matches requirements

---

## 📝 Example: Complete Setup

Here's what a complete setup looks like:

### Your Airtable:
- **Account**: user@example.com
- **API Key**: `keyABCDEF1234567890`
- **Base Name**: "Manufacturing Schedule"
- **Base ID**: `appXYZ1234567890AB`
- **Tables**: "Jobs" and "MachinePriorities"

### Your Heroku Config Vars:
```
AIRTABLE_API_KEY=keyABCDEF1234567890
AIRTABLE_BASE_ID=appXYZ1234567890AB
NODE_ENV=production
ALLOWED_ORIGINS=*
```

### Test URL:
```
https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs
```

### Expected Response:
```json
{
  "jobs": [],
  "count": 0
}
```

---

## 🎯 Quick Start Commands

After setting credentials, run these tests:

```bash
# 1. Check credentials are set
heroku config --app manufacturing-schedule-7575b6f1cdb3

# 2. Restart app to load new credentials
heroku restart --app manufacturing-schedule-7575b6f1cdb3

# 3. Test health endpoint
curl https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/health

# 4. Test jobs endpoint (should connect to Airtable)
curl https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api/jobs

# 5. View logs for any errors
heroku logs --tail --app manufacturing-schedule-7575b6f1cdb3
```

---

## 📞 Need Help?

If you're stuck:

1. **Double-check** both credentials are copied correctly
2. **Verify** table names are exactly "Jobs" and "MachinePriorities"
3. **Restart** the Heroku app after changing Config Vars
4. **Check logs** for specific error messages
5. **Test** the Airtable API directly using their API docs

---

**Last Updated**: January 2025
**Status**: Ready for Production ✅
