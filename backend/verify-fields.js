#!/usr/bin/env node
/**
 * Quick Airtable Field Name Verification
 * Compares what the code expects vs what Airtable actually has
 */

require('dotenv').config();
const Airtable = require('airtable');

console.log('\n🔍 AIRTABLE FIELD NAME VERIFICATION\n');
console.log('=' .repeat(70));

// What our code currently expects
const EXPECTED_FIELDS = {
  jobs: [
    'Name',
    'Work Order',
    'Num Parts',
    'Cycle Time',
    'Num Cavities',
    'Material',
    'Total Material',
    'Total Hours',
    'Due Date',
    'Percent Complete',
    'Machine',
    'Type',
    'Tool Number',
    'Tool Ready',
    'Notes'
  ],
  priorities: [
    'Name',
    'priority'
  ]
};

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('❌ ERROR: Missing environment variables');
  console.log('\nSet these in Heroku:');
  console.log('  heroku config:set AIRTABLE_API_KEY=xxx');
  console.log('  heroku config:set AIRTABLE_BASE_ID=xxx\n');
  process.exit(1);
}

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function verifyFields() {
  try {
    // Check Jobs table
    console.log('\n📋 JOBS TABLE');
    console.log('-'.repeat(70));

    const jobsTable = base('Jobs');
    const jobRecords = await jobsTable.select({ maxRecords: 1 }).all();

    if (jobRecords.length === 0) {
      console.log('⚠️  Table is empty - will try to get fields from table schema');
      console.log('Creating a minimal test record to discover field names...\n');

      try {
        // Try creating with just machine
        const testRecord = await jobsTable.create([{
          fields: { 'Machine': '22' }
        }]);
        console.log('✅ Test record created with field "Machine"');

        // Clean up
        await jobsTable.destroy([testRecord[0].id]);
        console.log('✅ Test record deleted\n');

        console.log('ACTUAL FIELDS IN AIRTABLE: At least "Machine" exists');
        console.log('\n❓ Unable to discover all fields - table is empty.');
        console.log('Please add at least one job manually in Airtable, then run this again.\n');
        return;
      } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\nThis error tells us what field names Airtable expects!');

        if (error.message.includes('UNKNOWN_FIELD_NAME')) {
          console.log('\n💡 The field "Machine" does not exist in your Airtable.');
          console.log('   Your Airtable uses different field names!\n');
        }
        return;
      }
    }

    const actualFields = Object.keys(jobRecords[0].fields).sort();
    const expectedFields = EXPECTED_FIELDS.jobs.sort();

    console.log('Expected by code:', expectedFields.length, 'fields');
    console.log('Found in Airtable:', actualFields.length, 'fields\n');

    // Compare
    const missing = expectedFields.filter(f => !actualFields.includes(f));
    const extra = actualFields.filter(f => !expectedFields.includes(f));
    const matching = expectedFields.filter(f => actualFields.includes(f));

    if (missing.length === 0 && extra.length === 0) {
      console.log('✅ PERFECT MATCH! All field names match.\n');
    } else {
      console.log('⚠️  FIELD NAME MISMATCH DETECTED!\n');

      if (matching.length > 0) {
        console.log('✅ Matching fields (' + matching.length + '):');
        matching.forEach(f => console.log('   ✓', f));
        console.log();
      }

      if (missing.length > 0) {
        console.log('❌ Missing in Airtable (' + missing.length + '):');
        console.log('   (Code expects these, but they don\'t exist in Airtable)');
        missing.forEach(f => console.log('   ✗', f));
        console.log();
      }

      if (extra.length > 0) {
        console.log('ℹ️  Extra in Airtable (' + extra.length + '):');
        console.log('   (These exist in Airtable but code doesn\'t use them)');
        extra.forEach(f => console.log('   +', f));
        console.log();
      }
    }

    console.log('ACTUAL AIRTABLE FIELDS:');
    actualFields.forEach((field, i) => {
      const sample = jobRecords[0].fields[field];
      const type = typeof sample;
      console.log(`  ${i + 1}. "${field}" (${type}): ${JSON.stringify(sample)}`);
    });

    // Check MachinePriorities table
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 MACHINEPRIORITIES TABLE');
    console.log('-'.repeat(70));

    const prioritiesTable = base('MachinePriorities');
    const priorityRecords = await prioritiesTable.select({ maxRecords: 1 }).all();

    if (priorityRecords.length > 0) {
      const actualPriorityFields = Object.keys(priorityRecords[0].fields).sort();
      console.log('Found fields:', actualPriorityFields.join(', '));
      console.log('\nSample record:');
      console.log(JSON.stringify(priorityRecords[0].fields, null, 2));
    } else {
      console.log('⚠️  Table is empty');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📝 RECOMMENDATIONS:\n');

    if (missing.length > 0) {
      console.log('❌ PROBLEM: Code expects fields that don\'t exist in Airtable\n');
      console.log('SOLUTION: Update backend/routes/jobs.js field mapping to use:');
      console.log('\nconst airtableFields = {');
      actualFields.forEach(field => {
        // Try to guess the frontend field name
        const camelCase = field
          .replace(/\s+/g, '')
          .replace(/^./, str => str.toLowerCase())
          .replace(/\s\w/g, str => str.toUpperCase().trim());
        console.log(`  '${field}': jobData.${camelCase},`);
      });
      console.log('};\n');
    } else if (actualFields.length > 0) {
      console.log('✅ Field names look good!');
      console.log('\nIf jobs still fail to save, check:');
      console.log('  1. Required fields in Airtable');
      console.log('  2. Field types (number vs text vs date)');
      console.log('  3. Heroku environment variables are set');
      console.log('  4. Browser console for specific error messages\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.message.includes('NOT_FOUND')) {
      console.log('\n💡 Table "Jobs" or "MachinePriorities" does not exist');
      console.log('   Check your Airtable base and create these tables.\n');
    } else if (error.message.includes('AUTHENTICATION_REQUIRED')) {
      console.log('\n💡 API Key is invalid or missing permissions\n');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

verifyFields();
