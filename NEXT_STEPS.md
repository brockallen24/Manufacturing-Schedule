# 🚀 Your Manufacturing Schedule App - Ready to Deploy!

## ✅ What's Been Done

Your repository has been completely organized and is ready for deployment! Here's what's set up:

### 1. Code Organization
- ✅ **Frontend**: Complete drag-and-drop interface in `frontend/` folder
  - HTML, CSS, and JavaScript files
  - Responsive design
  - Modal forms for adding jobs and setups
  - Print-friendly styling

- ✅ **Backend**: Express.js API in `backend/` folder
  - RESTful API endpoints for jobs and priorities
  - Airtable integration configured
  - CORS and security middleware
  - Rate limiting protection

- ✅ **Deployment Branch**: Special `claude/heroku-backend-md53Z` branch
  - Backend files at root level for easy Heroku deployment
  - Ready to deploy immediately

### 2. GitHub Status
- ✅ All code pushed to GitHub
- ✅ Branch: `claude/deploy-app-setup-md53Z` (full stack)
- ✅ Branch: `claude/heroku-backend-md53Z` (Heroku-ready backend)

### 3. Documentation
- ✅ `SETUP.md` - Complete step-by-step deployment guide
- ✅ `DEPLOY_TO_HEROKU.md` - Detailed Heroku deployment instructions
- ✅ `DEPLOYMENT_GUIDE.md` - Technical API documentation
- ✅ `README.md` - Project overview

---

## 📋 Your Next Steps (30-45 minutes total)

### Step 1: Set Up Airtable (10 minutes)

1. **Go to Airtable**: https://airtable.com/
2. **Create a new base** called "Manufacturing Schedule"
3. **Create two tables**:

   **Table 1: Jobs**
   - Add fields as specified in `SETUP.md` (Step 1.2)
   - Key fields: id, type, jobName, workOrder, numParts, machine, etc.

   **Table 2: MachinePriorities**
   - Add fields: machine, priority
   - Add 22 machine records (22, 55, 90-1, 90-2, etc.)

4. **Get your credentials**:
   - API Key: https://airtable.com/account
   - Base ID: https://airtable.com/api (click your base)
   - **Save these - you'll need them for Heroku!**

### Step 2: Deploy Backend to Heroku (15 minutes)

**Option A: Using Heroku Dashboard (Easiest)**

1. Go to: https://dashboard.heroku.com/
2. Create new app: `manufacturing-schedule-api` (or your preferred name)
3. Go to Settings → Config Vars → Add:
   ```
   AIRTABLE_API_KEY = (your API key from Step 1)
   AIRTABLE_BASE_ID = (your Base ID from Step 1)
   NODE_ENV = production
   ALLOWED_ORIGINS = *
   ```
4. Go to Deploy tab → Connect to GitHub
5. Select repository: `Manufacturing-Schedule`
6. Select branch: `claude/heroku-backend-md53Z`
7. Click "Deploy Branch"
8. Wait for build to complete (2-3 minutes)
9. Click "View" to test - you should see API information
10. **Save your Heroku URL**: `https://your-app-name.herokuapp.com`

**Option B: Using Heroku CLI**

See `DEPLOY_TO_HEROKU.md` for detailed CLI instructions.

### Step 3: Deploy Frontend (15 minutes)

**Recommended: Netlify (Easiest)**

1. Go to: https://app.netlify.com/
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub → Select `Manufacturing-Schedule` repo
5. Configure:
   - Branch: `claude/deploy-app-setup-md53Z`
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click "Deploy site"
7. Wait for deployment (1-2 minutes)
8. **Save your Netlify URL**: `https://your-site.netlify.app`

**Alternative: GitHub Pages or Vercel**

See `SETUP.md` Step 3 for other hosting options.

### Step 4: Connect Frontend to Backend (5 minutes)

1. **Edit the frontend API configuration**:
   - File: `frontend/js/main.js`
   - Line 3: Update with your Heroku URL
   ```javascript
   const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';
   ```

2. **Commit and push**:
   ```bash
   git add frontend/js/main.js
   git commit -m "Update API URL to use Heroku backend"
   git push origin claude/deploy-app-setup-md53Z
   ```

