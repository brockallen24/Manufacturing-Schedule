const express = require('express');
const router = express.Router();
const { prioritiesTable } = require('../config/airtable');

// GET all machine priorities
router.get('/', async (req, res) => {
  try {
    const records = await prioritiesTable.select().all();
    
    // Convert to object format { "22": "low", "55": "medium", ... }
    const priorities = {};
    records.forEach(record => {
      priorities[record.fields.machine] = record.fields.priority;
    });
    
    res.json({ 
      priorities,
      count: Object.keys(priorities).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching priorities:', error);
    res.status(500).json({ error: 'Failed to fetch priorities', message: error.message });
  }
});

// GET priority for specific machine
router.get('/:machine', async (req, res) => {
  try {
    const records = await prioritiesTable.select({
      filterByFormula: `{machine} = '${req.params.machine}'`
    }).firstPage();
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Machine priority not found' });
    }
    
    res.json({ 
      machine: records[0].fields.machine,
      priority: records[0].fields.priority,
      id: records[0].id
    });
  } catch (error) {
    console.error('Error fetching priority:', error);
    res.status(500).json({ error: 'Failed to fetch priority', message: error.message });
  }
});

// PUT update machine priority
router.put('/:machine', async (req, res) => {
  try {
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }
    
    // Validate priority value
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority', 
        validValues: validPriorities 
      });
    }
    
    // Find existing record
    const existingRecords = await prioritiesTable.select({
      filterByFormula: `{machine} = '${req.params.machine}'`
    }).firstPage();
    
    let record;
    
    if (existingRecords.length > 0) {
      // Update existing record
      const updated = await prioritiesTable.update([
        {
          id: existingRecords[0].id,
          fields: { priority }
        }
      ]);
      record = updated[0];
    } else {
      // Create new record
      const created = await prioritiesTable.create([
        {
          fields: {
            machine: req.params.machine,
            priority
          }
        }
      ]);
      record = created[0];
    }
    
    res.json({ 
      machine: record.fields.machine,
      priority: record.fields.priority,
      id: record.id,
      message: 'Priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Failed to update priority', message: error.message });
  }
});

// POST batch update priorities
router.post('/batch', async (req, res) => {
  try {
    const { priorities } = req.body;
    
    if (!priorities || typeof priorities !== 'object') {
      return res.status(400).json({ error: 'Priorities object is required' });
    }
    
    const updates = [];
    
    for (const [machine, priority] of Object.entries(priorities)) {
      // Find existing record
      const existingRecords = await prioritiesTable.select({
        filterByFormula: `{machine} = '${machine}'`
      }).firstPage();
      
      if (existingRecords.length > 0) {
        updates.push({
          id: existingRecords[0].id,
          fields: { priority }
        });
      } else {
        // Create new record
        await prioritiesTable.create([
          {
            fields: { machine, priority }
          }
        ]);
      }
    }
    
    // Update existing records
    if (updates.length > 0) {
      await prioritiesTable.update(updates);
    }
    
    res.json({ 
      message: 'Priorities updated successfully',
      updated: updates.length,
      total: Object.keys(priorities).length
    });
  } catch (error) {
    console.error('Error batch updating priorities:', error);
    res.status(500).json({ error: 'Failed to update priorities', message: error.message });
  }
});

module.exports = router;
