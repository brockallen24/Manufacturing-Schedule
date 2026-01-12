/**
 * Airtable Setup Script for Manufacturing Schedule
 *
 * Usage:
 *   AIRTABLE_API_KEY=your_token AIRTABLE_BASE_ID=your_base_id node setup-airtable.js
 *
 * This script creates the required tables in your Airtable base
 */

const AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error('Error: Missing required environment variables.');
  console.error('');
  console.error('Usage:');
  console.error('  AIRTABLE_API_KEY=your_token AIRTABLE_BASE_ID=your_base_id node setup-airtable.js');
  console.error('');
  console.error('Get your credentials from:');
  console.error('  - Token: https://airtable.com/create/tokens');
  console.error('  - Base ID: Found in your Airtable URL (starts with "app")');
  process.exit(1);
}

async function createTable(name, description, fields) {
  console.log(`Creating table: ${name}...`);

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, fields })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`  ✓ Table "${name}" created successfully!`);
      console.log(`  Table ID: ${data.id}`);
      return data;
    } else {
      console.log(`  ⚠ ${data.error?.message || 'Table may already exist'}`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error creating table: ${error.message}`);
    return null;
  }
}

async function setup() {
  console.log('='.repeat(50));
  console.log('Manufacturing Schedule - Airtable Setup');
  console.log('='.repeat(50));
  console.log('');

  // Create Jobs table
  const jobsTable = await createTable(
    'Jobs',
    'Manufacturing jobs and setup tasks',
    [
      { name: 'machine', type: 'singleLineText' },
      { name: 'type', type: 'singleSelect', options: { choices: [{ name: 'job' }, { name: 'setup' }] } },
      { name: 'jobName', type: 'singleLineText' },
      { name: 'workOrder', type: 'singleLineText' },
      { name: 'numParts', type: 'number', options: { precision: 0 } },
      { name: 'numCavities', type: 'number', options: { precision: 0 } },
      { name: 'cycleTime', type: 'number', options: { precision: 2 } },
      { name: 'material', type: 'singleLineText' },
      { name: 'totalMaterial', type: 'number', options: { precision: 2 } },
      { name: 'totalHours', type: 'number', options: { precision: 2 } },
      { name: 'dueDate', type: 'date' },
      { name: 'percentComplete', type: 'number', options: { precision: 0 } },
      { name: 'toolNumber', type: 'singleLineText' },
      { name: 'toolReady', type: 'singleSelect', options: { choices: [{ name: 'yes' }, { name: 'no' }] } },
      { name: 'setupNotes', type: 'multilineText' }
    ]
  );

  console.log('');

  // Create MachinePriorities table
  const prioritiesTable = await createTable(
    'MachinePriorities',
    'Priority levels for each machine',
    [
      { name: 'machine', type: 'singleLineText' },
      { name: 'priority', type: 'singleSelect', options: { choices: [{ name: 'low' }, { name: 'medium' }, { name: 'high' }, { name: 'critical' }] } }
    ]
  );

  console.log('');
  console.log('='.repeat(50));
  console.log('Setup Complete!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Your Airtable Base ID:', BASE_ID);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Go to https://airtable.com/${BASE_ID} to view your tables`);
  console.log('  2. Run the Heroku deployment script');
  console.log('');
}

setup().catch(console.error);
