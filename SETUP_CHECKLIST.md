# Quick Setup Guide - Manufacturing Schedule Deployment

This is a **step-by-step checklist** to help you deploy the Manufacturing Schedule application.

## ✅ Setup Checklist

### Phase 1: Accounts & Setup (30 minutes)

- [ ] **Create GitHub account** (if not already have one)
  - Visit: https://github.com/signup
  - Username: ________________
  
- [ ] **Create Airtable account**
  - Visit: https://airtable.com/signup
  - Get API Key: https://airtable.com/account
  - API Key: ________________ (keep secret!)
  
- [ ] **Create Heroku account**
  - Visit: https://signup.heroku.com/
  - Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

### Phase 2: GitHub Repository (15 minutes)

- [ ] **Create new repository**
  - Name: `manufacturing-schedule`
  - Visibility: Private (recommended) or Public
  - Initialize with README: Yes
  - Repository URL: ________________

- [ ] **Clone repository locally**
  ```bash
  git clone https://github.com/YOUR_USERNAME/manufacturing-schedule.git
  cd manufacturing-schedule
  ```

- [ ] **Create folder structure**
  ```bash
  mkdir -p frontend/css frontend/js
  mkdir -p backend/routes backend/config
  ```

- [ ] **Copy files to repository**
  - Copy `index.html` → `frontend/index.html`
  - Copy `css/style.css` → `frontend/css/style.css`
  - Copy `js/main.js` → `frontend/js/main.js`
  - Copy `backend-server.js` → `backend/server.js`
  - Copy `backend-routes-jobs.js` → `backend/routes/jobs.js`
  - Copy `backend-routes-priorities.js` → `backend/routes/priorities.js`
  - Copy `backend-config-airtable.js` → `backend/config/airtable.js`
  - Copy `backend-package.json` → `backend/package.json`
  - Copy `backend-.env.example` → `backend/.env.example`
  - Copy `backend-Procfile` → `backend/Procfile`
  - Copy `.gitignore` to root
  - Copy `DEPLOYMENT_GUIDE.md` to root
  - Copy `PROJECT_README.md` → `README.md`

- [ ] **Commit and push**
  ```bash
  git add .
  git commit -m "Initial commit: Full stack application"
  git push origin main
  ```

### Phase 3: Airtable Setup (20 minutes)

- [ ] **Create new base**
  - Name: "Manufacturing Schedule"
  - Base ID: ________________

- [ ] **Create Jobs table** with these fields:
  - [ ] id (Single line text)
  - [ ] type (Single select: "job", "setup")
  - [ ] jobName (Single line text)
  - [ ] workOrder (Single line text)
  - [ ] numParts (Number)
  - [ ] numCavities (Number)
  - [ ] cycleTime (Number)
  - [ ] material (Single line text)
  - [ ] totalMaterial (Number)
  - [ ] totalHours (Number)
  - [ ] dueDate (Date)
  - [ ] percentComplete (Number)
  - [ ] machine (Single line text)
  - [ ] toolNumber (Single line text)
  - [ ] toolReady (Single select: "yes", "no")
  - [ ] setupHours (Number)
  - [ ] setupNotes (Long text)
  - [ ] createdAt (Created time)
  - [ ] updatedAt (Last modified time)

- [ ] **Create MachinePriorities table** with these fields:
  - [ ] machine (Single line text)
  - [ ] priority (Single select: "low", "medium", "high", "critical")
  - [ ] updatedAt (Last modified time)

- [ ] **Add initial priority records** for all 22 machines:
  - 22, 55, 90-1, 90-2, 90-3, Sumi1, 170-1, 170-2, Sumi2
  - 260-1, 260-2, 260-3, 260-4, 500-1, 500-2, 550
  - 770, 950, 1100-1, 1100-2, 1200-1, 1200-2

### Phase 4: Backend Development (1-2 hours)

**Note:** This requires coding knowledge. If you need help, hire a developer or contact support.

- [ ] **Install Node.js**
  - Download: https://nodejs.org/
  - Version: 18.x or higher
  - Verify: `node --version` and `npm --version`

- [ ] **Set up backend locally**
  ```bash
  cd backend
  npm install
  ```

- [ ] **Configure environment**
  ```bash
  cp .env.example .env
  # Edit .env with your credentials
  ```

- [ ] **Update .env file**
  ```
  AIRTABLE_API_KEY=your_actual_api_key
  AIRTABLE_BASE_ID=your_actual_base_id
  PORT=3000
  NODE_ENV=development
  ALLOWED_ORIGINS=http://localhost:8000
  ```

