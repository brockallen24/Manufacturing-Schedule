#!/usr/bin/env node
/**
 * Airtable Diagnostic Tool
 * This script tests the Airtable connection and reveals the actual schema
 */

require('dotenv').config();
const Airtable = require('airtable');

console.log('='.repeat(60));
console.log('AIRTABLE DIAGNOSTIC TOOL');
console.log('='.repeat(60));
console.log();

// Check environment variables
console.log('1. Checking Environment Variables...');
console.log('   AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? '✓ Set (length: ' + process.env.AIRTABLE_API_KEY.length + ')' : '✗ NOT SET');
console.log('   AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? '✓ Set (' + process.env.AIRTABLE_BASE_ID + ')' : '✗ NOT SET');
console.log();

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('ERROR: Missing required environment variables!');
  console.log('Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in your .env file');
  process.exit(1);
}

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function diagnose() {
  try {
    // Test 1: Check if Jobs table exists and read existing records
    console.log('2. Testing Jobs Table Access...');
    const jobsTable = base('Jobs');

    let records;
    try {
      records = await jobsTable.select({ maxRecords: 3 }).all();
      console.log('   ✓ Successfully connected to Jobs table');
      console.log('   ✓ Found', records.length, 'record(s) (showing max 3)');
      console.log();
    } catch (error) {
      console.log('   ✗ Failed to read from Jobs table');
      console.log('   Error:', error.message);
      console.log();
      throw error;
    }

    // Test 2: Discover actual field names
    if (records.length > 0) {
      console.log('3. Discovered Field Names in Jobs Table:');
      const firstRecord = records[0];
      const fieldNames = Object.keys(firstRecord.fields);

      console.log('   Record ID:', firstRecord.id);
      console.log('   Field Names Found:', fieldNames.length);
      console.log();

      fieldNames.forEach(fieldName => {
        const value = firstRecord.fields[fieldName];
        const type = typeof value;
        console.log(`   - "${fieldName}" (${type}):`,
          type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value
        );
      });
      console.log();

      // Show all records
      console.log('4. Sample Records:');
      records.forEach((record, index) => {
        console.log(`   Record ${index + 1}:`, JSON.stringify(record.fields, null, 4));
      });
      console.log();
    } else {
      console.log('3. No existing records found in Jobs table');
      console.log('   This is fine - the table exists but is empty');
      console.log();
    }

    // Test 3: Try to create a minimal test record
    console.log('5. Testing Job Creation with Minimal Data...');

    const testData = {
      'machine': '22',
      'type': 'job'
    };

    console.log('   Attempting to create with fields:', testData);

    try {
      const createdRecords = await jobsTable.create([
        { fields: testData }
      ]);

      console.log('   ✓ Successfully created test record!');
      console.log('   Record ID:', createdRecords[0].id);
      console.log('   Fields returned:', Object.keys(createdRecords[0].fields));
      console.log();

      // Clean up - delete the test record
      console.log('6. Cleaning up test record...');
      await jobsTable.destroy([createdRecords[0].id]);
      console.log('   ✓ Test record deleted');
      console.log();

    } catch (error) {
      console.log('   ✗ Failed to create test record');
      console.log('   Error Type:', error.name);
      console.log('   Error Message:', error.message);

      if (error.statusCode) {
        console.log('   HTTP Status:', error.statusCode);
      }

      if (error.error) {
        console.log('   Error Details:', JSON.stringify(error.error, null, 2));
      }
      console.log();
      console.log('   This error tells us what Airtable expects!');
      console.log();
    }

    // Test 4: Test MachinePriorities table
    console.log('7. Testing MachinePriorities Table...');
    try {
      const prioritiesTable = base('MachinePriorities');
      const priorityRecords = await prioritiesTable.select({ maxRecords: 3 }).all();

      console.log('   ✓ Successfully connected to MachinePriorities table');
      console.log('   ✓ Found', priorityRecords.length, 'record(s)');

      if (priorityRecords.length > 0) {
        console.log('   Field Names:', Object.keys(priorityRecords[0].fields));
        console.log('   Sample Record:', JSON.stringify(priorityRecords[0].fields, null, 4));
      }
      console.log();
    } catch (error) {
      console.log('   ✗ Failed to read MachinePriorities table');
      console.log('   Error:', error.message);
      console.log();
    }

    console.log('='.repeat(60));
    console.log('DIAGNOSIS COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('RECOMMENDATIONS:');
    console.log('1. Check the field names shown above');
    console.log('2. Update backend/routes/jobs.js to match these exact field names');
    console.log('3. Ensure field types match (numbers vs strings, etc.)');
    console.log('4. Check which fields are required in Airtable');
    console.log();

  } catch (error) {
    console.error();
    console.error('FATAL ERROR:');
    console.error('  Message:', error.message);
    if (error.statusCode) {
      console.error('  Status Code:', error.statusCode);
    }
    console.error();
    console.error('POSSIBLE CAUSES:');
    console.error('  - Invalid API key');
    console.error('  - Invalid Base ID');
    console.error('  - Table "Jobs" does not exist in this base');
    console.error('  - API key lacks permission to access this base');
    console.error();
    process.exit(1);
  }
}

// Run diagnosis
diagnose();