3. **Update CORS in Heroku**:
   - Go to Heroku → Settings → Config Vars
   - Update `ALLOWED_ORIGINS` to: `https://your-site.netlify.app`

4. **Redeploy frontend** (Netlify will auto-deploy on git push)

### Step 5: Test Everything! (5 minutes)

1. **Open your frontend URL**: `https://your-site.netlify.app`
2. **Try these actions**:
   - ✅ Click "Add New Job" - fill out and save
   - ✅ Check Airtable - job should appear in Jobs table
   - ✅ Refresh page - job should still be there
   - ✅ Drag job to different machine
   - ✅ Double-click job to edit
   - ✅ Click "Add Setup/Maintenance" - add one
   - ✅ Change a machine priority
   - ✅ Delete a job
   - ✅ Test print view

3. **If something doesn't work**:
   - Open browser console (F12) → Check for errors
   - Check Heroku logs: Dashboard → More → View logs
   - See "Troubleshooting" section in `SETUP.md`

---

## 📝 Important Information to Save

Keep these URLs and credentials in a safe place:

```
GitHub Repository:
https://github.com/brockallen24/Manufacturing-Schedule

Deployment Branches:
- claude/deploy-app-setup-md53Z (full stack)
- claude/heroku-backend-md53Z (backend only)

Airtable:
- Base Name: Manufacturing Schedule
- API Key: key... (keep secret!)
- Base ID: app... (keep secret!)
- Base URL: https://airtable.com/...

Heroku:
- App Name: manufacturing-schedule-api
- App URL: https://manufacturing-schedule-api.herokuapp.com
- Dashboard: https://dashboard.heroku.com/apps/manufacturing-schedule-api

Frontend:
- Platform: Netlify (or your choice)
- URL: https://your-site.netlify.app
```

---

## 🎯 Quick Reference Commands

### If you need to make changes:

```bash
# Switch to main branch
git checkout claude/deploy-app-setup-md53Z

# Make your changes...

# Commit and push
git add .
git commit -m "Your change description"
git push origin claude/deploy-app-setup-md53Z

# Netlify will auto-deploy frontend
# For backend, redeploy via Heroku Dashboard or:
git subtree push --prefix backend heroku main
```

### Check Heroku logs:

```bash
heroku logs --tail -a manufacturing-schedule-api
```

### Update environment variables:

```bash
heroku config:set KEY=value -a manufacturing-schedule-api
```

---

## 🆘 Need Help?

1. **Check the documentation**:
   - `SETUP.md` - Complete deployment guide
   - `DEPLOY_TO_HEROKU.md` - Heroku-specific help
   - `DEPLOYMENT_GUIDE.md` - API documentation

2. **Common issues**:
   - **Frontend can't connect**: Check CORS settings in Heroku Config Vars
   - **Airtable errors**: Verify API key, Base ID, and table names
   - **Heroku crashes**: Check logs and environment variables

3. **Test endpoints directly**:
   - Health: `https://your-app.herokuapp.com/health`
   - Jobs: `https://your-app.herokuapp.com/api/jobs`
   - Priorities: `https://your-app.herokuapp.com/api/priorities`

---

## 🎉 You're All Set!

Your manufacturing schedule application is ready to go live! Follow the steps above and you'll have a fully functional, cloud-based scheduling system in less than an hour.

**Key features you'll have**:
- ✅ Drag-and-drop job scheduling
- ✅ 22 machine columns
- ✅ Job and setup/maintenance tracking
- ✅ Progress tracking with visual indicators
- ✅ Due date monitoring
- ✅ Machine priority management
- ✅ Print-friendly view
- ✅ Cloud-based - access from anywhere
- ✅ Multi-user capable (through Airtable)
- ✅ Automatic data persistence

**What's Next After Deployment**:
- Share the frontend URL with your team
- Add your first real jobs
- Customize machine priorities
- Monitor usage in Heroku and Airtable dashboards
- Consider upgrading to paid tiers for production use

---

## 📱 Future Enhancements (Optional)

After your app is running, you could add:
- User authentication
- Email notifications for due dates
- Advanced filtering and search
- Mobile app version
- Automated reports
- Integration with other systems
- Custom branding/theming

---

**Happy Deploying! 🚀**

If you get stuck, refer to the detailed guides in this repository.
