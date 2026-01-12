const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

// Connect to base
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Export table references
module.exports = {
  jobsTable: base('Jobs'),
  prioritiesTable: base('MachinePriorities'),
  base
};
