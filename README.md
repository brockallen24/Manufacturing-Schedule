# Manufacturing Schedule - Drag & Drop Application

A fully functional web-based manufacturing scheduling tool with drag-and-drop functionality for managing jobs across 22 production machines. **Now with multi-workstation data sharing via Airtable and Heroku!**

## 🚀 Quick Deployment (One Command!)

Deploy to Heroku with shared data across all workstations:

```bash
./deploy.sh
```

This script will:
1. Set up Airtable tables automatically
2. Create and configure your Heroku app
3. Deploy everything and give you a live URL

**Prerequisites:**
- [Node.js](https://nodejs.org/) v18+
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Git

## 🎯 Features

### ✅ Currently Completed

- **Multi-Workstation Data Sharing** - Real-time sync across all computers and browsers via Airtable
- **One-Click Cloud Deployment** - Deploy to Heroku with a single command
- **Auto-Refresh** - Data syncs every 30 seconds across all connected workstations
- **Offline Fallback** - Works locally if server is unavailable
- **22 Machine Columns** - Specific production machines with custom names
- **Drag & Drop Job Movement** - Intuitive job scheduling across machines
- **Setup/Maintenance Tracking** - Dedicated blocks for tool setup and maintenance with visual status indicators
- **Comprehensive Job Information** - 11 data points per job:
  1. Job Name
  2. Work Order #
  3. Number of Parts
  4. Number of Cavities
  5. Cycle Time (seconds)
  6. Material Type
  7. Total Material (lbs)
  8. Total Hours (Auto-calculated)
  9. Due Date
  10. **Days to Complete** (Auto-calculated based on position)
  11. **Percent Complete** (0-100% with visual progress bar)
- **Automatic Total Hours Calculation** - Calculated using: Parts ÷ (3600 ÷ Cycle Time × Cavities)
- **Days to Complete Calculation** - Shows cumulative days based on all jobs above + current job (Total Hours ÷ 24)
- **Visual Progress Tracking** - Interactive vertical progress bar on right side of each job/setup block
- **Material Breakdown by Type** - Each column shows total material grouped by material type
- **Flexible Job Ordering** - Drag jobs freely to reorder them within or between columns
- **Real-time Totals** - Hours and material sums automatically update per machine
- **Machine Priority System** - 4 priority levels (Low/Medium/High/Critical) with color coding
- **Full CRUD Operations** - Create, Edit, Delete jobs and setup items with modal forms
- **Visual Status Indicators** - Green blocks for ready tools, red blocks for tools not ready
- **Print/PDF Export** - One-click export to PDF for offline documentation and sharing
- **Local Storage Persistence** - All data automatically saved to browser
- **Modern Responsive UI** - Professional design with Font Awesome icons
- **Smooth Animations** - Enhanced user experience with transitions

## 🏭 Machine List

The application includes the following 22 machines:

1. 22
2. 55
3. 90-1
4. 90-2
5. 90-3
6. Sumi1
7. 170-1
8. 170-2
9. Sumi2
10. 260-1
11. 260-2
12. 260-3
13. 260-4
14. 500-1
15. 500-2
16. 550
17. 770
18. 950
19. 1100-1
20. 1100-2
21. 1200-1
22. 1200-2

## 📊 Job Information Fields

Each job block displays and captures:

- **Job Name** - Identifier for the manufacturing job
- **Work Order #** - Work order reference number
- **# Parts** - Quantity of parts to be produced
- **# Cavities** - Number of cavities in the mold/tool
- **Cycle Time** - Time per cycle in **seconds**
- **Material** - Material type or specification
- **Total Material** - Total material required in **pounds (lbs)**
- **Total Hours** - **Auto-calculated** based on parts, cycle time, and cavities
- **Due Date** - Target completion date for the job
- **Days to Complete** - **Auto-calculated** cumulative days until this job completes

### 🧮 Calculation Formulas

#### Total Hours Calculation

The application automatically calculates total hours using:

```
Total Hours = # Parts ÷ (Parts per Hour)

Where:
Parts per Hour = (3600 seconds ÷ Cycle Time in seconds) × # Cavities
```

**Example:**
- 1000 parts needed
- 30 second cycle time
- 2 cavities

Calculation:
- Parts per hour = (3600 ÷ 30) × 2 = 120 × 2 = 240 parts/hour
- Total Hours = 1000 ÷ 240 = **4.17 hours**

#### Days to Complete Calculation

The application calculates cumulative completion time:

```
Days to Complete = Cumulative Hours ÷ 24

Where:
Cumulative Hours = Sum of (All jobs above this one + This job's hours)
```

**Example:**
Machine column has 3 jobs in order:
1. Job A: 10 hours → Days to Complete = 10 ÷ 24 = **0.42 days**
2. Job B: 15 hours → Days to Complete = (10 + 15) ÷ 24 = **1.04 days**
3. Job C: 20 hours → Days to Complete = (10 + 15 + 20) ÷ 24 = **1.88 days**

**This shows:**
- Job A completes in 0.42 days
- Job B completes in 1.04 days (after Job A finishes)
- Job C completes in 1.88 days (after Jobs A and B finish)

**Important:** 
- Days to Complete includes both regular jobs AND setup/maintenance hours
- Days to Complete changes when you reorder items! The order determines the completion timeline.
- Setup/maintenance blocks are calculated the same way as regular jobs for timeline purposes

## 🚀 How to Use

### Getting Started
1. Open `index.html` in any modern web browser
2. The schedule board displays all 22 machines in columns

### Adding Jobs
1. Click the **"Add New Job"** button in the header
2. Fill in all required fields:
   - Job Name
   - Work Order #
   - Number of Parts
   - Number of Cavities
   - Cycle Time (in seconds)
   - Material Type
   - Total Material (lbs)
   - Due Date
3. **Total Hours auto-calculates** as you enter parts, cycle time, and cavities
4. Select the machine to assign the job to
5. Click **"Save Job"**

### Adding Setup/Maintenance Items
1. Click the **"Add Setup/Maintenance"** button in the header
2. Fill in all required fields:
   - **Tool Number** - Identifier for the tool being set up
   - **Tool Ready** - Select "Yes" (green) or "No" (red)
   - **Total Hours** - Estimated setup/maintenance time
   - **Notes** - Optional text field for additional details
3. Select the machine to assign the setup to
4. Click **"Save Setup/Maintenance"**

**Visual Indicators:**
- ✅ **Green Block** = Tool is ready (Tool Ready: Yes)
- ❌ **Red Block** = Tool not ready (Tool Ready: No)

### Managing Jobs and Setups
- **Edit Job/Setup**: Click the pencil icon on any job or setup block
- **Delete Job/Setup**: Click the trash icon (requires confirmation)
- **Move Between Machines**: Drag any block to a different machine column
- **Reorder Items**: Drag jobs/setups up or down within the same column to change their order/priority
- **Update Progress**: Click on the vertical progress bar on the right side of any job/setup block
- **Clear All**: Use the "Clear All" button to remove all jobs and setups (requires confirmation)

### Tracking Progress
Each job and setup block features an **interactive progress bar** on the right side:

**In the Modal Form:**
- Drag the slider to set initial completion percentage (0-100%)
- Live percentage display shows current value
- Easy to set when creating or editing jobs

**On the Job Block:**
- **Vertical green progress bar** on the right edge of each block
- **Click anywhere on the bar** to instantly update completion percentage
- Click near the **top** = higher percentage (closer to 100%)
- Click near the **bottom** = lower percentage (closer to 0%)
- **Percentage text** displays below the bar (e.g., "75%")
- Visual fill shows completion at a glance

**Visual Design:**
```
┌─────────────────────────┬─┐
│ Job Name            [✏️🗑️]│█│ ← Progress Bar
│ Work Order: WO-123      │█│    (fills from bottom)
│ Parts: 1000             │█│
│ ...                     │█│
│                         │ │
│ Days to Complete: 1.2   │ │
└─────────────────────────┴─┘
                          85%  ← Percentage Display
```

### Job Ordering and Priority
- Jobs can be freely reordered by dragging them to any position within a column
- The order of jobs in each column represents your manual priority
- Drop a job between any two existing jobs to insert it at that position
- Drop at the bottom to append to the end
- **⚠️ Important:** Reordering affects "Days to Complete" - jobs higher in the list complete sooner

### Setting Machine Priorities
1. Click on the priority badge at the top of any machine column
2. Cycles through: Low → Medium → High → Critical
3. Color-coded for quick visual reference:
   - **Green** = Low priority
   - **Orange** = Medium priority
   - **Red** = High priority
   - **Dark Red** = Critical priority

### Viewing Totals
Each machine displays **comprehensive totals** at the bottom:
  - **Total Hours** - Sum of all job hours on that machine
  - **Total Material** - Sum of all material (lbs) scheduled on that machine
  - **Material Breakdown** - Grouped by material type with individual totals
    - Example: "Steel 316: 45.5 lbs", "Aluminum: 23.0 lbs"
- All totals automatically update when jobs are added, removed, moved, or edited

### Exporting to PDF
Generate a professional PDF snapshot of your entire schedule:

1. **Click** the green **"Print/PDF"** button in the header
2. **Print dialog** opens automatically
3. **Select options**:
   - **Destination**: Choose "Save as PDF" (Chrome/Edge) or "Microsoft Print to PDF"
   - **Layout**: Landscape recommended for better fit
   - **Margins**: Default or minimal
   - **Color**: Color (to preserve purple/green design)
   - **Background graphics**: Enable for full color appearance
4. **Click "Save"** or "Print" to download the PDF

**What's Included in PDF:**
- ✅ Manufacturing Schedule title with current date
- ✅ All machine columns with jobs and setups
- ✅ Complete job information (work order, parts, hours, etc.)
- ✅ Progress bars showing completion percentage
- ✅ Total hours and material breakdown per machine
- ✅ Days to complete calculations
- ✅ Setup/maintenance status indicators

**What's Hidden in PDF:**
- ❌ Action buttons (Add Job, Clear All, etc.)
- ❌ Edit/Delete icons on job blocks
- ❌ Priority badges (cleaner appearance)
- ❌ Modal forms

**PDF Features:**
- **Full color layout** with purple theme and status colors
- **Green progress bars** showing completion visually
- **Color-coded setup blocks** (green = ready, red = not ready)
- **Professional appearance** suitable for presentations and reports
- Clear borders and sections for easy reading
- Compact layout to fit multiple columns per page
- Page breaks avoid splitting job blocks
- Date stamp in document title

## 📁 Project Structure

```
├── deploy.sh                    # One-click deployment script
├── README.md                    # This documentation
├── backend/                     # Node.js API server (deploys to Heroku)
│   ├── server.js               # Express server with API routes
│   ├── package.json            # Node.js dependencies
│   ├── Procfile                # Heroku deployment config
│   ├── config/
│   │   └── airtable.js         # Airtable database connection
│   ├── routes/
│   │   ├── jobs.js             # Jobs CRUD API endpoints
│   │   └── priorities.js       # Machine priorities API endpoints
│   └── public/                 # Frontend files (served by Express)
│       ├── index.html          # Main application page
│       ├── css/style.css       # Styling
│       └── js/main.js          # Frontend JavaScript with API calls
├── frontend/                    # Frontend source files
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
└── scripts/                     # Setup utilities
    ├── setup-airtable.sh       # Airtable table creation
    ├── setup-airtable.js       # Node.js version of setup
    └── deploy-heroku.sh        # Heroku deployment script
```

## 🛠️ Technical Details

### Technologies Used

**Frontend:**
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Client-side logic and interactivity
- **Font Awesome 6.4.0** - Icons via CDN
- **Google Fonts (Inter)** - Typography via CDN

**Backend:**
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Airtable** - Cloud database for shared data
- **Heroku** - Cloud hosting platform

### Data Storage
- **Primary**: Airtable cloud database - shared across all workstations
- **Fallback**: Local Storage API - browser-based persistence when offline
- Data automatically syncs every 30 seconds
- Real-time updates across all connected users

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Data Structure

**Job Object:**
```javascript
{
  id: "job_1234567890_abc123",
  jobName: "Widget Assembly",
  workOrder: "WO-12345",
  numParts: 500,
  numCavities: 2,
  cycleTime: 45,        // in seconds
  material: "Steel 316",
  totalMaterial: 125.5, // in lbs
  totalHours: 6.25,     // auto-calculated
  dueDate: "2024-12-15",
  machine: "260-1"
}
```

**Machine Priority Object:**
```javascript
{
  "22": "low",
  "55": "medium",
  "90-1": "high",
  // ... etc for all 22 machines
}
```

## 🎨 Design Features

- **Color Scheme**: Purple/blue gradient theme
- **Responsive Layout**: Horizontal scrolling for all machines
- **Visual Feedback**: Hover effects, drag states, animations
- **Clean Typography**: Inter font family
- **Accessibility**: Semantic HTML and ARIA labels

## 📋 Functional Entry Points

### Main Application
- **URL**: `index.html`
- **Description**: Main scheduling interface with all features

### Modal Forms
- **Add Job Modal**: Triggered by "Add New Job" button
- **Edit Job Modal**: Triggered by edit icon on job blocks

### Drag & Drop Zones
- All machine columns accept job blocks via drag-and-drop

## ❌ Features Not Yet Implemented

The following features could be added in future versions:

1. **Export/Import Functionality**
   - Export schedule to CSV, Excel, or PDF
   - Import jobs from spreadsheets

2. **Multi-User Support**
   - Backend database integration
   - Real-time collaboration
   - User authentication

3. **Advanced Filtering & Search**
   - Filter jobs by material, priority, or date range
   - Search across all job fields
   - Sort by various criteria

4. **Calendar View**
   - Date-based scheduling
   - Timeline visualization
   - Deadline tracking

5. **Reporting & Analytics**
   - Machine utilization reports
   - Job completion statistics
   - Performance dashboards

6. **Job Templates**
   - Save common job configurations
   - Quick job creation from templates

7. **Notifications**
   - Alerts for overloaded machines
   - Deadline reminders
   - Email notifications

8. **Mobile App**
   - Native iOS/Android applications
   - Offline support

9. **Integration APIs**
   - ERP system integration
   - MES (Manufacturing Execution System) connectivity
   - Automated data import from production systems

10. **Advanced Scheduling**
    - Automatic job optimization
    - Load balancing algorithms
    - Constraint-based scheduling

## 🔄 Recommended Next Steps

To enhance the application, consider implementing these features in order of priority:

### Phase 1: Data Management
1. **Export to CSV/Excel** - Allow users to export current schedule
2. **Print View** - Create printer-friendly schedule layout
3. **Backup/Restore** - Manual backup and restore of schedule data

### Phase 2: Enhanced Functionality
4. **Job Search & Filter** - Quick filtering by work order, material, etc.
5. **Job History** - Track changes and modifications
6. **Job Notes** - Add comments or special instructions to jobs

### Phase 3: Visualization
7. **Gantt Chart View** - Timeline-based visualization
8. **Machine Load Chart** - Visual representation of capacity utilization
9. **Dashboard** - Overview statistics and KPIs

### Phase 4: Collaboration
10. **Backend Integration** - Move from localStorage to database
11. **User Accounts** - Multi-user support with permissions
12. **Real-time Updates** - WebSocket-based live collaboration

### Phase 5: Advanced Features
13. **Automated Scheduling** - AI-powered job assignment
14. **Mobile Optimization** - Enhanced mobile experience
15. **External Integrations** - Connect with existing manufacturing systems

## 💾 Data Persistence

All schedule data is stored in the browser's Local Storage:
- **Key**: `manufacturingScheduleJobs`
- **Format**: JSON array of job objects
- **Size Limit**: ~5-10MB (browser dependent)

Machine priorities are stored separately:
- **Key**: `manufacturingSchedulePriorities`
- **Format**: JSON object mapping machines to priority levels

**Note**: Data is tied to the specific browser and device. Clearing browser data will remove the schedule.

## 🐛 Troubleshooting

### Jobs Not Saving
- Check browser console for errors
- Verify Local Storage is enabled
- Check available storage space

### Drag & Drop Not Working
- Ensure using a modern browser
- Check JavaScript is enabled
- Try refreshing the page

### Display Issues
- Clear browser cache
- Check browser compatibility
- Verify CSS and JS files are loading

## 📝 License

This project is provided as-is for manufacturing scheduling purposes.

## 🤝 Support

For issues or feature requests, please document them with:
- Browser version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready ✅
