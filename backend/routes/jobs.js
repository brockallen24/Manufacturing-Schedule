const express = require('express');
const router = express.Router();
const { jobsTable } = require('../config/airtable');

// Helper function to map Airtable fields to frontend format
// Airtable uses camelCase field names matching frontend exactly
function mapAirtableToFrontend(record) {
  return {
    id: record.id,
    ...record.fields
  };
}

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const records = await jobsTable.select()
    .all();

    const jobs = records.map(record => mapAirtableToFrontend(record));

    res.json({
      jobs,
      count: jobs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
});

// GET single job by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await jobsTable.find(req.params.id);

    res.json({
      job: mapAirtableToFrontend(record)
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(404).json({ error: 'Job not found', message: error.message });
  }
});

// POST create new job
router.post('/', async (req, res) => {
  try {
    const jobData = req.body;
    // Validate required fields
    if (!jobData.machine) {
      return res.status(400).json({ error: 'Machine is required' });
    }

    // Airtable field names match frontend exactly (camelCase)
    // Remove undefined fields before sending
    const cleanedData = {};
    Object.keys(jobData).forEach(key => {
      if (jobData[key] !== undefined) {
        cleanedData[key] = jobData[key];
      }
    });

    console.log('Creating job with fields:', cleanedData);

    const records = await jobsTable.create([
      { fields: cleanedData }
    ]);

    res.status(201).json({
      job: mapAirtableToFrontend(records[0]),
      id: records[0].id,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Job data attempting to create:', jobData);
    res.status(500).json({
      error: 'Failed to create job',
      message: error.message,
      errorName: error.name,
      errorDetails: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Hidden in production',
      jobDataSent: jobData
    });
  }
});

// PUT update job
router.put('/:id', async (req, res) => {
  try {
    const jobData = req.body;

    // Airtable field names match frontend exactly (camelCase)
    // Remove undefined fields before sending
    const cleanedData = {};
    Object.keys(jobData).forEach(key => {
      if (jobData[key] !== undefined) {
        cleanedData[key] = jobData[key];
      }
    });

    const records = await jobsTable.update([
      {
        id: req.params.id,
        fields: cleanedData
      }
    ]);

    res.json({
      job: mapAirtableToFrontend(records[0]),
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job', message: error.message });
  }
});

// PATCH update specific fields
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;

    // Airtable field names match frontend exactly (camelCase)
    // Remove undefined fields before sending
    const cleanedData = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanedData[key] = updates[key];
      }
    });

    const records = await jobsTable.update([
      {
        id: req.params.id,
        fields: cleanedData
      }
    ]);

    res.json({
      job: mapAirtableToFrontend(records[0]),
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job', message: error.message });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    await jobsTable.destroy([req.params.id]);
    
    res.json({ 
      message: 'Job deleted successfully', 
      id: req.params.id 
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job', message: error.message });
  }
});

// GET jobs by machine
router.get('/machine/:machineName', async (req, res) => {
  try {
    const records = await jobsTable.select({
      filterByFormula: `{machine} = '${req.params.machineName}'`
    }).all();

    const jobs = records.map(record => mapAirtableToFrontend(record));

    res.json({
      jobs,
      count: jobs.length,
      machine: req.params.machineName
    });
  } catch (error) {
    console.error('Error fetching jobs by machine:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
});

module.exports = router;
