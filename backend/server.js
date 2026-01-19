const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const jobsRouter = require('./routes/jobs');
const prioritiesRouter = require('./routes/priorities');

const app = express();
const PORT = process.env.PORT || 3000;


// Airtable Connection Test Endpoint
app.get('/api/test/airtable', async (req, res) => {
    try {
          console.log('Testing Airtable connection...');
          console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
          console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

          if (!process.env.AIRTABLE_API_KEY) {
                  return res.status(400).json({ 
                            error: 'AIRTABLE_API_KEY not set in environment variables',
                            hint: 'Check your .env file or Heroku config vars'
                  });
          }

          if (!process.env.AIRTABLE_BASE_ID) {
                  return res.status(400).json({ 
                            error: 'AIRTABLE_BASE_ID not set in environment variables',
                            hint: 'Check your .env file or Heroku config vars'
                  });
          }

          const { jobsTable } = require('./config/airtable');
          const records = await jobsTable.select().firstPage();

          res.json({
                  status: 'success',
                  message: 'Airtable connection working!',
                  recordsFound: records.length,
                  apiKeyConfigured: !!process.env.AIRTABLE_API_KEY,
                  baseIdConfigured: !!process.env.AIRTABLE_BASE_ID,
                  tableName: 'Jobs',
                  firstRecord: records.length > 0 ? {
                            id: records[0].id,
                            fields: Object.keys(records[0].fields)
                  } : null
          });
    } catch (error) {
          console.error('Airtable connection test failed:', error);
          res.status(500).json({
                  status: 'error',
                  message: 'Airtable connection failed',
                  errorMessage: error.message,
                  errorName: error.name,
                  errorDetails: error.toString(),
                  troubleshooting: {
                            checkEnvVars: 'Verify AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set',
                            checkAPIKey: 'Make sure the API key is valid and not expired',
                            checkBaseID: 'Verify the base ID matches your Airtable base',
                            checkTableName: 'Ensure a table named "Jobs" exists in your base'
                  }
          });
    }
});

// Test Job Creation with Detailed Validation
app.post('/api/test/create-job', async (req, res) => {
    try {
          console.log('=== TEST JOB CREATION ===');

          const { jobsTable } = require('./config/airtable');

          const testJobData = {
                  jobName: '[TEST] Job - ' + new Date().toISOString(),
                  workOrder: 'TEST-' + Date.now(),
                  numParts: 1,
                  cycleTime: 1,
                  numCavities: 1,
                  material: 'Test Material',
                  totalMaterial: 1,
                  totalHours: 1,
                  dueDate: new Date().toISOString().split('T')[0],
                  percentComplete: 0,
                  machine: '22'
          };

          console.log('Attempting to create test job with data:', JSON.stringify(testJobData, null, 2));

          const records = await jobsTable.create([
            { fields: testJobData }
                ]);

          res.json({
                  status: 'success',
                  message: 'Test job created successfully!',
                  recordId: records[0].id,
                  dataCreated: testJobData,
                  fieldsInAirtable: Object.keys(records[0].fields),
                  fullRecord: records[0]
          });
    } catch (error) {
          console.error('✗ Test job creation failed:', error.message);

          res.status(500).json({
                  status: 'error',
                  message: 'Test job creation failed',
                  errorMessage: error.message,
                  possibleCauses: [
                            'Invalid field names in the data object',
                            'Field type mismatch (e.g., sending string instead of number)',
                            'Required fields missing',
                            'Airtable API key invalid or expired',
                            'Base or table doesn\'t exist'
                          ],
                  errorDetails: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                  }
          });
    }
});
// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(morgan('combined'));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting for API routes only
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/priorities', prioritiesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve index.html for root and all non-API routes (SPA support)
app.get('*', (req, res, next) => {
  // Skip if it's an API route or health check
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
