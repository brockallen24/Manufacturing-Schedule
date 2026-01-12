# Manufacturing Schedule - Full Stack Application

A comprehensive manufacturing scheduling application with drag-and-drop functionality, real-time data synchronization, and cloud-based storage.

## 🏗️ Architecture

- **Frontend**: Static HTML/CSS/JavaScript
- **Backend**: Node.js + Express API
- **Database**: Airtable (Cloud-based)
- **Hosting**: 
  - Frontend: GitHub Pages / Netlify
  - Backend: Heroku

## 📦 Repository Structure

```
manufacturing-schedule/
├── frontend/                 # Static website files
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
│
├── backend/                  # Express API server
│   ├── server.js
│   ├── config/
│   │   └── airtable.js
│   ├── routes/
│   │   ├── jobs.js
│   │   └── priorities.js
│   ├── package.json
│   ├── Procfile
│   └── .env.example
│
├── .gitignore
├── DEPLOYMENT_GUIDE.md      # Detailed deployment instructions
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Airtable account
- Heroku account (for backend deployment)
- GitHub account (for code repository)

### Local Development

**1. Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/manufacturing-schedule.git
cd manufacturing-schedule
```

**2. Set up backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Airtable credentials
npm run dev
```

**3. Open frontend:**
```bash
cd frontend
# Open index.html in browser or use a local server:
python -m http.server 8000
# Visit http://localhost:8000
```

## 🗄️ Airtable Setup

### Required Tables

**Table 1: Jobs**
- id (Primary key)
- type (Single select: "job" or "setup")
- jobName
- workOrder
- numParts
- numCavities
- cycleTime
- material
- totalMaterial
- totalHours
- dueDate
- percentComplete
- machine
- toolNumber (for setup)
- toolReady (for setup)
- setupHours (for setup)
- setupNotes (for setup)

**Table 2: MachinePriorities**
- machine (Primary key)
- priority (Single select: "low", "medium", "high", "critical")

### Get Credentials

1. Go to [airtable.com/account](https://airtable.com/account)
2. Copy your API key
3. Go to [airtable.com/api](https://airtable.com/api)
4. Select your base
5. Copy the Base ID from the URL or documentation

## 🔌 API Endpoints

### Jobs

- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id` - Partial update
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/machine/:machineName` - Get jobs by machine

### Priorities

- `GET /api/priorities` - List all priorities
- `GET /api/priorities/:machine` - Get machine priority
- `PUT /api/priorities/:machine` - Update machine priority
- `POST /api/priorities/batch` - Batch update priorities

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions covering:

- GitHub repository setup
- Airtable configuration
- Backend development
- Heroku deployment
- Frontend deployment
- Testing and troubleshooting

### Quick Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set AIRTABLE_API_KEY=your_key
heroku config:set AIRTABLE_BASE_ID=your_base_id

# Deploy
cd backend
git push heroku main

# View logs
heroku logs --tail
```

## 🎨 Features

- ✅ **22 Production Machines** - Manage schedule across all machines
- ✅ **Drag & Drop** - Intuitive job reordering
- ✅ **Setup/Maintenance Tracking** - Color-coded tool readiness
- ✅ **Progress Tracking** - Visual progress bars (0-100%)
- ✅ **Auto-calculations** - Total hours and days to complete
- ✅ **Material Breakdown** - Track materials by type per machine
- ✅ **Print/PDF Export** - Professional color PDF output
- ✅ **Real-time Sync** - All users see same data (with backend)
- ✅ **Cloud Storage** - Data stored in Airtable cloud

## 🛠️ Technology Stack

**Frontend:**
- HTML5
- CSS3 (Flexbox, Grid, Print Media Queries)
- JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts

**Backend:**
- Node.js 18.x
- Express.js 4.x
- Airtable.js
- Helmet (Security)
- CORS
- Morgan (Logging)
- Express Rate Limit

**Infrastructure:**
- GitHub (Version Control)
- Heroku (Backend Hosting)
- Airtable (Database)
- GitHub Pages / Netlify (Frontend Hosting)

## 📖 Documentation

- [Main README](README.md) - This file
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Frontend README](frontend/README.md) - Frontend-specific documentation

## 🔐 Security

- API keys stored in environment variables
- CORS protection enabled
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation on all endpoints
- No sensitive data in frontend code

## 🧪 Testing

```bash
# Test backend locally
cd backend
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Test jobs endpoint
curl http://localhost:3000/api/jobs

# Test with authentication
curl -H "Content-Type: application/json" \
     -d '{"jobName":"Test Job","machine":"22"}' \
     http://localhost:3000/api/jobs
```

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Airtable for database solution
- Heroku for hosting

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: your-email@example.com

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Airtable API Docs](https://airtable.com/developers/web/api/introduction)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [GitHub Pages Guide](https://pages.github.com/)

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Ready for Deployment ✅