- [ ] **Test backend locally**
  ```bash
  npm run dev
  ```

- [ ] **Test endpoints**
  - Health: http://localhost:3000/health
  - Jobs: http://localhost:3000/api/jobs
  - Should see empty arrays (no data yet)

### Phase 5: Heroku Deployment (30 minutes)

- [ ] **Login to Heroku**
  ```bash
  heroku login
  ```

- [ ] **Create Heroku app**
  ```bash
  heroku create manufacturing-schedule-api
  ```
  - App URL: ________________

- [ ] **Set environment variables on Heroku**
  ```bash
  heroku config:set AIRTABLE_API_KEY=your_key
  heroku config:set AIRTABLE_BASE_ID=your_base_id
  heroku config:set NODE_ENV=production
  ```

- [ ] **Verify config**
  ```bash
  heroku config
  ```

- [ ] **Deploy backend to Heroku**
  ```bash
  cd backend
  git init
  git add .
  git commit -m "Backend ready for deployment"
  heroku git:remote -a manufacturing-schedule-api
  git push heroku main
  ```

- [ ] **Check logs**
  ```bash
  heroku logs --tail
  ```

- [ ] **Test deployed backend**
  - Health: https://your-app-name.herokuapp.com/health
  - Jobs: https://your-app-name.herokuapp.com/api/jobs

### Phase 6: Frontend Integration (30 minutes)

- [ ] **Update frontend API configuration**
  
  Edit `frontend/js/main.js`, add at the top:
  ```javascript
  const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';
  ```

- [ ] **Replace localStorage functions** with API calls
  - See DEPLOYMENT_GUIDE.md for code examples
  - This step requires JavaScript knowledge

- [ ] **Test frontend locally**
  ```bash
  cd frontend
  python -m http.server 8000
  # Open http://localhost:8000
  ```

- [ ] **Verify integration**
  - Add a test job
  - Check Airtable to see data
  - Refresh page - data should persist
  - Test edit, delete, reorder

### Phase 7: Frontend Deployment (20 minutes)

Choose one option:

**Option A: GitHub Pages**
- [ ] Go to repository Settings → Pages
- [ ] Source: Deploy from branch
- [ ] Branch: main, folder: /frontend
- [ ] Save and wait for deployment
- [ ] Site URL: ________________

**Option B: Netlify**
- [ ] Go to https://netlify.com
- [ ] New site from Git
- [ ] Connect GitHub repository
- [ ] Build settings:
  - Base directory: `frontend`
  - Build command: (leave empty)
  - Publish directory: `.`
- [ ] Deploy
- [ ] Site URL: ________________

### Phase 8: Final Configuration (10 minutes)

- [ ] **Update CORS on backend**
  ```bash
  heroku config:set ALLOWED_ORIGINS=https://your-frontend-url.com
  ```

- [ ] **Test complete integration**
  - [ ] Visit your frontend URL
  - [ ] Add jobs
  - [ ] Edit jobs
  - [ ] Delete jobs
  - [ ] Drag and reorder
  - [ ] Test on multiple devices
  - [ ] Print to PDF

- [ ] **Update README with URLs**
  - Frontend URL: ________________
  - Backend URL: ________________
  - Airtable Base: ________________

## 🎉 Deployment Complete!

Your Manufacturing Schedule is now live and accessible from anywhere!

## 📝 Important Notes

- **Keep API keys secret**: Never commit .env file to Git
- **Backup data**: Regularly export Airtable data
- **Monitor usage**: Check Heroku and Airtable usage limits
- **Update CORS**: Add all frontend domains to ALLOWED_ORIGINS

## 🐛 Troubleshooting

**Backend won't start?**
- Check Heroku logs: `heroku logs --tail`
- Verify environment variables: `heroku config`
- Check Airtable credentials

**Frontend can't connect?**
- Check browser console for errors
- Verify API_BASE_URL is correct
- Check CORS settings on backend
- Verify Heroku app is running

**Data not saving?**
- Check Airtable table names match exactly
- Verify field names in Airtable match code
- Check API permissions

## 📞 Need Help?

- Review DEPLOYMENT_GUIDE.md for detailed instructions
- Check Heroku logs for errors
- Test API endpoints with curl or Postman
- Verify Airtable permissions and field types

---

**Estimated Total Time:** 3-4 hours  
**Difficulty:** Intermediate (requires basic coding knowledge)  
**Cost:** Free (within free tier limits)
