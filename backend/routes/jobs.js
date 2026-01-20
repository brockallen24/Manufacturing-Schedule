const express = require('express');
const router = express.Router();
const { jobsTable } = require('../config/airtable');

// Helper function to map Airtable fields to frontend format
function mapAirtableToFrontend(record) {
  return {
    id: record.id,
    jobName: record.fields['Name'],
    workOrder: record.fields['Work Order'],
    numParts: record.fields['Num Parts'],
    cycleTime: record.fields['Cycle Time'],
    numCavities: record.fields['Num Cavities'],
    material: record.fields['Material'],
    totalMaterial: record.fields['Total Material'],
    totalHours: record.fields['Total Hours'],
    dueDate: record.fields['Due Date'],
    percentComplete: record.fields['Percent Complete'],
    machine: record.fields['Machine'],
    type: record.fields['Type'],
    toolNumber: record.fields['Tool Number'],
    toolReady: record.fields['Tool Ready'],
    notes: record.fields['Notes']
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

    // Map frontend field names to Airtable field names
    const airtableFields = {
      'Name': jobData.jobName,
      'Work Order': jobData.workOrder,
      'Num Parts': jobData.numParts,
      'Cycle Time': jobData.cycleTime,
      'Num Cavities': jobData.numCavities,
      'Material': jobData.material,
      'Total Material': jobData.totalMaterial,
      'Total Hours': jobData.totalHours,
      'Due Date': jobData.dueDate,
      'Percent Complete': jobData.percentComplete,
      'Machine': jobData.machine,
      'Type': jobData.type,
      'Tool Number': jobData.toolNumber,
      'Tool Ready': jobData.toolReady,
      'Notes': jobData.notes
    };

    // Remove undefined fields
    Object.keys(airtableFields).forEach(key => {
      if (airtableFields[key] === undefined) {
        delete airtableFields[key];
      }
    });

    console.log('Creating job with mapped fields:', airtableFields);

    const records = await jobsTable.create([
      { fields: airtableFields }
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

    // Map frontend field names to Airtable field names
    const airtableFields = {
      'Name': jobData.jobName,
      'Work Order': jobData.workOrder,
      'Num Parts': jobData.numParts,
      'Cycle Time': jobData.cycleTime,
      'Num Cavities': jobData.numCavities,
      'Material': jobData.material,
      'Total Material': jobData.totalMaterial,
      'Total Hours': jobData.totalHours,
      'Due Date': jobData.dueDate,
      'Percent Complete': jobData.percentComplete,
      'Machine': jobData.machine,
      'Type': jobData.type,
      'Tool Number': jobData.toolNumber,
      'Tool Ready': jobData.toolReady,
      'Notes': jobData.notes
    };

    // Remove undefined fields
    Object.keys(airtableFields).forEach(key => {
      if (airtableFields[key] === undefined) {
        delete airtableFields[key];
      }
    });

    const records = await jobsTable.update([
      {
        id: req.params.id,
        fields: airtableFields
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

    // Map frontend field names to Airtable field names
    const airtableFields = {
      'Name': updates.jobName,
      'Work Order': updates.workOrder,
      'Num Parts': updates.numParts,
      'Cycle Time': updates.cycleTime,
      'Num Cavities': updates.numCavities,
      'Material': updates.material,
      'Total Material': updates.totalMaterial,
      'Total Hours': updates.totalHours,
      'Due Date': updates.dueDate,
      'Percent Complete': updates.percentComplete,
      'Machine': updates.machine,
      'Type': updates.type,
      'Tool Number': updates.toolNumber,
      'Tool Ready': updates.toolReady,
      'Notes': updates.notes
    };

    // Remove undefined fields
    Object.keys(airtableFields).forEach(key => {
      if (airtableFields[key] === undefined) {
        delete airtableFields[key];
      }
    });

    const records = await jobsTable.update([
      {
        id: req.params.id,
        fields: airtableFields
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
      filterByFormula: `{Machine} = '${req.params.machineName}'`
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
