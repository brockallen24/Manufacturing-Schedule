# Manufacturing Schedule - Deployment Guide

## 📦 Complete Deployment Package for GitHub + Airtable + Heroku

This guide will help you deploy the Manufacturing Schedule application using:
- **GitHub** for code repository
- **Airtable** for shared database
- **Heroku** for backend server hosting

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Airtable Configuration](#airtable-configuration)
4. [Backend Development Requirements](#backend-development-requirements)
5. [Heroku Deployment](#heroku-deployment)
6. [Frontend Integration](#frontend-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │ Heroku Server│ ◄─────► │   Airtable   │
│  (Frontend) │         │  (Backend)   │         │  (Database)  │
│             │         │              │         │              │
│ HTML/CSS/JS │         │  Node.js     │         │  Cloud DB    │
│             │         │  Express API │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                         │
      │                        │                         │
   GitHub                  GitHub                  Airtable API
   Pages/CDN              (backend code)           (API Keys)
```

**Data Flow:**
1. User interacts with frontend (HTML/CSS/JS)
2. Frontend makes API calls to Heroku backend
3. Backend authenticates and queries Airtable
4. Airtable returns data to backend
5. Backend sends data to frontend
6. Frontend displays data to user

---

## 📂 GitHub Repository Setup

### Repository Structure

Create this folder structure in your GitHub repository:

```
manufacturing-schedule/
├── frontend/                 # Static files (current application)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── README.md
│
├── backend/                  # Server code (TO BE CREATED)
│   ├── server.js            # Main Express server
│   ├── routes/
│   │   ├── jobs.js          # Job endpoints
│   │   └── priorities.js    # Priority endpoints
│   ├── config/
│   │   └── airtable.js      # Airtable configuration
│   ├── package.json         # Node.js dependencies
│   ├── .env.example         # Environment variable template
│   └── Procfile             # Heroku process file
│
├── .gitignore               # Git ignore file
├── DEPLOYMENT_GUIDE.md      # This file
└── README.md                # Main project README
```

### Step 1: Create GitHub Repository

```bash
# Create new repository on GitHub.com
# Repository name: manufacturing-schedule
# Description: Manufacturing Schedule with drag-and-drop functionality

# Clone to your local machine
git clone https://github.com/YOUR_USERNAME/manufacturing-schedule.git
cd manufacturing-schedule

# Create folder structure
mkdir -p frontend/css frontend/js
mkdir -p backend/routes backend/config

# Copy your current files to frontend/
# (index.html, css/style.css, js/main.js)
```

### Step 2: Create .gitignore

```gitignore
# Node modules
node_modules/
npm-debug.log
yarn-error.log

# Environment variables
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Build files
dist/
build/

# Heroku
.heroku/
```

### Step 3: Initial Commit

```bash
git add .
git commit -m "Initial commit: Frontend application"
git push origin main
```

---

## 🗄️ Airtable Configuration

### Step 1: Create Airtable Base

1. Go to [airtable.com](https://airtable.com)
2. Create a new base: **"Manufacturing Schedule"**
3. Get your API key from [airtable.com/account](https://airtable.com/account)
4. Get your Base ID from the API documentation

### Step 2: Create Tables

#### Table 1: Jobs

| Field Name | Type | Description |
|------------|------|-------------|
| id | Single line text | Primary key (auto-generated UUID) |
| type | Single select | "job" or "setup" |
| jobName | Single line text | Job name |
| workOrder | Single line text | Work order number |
| numParts | Number | Number of parts |
| numCavities | Number | Number of cavities |
| cycleTime | Number | Cycle time in seconds |
| material | Single line text | Material type |
| totalMaterial | Number | Total material in lbs |
| totalHours | Number | Total hours (calculated) |
| dueDate | Date | Due date |
| percentComplete | Number | Completion percentage (0-100) |
| machine | Single line text | Machine name |
| toolNumber | Single line text | Tool number (for setup) |
| toolReady | Single select | "yes" or "no" (for setup) |
| setupHours | Number | Setup hours |
| setupNotes | Long text | Setup notes |
| createdAt | Created time | Auto-generated |
| updatedAt | Last modified time | Auto-generated |

#### Table 2: MachinePriorities

| Field Name | Type | Description |
|------------|------|-------------|
| machine | Single line text | Machine name (primary key) |
| priority | Single select | "low", "medium", "high", "critical" |
| updatedAt | Last modified time | Auto-generated |

### Step 3: Airtable API Endpoints

Your backend will use these Airtable REST API endpoints:

```javascript
// Base URL
https://api.airtable.com/v0/YOUR_BASE_ID

// Endpoints
GET    /Jobs              // List all jobs
GET    /Jobs/{recordId}   // Get single job
POST   /Jobs              // Create new job
PATCH  /Jobs/{recordId}   // Update job
DELETE /Jobs/{recordId}   // Delete job

GET    /MachinePriorities              // List priorities
PATCH  /MachinePriorities/{recordId}   // Update priority
```

---

## 🔧 Backend Development Requirements

### Technology Stack

- **Runtime**: Node.js 18.x or higher
- **Framework**: Express.js 4.x
- **Database Client**: Airtable.js
- **Security**: CORS, helmet, express-rate-limit
- **Environment**: dotenv

### Required npm Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "airtable": "^0.12.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### API Endpoints to Implement

#### 1. Jobs Endpoints

```javascript
// GET /api/jobs
// Returns: Array of all jobs
// Response: { jobs: [...], count: 25 }

// GET /api/jobs/:id
// Returns: Single job by ID
// Response: { job: {...} }

// POST /api/jobs
// Body: { jobName, workOrder, numParts, ... }
// Returns: Created job with ID
// Response: { job: {...}, id: "recXXX" }

// PUT /api/jobs/:id
// Body: { jobName, workOrder, ... }
// Returns: Updated job
// Response: { job: {...} }

// DELETE /api/jobs/:id
// Returns: Success message
// Response: { message: "Job deleted", id: "recXXX" }
```

#### 2. Priorities Endpoints

```javascript
// GET /api/priorities
// Returns: Machine priorities object
// Response: { "22": "low", "55": "medium", ... }

// PUT /api/priorities/:machine
// Body: { priority: "high" }
// Returns: Updated priority
// Response: { machine: "22", priority: "high" }
```

### Backend Code Structure (Example)

**backend/server.js:**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const jobsRouter = require('./routes/jobs');
const prioritiesRouter = require('./routes/priorities');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/priorities', prioritiesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

**backend/config/airtable.js:**
```javascript
const Airtable = require('airtable');

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

module.exports = {
  jobsTable: base('Jobs'),
  prioritiesTable: base('MachinePriorities')
};
```

**backend/routes/jobs.js:**
```javascript
const express = require('express');
const router = express.Router();
const { jobsTable } = require('../config/airtable');

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const records = await jobsTable.select().all();
    const jobs = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    res.json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new job
router.post('/', async (req, res) => {
  try {
    const record = await jobsTable.create([
      { fields: req.body }
    ]);
    res.status(201).json({ 
      job: { id: record[0].id, ...record[0].fields },
      id: record[0].id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update job
router.put('/:id', async (req, res) => {
  try {
    const record = await jobsTable.update([
      { id: req.params.id, fields: req.body }
    ]);
    res.json({ 
      job: { id: record[0].id, ...record[0].fields }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    await jobsTable.destroy([req.params.id]);
    res.json({ message: 'Job deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Environment Variables (.env)

```env
# Airtable Configuration
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Settings
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Heroku Deployment

### Prerequisites

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create Heroku account: https://signup.heroku.com/

### Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create new app
heroku create manufacturing-schedule-api

# Or with specific name
heroku create your-app-name
```

### Step 2: Configure Heroku

```bash
# Set environment variables
heroku config:set AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
heroku config:set AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
heroku config:set NODE_ENV=production

# Verify config
heroku config
```

### Step 3: Create Procfile

**backend/Procfile:**
```
web: node server.js
```

### Step 4: Create package.json

**backend/package.json:**
```json
{
  "name": "manufacturing-schedule-backend",
  "version": "1.0.0",
  "description": "Backend API for Manufacturing Schedule",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "airtable": "^0.12.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Step 5: Deploy to Heroku

```bash
# Navigate to backend folder
cd backend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial backend commit"

# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Check logs
heroku logs --tail

# Open app
heroku open
```

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://your-app-name.herokuapp.com/health

# Should return:
# {"status":"ok","timestamp":"2024-12-12T..."}
```

---

## 🔌 Frontend Integration

### Update Frontend to Use Backend API

Modify **frontend/js/main.js** to replace localStorage with API calls:

```javascript
// Add API configuration at top of file
const API_BASE_URL = 'https://your-app-name.herokuapp.com/api';

// Replace saveToLocalStorage() with API calls
async function saveJob(jobData) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (!response.ok) throw new Error('Failed to save job');
        
        const data = await response.json();
        return data.job;
    } catch (error) {
        console.error('Error saving job:', error);
        alert('Failed to save job. Please try again.');
    }
}

// Replace loadFromLocalStorage() with API calls
async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        
        if (!response.ok) throw new Error('Failed to load jobs');
        
        const data = await response.json();
        jobs = data.jobs;
        renderScheduleBoard();
    } catch (error) {
        console.error('Error loading jobs:', error);
        alert('Failed to load jobs. Please refresh the page.');
    }
}

// Update job
async function updateJob(jobId, jobData) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (!response.ok) throw new Error('Failed to update job');
        
        return await response.json();
    } catch (error) {
        console.error('Error updating job:', error);
        alert('Failed to update job. Please try again.');
    }
}

// Delete job
async function deleteJob(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete job');
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
    }
}
```

### Deploy Frontend

**Option A: GitHub Pages**
```bash
# In repository root
git checkout -b gh-pages
git push origin gh-pages

# Enable GitHub Pages in repository settings
# Source: gh-pages branch
# Your site will be at: https://username.github.io/manufacturing-schedule/
```

**Option B: Netlify**
1. Connect GitHub repository to Netlify
2. Build command: (leave empty for static site)
3. Publish directory: `frontend`
4. Deploy

**Option C: Heroku (Static)**
```bash
# Add static.json to frontend/
{
  "root": ".",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}

# Deploy frontend to separate Heroku app
heroku create manufacturing-schedule-frontend
git subtree push --prefix frontend heroku main
```

---

## 🧪 Testing

### Test Backend Locally

```bash
cd backend
npm install
npm run dev

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/jobs
```

### Test Integration

1. Start backend locally
2. Update frontend API_BASE_URL to `http://localhost:3000/api`
3. Open frontend in browser
4. Test CRUD operations
5. Verify data in Airtable

---

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure CORS is enabled on backend
- Add frontend URL to ALLOWED_ORIGINS

**2. Airtable API Errors**
- Verify API key and Base ID
- Check field names match exactly
- Ensure table names are correct

**3. Heroku Deployment Fails**
- Check Heroku logs: `heroku logs --tail`
- Verify Procfile is correct
- Ensure all dependencies are in package.json

**4. Frontend Can't Connect to Backend**
- Verify API_BASE_URL is correct
- Check network tab in browser DevTools
- Ensure CORS headers are present

---

## 📝 Next Steps

1. ✅ **Set up GitHub repository** with folder structure
2. ✅ **Create Airtable base** with Jobs and MachinePriorities tables
3. ⚠️ **Develop backend code** (routes/jobs.js, routes/priorities.js, server.js)
4. ⚠️ **Test backend locally** before deploying
5. ⚠️ **Deploy to Heroku** and test endpoints
6. ⚠️ **Update frontend** to use API instead of localStorage
7. ⚠️ **Deploy frontend** to GitHub Pages or Netlify
8. ✅ **Test complete integration** with real data

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [GitHub Pages Guide](https://pages.github.com/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ⚠️ Important Notes

1. **Security**: Never commit .env file or API keys to Git
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Error Handling**: Add comprehensive error handling in production
4. **Logging**: Use proper logging (morgan, winston) for debugging
5. **Backup**: Regularly backup Airtable data
6. **Monitoring**: Set up monitoring for backend uptime

---

**Created by:** Manufacturing Schedule Deployment Team  
**Last Updated:** December 2024  
**Version:** 1.0.0
