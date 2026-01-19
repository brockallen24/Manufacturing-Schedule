# Simple Deployment Guide

## For Your Local Machine Only

After you've cloned the repository, follow these simple steps:

---

## Step 1: Open Terminal/Command Prompt

Navigate to the project folder:

```bash
cd Manufacturing-Schedule
git checkout claude/check-hosting-connections-Umr96
```

---

## Step 2: Run These Commands One by One

Copy and paste each command, pressing Enter after each:

### Login to Heroku
```bash
heroku login
```
*(A browser will open - click "Log in")*

---

### Create Your App
```bash
heroku create manufacturing-schedule-yourname
```
*(Replace "yourname" with something unique, or just run `heroku create` to auto-generate)*

---

### Set Airtable Credentials

**IMPORTANT:** Use your actual credentials from `backend/.env` file

```bash
heroku config:set AIRTABLE_API_KEY=your_actual_api_key_here
```

```bash
heroku config:set AIRTABLE_BASE_ID=your_actual_base_id_here
```

```bash
heroku config:set NODE_ENV=production
```

**Note:** Your actual credentials are stored locally in the `backend/.env` file. Use those values in the commands above.

---

### Deploy to Heroku
```bash
git push heroku claude/check-hosting-connections-Umr96:main
```
*(This takes 2-3 minutes)*

---

### Open Your App
```bash
heroku open
```

---

## That's It! 🎉

Your app should now be live!

---

## If Something Goes Wrong

View logs to see what happened:
```bash
heroku logs --tail
```

Check app status:
```bash
heroku ps
```

Restart app:
```bash
heroku restart
```

---

## All Commands in Order

**Note:** Replace the placeholder values with your actual credentials from `backend/.env`

```bash
# Login
heroku login

# Create app (choose a unique name)
heroku create your-app-name-here

# Set credentials (replace with your actual values from backend/.env!)
heroku config:set AIRTABLE_API_KEY=your_actual_api_key_here
heroku config:set AIRTABLE_BASE_ID=your_actual_base_id_here
heroku config:set NODE_ENV=production

# Verify
heroku config

# Deploy
git push heroku claude/check-hosting-connections-Umr96:main

# Open
heroku open
```

---

## Need Help?

- **App crashed?** Run `heroku logs --tail` to see errors
- **Name taken?** Try a different app name or run `heroku create` without a name
- **Deploy failed?** Check the error message and make sure you're in the correct directory

---

## After Successful Deployment

1. Visit your app URL (shown after `heroku create`)
2. Test adding a job
3. Test drag-and-drop functionality
4. Check that all 22 machines are visible

**Done! Your manufacturing schedule is now live on Heroku!** 🚀
