#!/usr/bin/env node

// Test Airtable connection and check for missing fields
// Uses environment variables for credentials

require('dotenv').config();
const Airtable = require('airtable');

// Check for credentials
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('❌ ERROR: Missing credentials');
    console.error('Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables');
    console.error('\nOr create a .env file with:');
    console.error('AIRTABLE_API_KEY=your_key_here');
    console.error('AIRTABLE_BASE_ID=your_base_id_here');
    process.exit(1);
}

console.log('🔍 Testing Airtable Connection...\n');

Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
const jobsTable = base('Jobs');

// Required fields for the Manufacturing Schedule app
const REQUIRED_FIELDS = [
    { name: 'id', type: 'Single line text' },
    { name: 'type', type: 'Single select', options: ['job', 'setup'] },
    { name: 'machine', type: 'Single line text' },
    { name: 'jobName', type: 'Single line text' },
    { name: 'workOrder', type: 'Single line text' },
    { name: 'numParts', type: 'Number (integer)' },
    { name: 'cycleTime', type: 'Number (decimal)' },
    { name: 'numCavities', type: 'Number (integer)' },
    { name: 'material', type: 'Single line text' },
    { name: 'totalMaterial', type: 'Number (decimal)' },
    { name: 'totalHours', type: 'Number (decimal)' },
    { name: 'dueDate', type: 'Date' },
    { name: 'percentComplete', type: 'Number (integer)' }
];

async function testAirtable() {
    try {
        console.log('✅ Airtable SDK configured');
        console.log('📊 Base ID:', process.env.AIRTABLE_BASE_ID);
        console.log('📋 Table: Jobs\n');

        // Test 1: Fetch existing records
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Checking existing table structure...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const records = await jobsTable.select({ maxRecords: 5 }).all();
        console.log(`Found ${records.length} existing record(s)\n`);

        let existingFields = [];
        if (records.length > 0) {
            existingFields = Object.keys(records[0].fields);
            console.log('Fields currently in table:');
            existingFields.forEach(field => {
                console.log(`  ✓ ${field}`);
            });
            console.log('');
        } else {
            console.log('⚠️  Table is empty - cannot determine field structure yet\n');
        }

        // Test 2: Check which fields are missing
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: Analyzing required vs existing fields...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const requiredFieldNames = REQUIRED_FIELDS.map(f => f.name);
        const missingFields = requiredFieldNames.filter(field => !existingFields.includes(field));
        const extraFields = existingFields.filter(field => !requiredFieldNames.includes(field));

        if (missingFields.length === 0 && existingFields.length > 0) {
            console.log('✅ ALL REQUIRED FIELDS ARE PRESENT!\n');

            if (extraFields.length > 0) {
                console.log('Extra fields (these are OK):');
                extraFields.forEach(field => {
                    console.log(`  • ${field}`);
                });
                console.log('');
            }
        } else {
            console.log('❌ MISSING FIELDS DETECTED\n');
            console.log(`Missing ${missingFields.length} required field(s):\n`);

            REQUIRED_FIELDS.forEach(field => {
                if (missingFields.includes(field.name)) {
                    console.log(`  ✗ ${field.name} (${field.type})`);
                }
            });
            console.log('');

            if (extraFields.length > 0) {
                console.log('Fields that exist but are not required:');
                extraFields.forEach(field => {
                    console.log(`  • ${field}`);
                });
                console.log('');
            }
        }

        // Test 3: Try to create a test job
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Attempting to save a test job...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testJob = {
            id: 'TEST-' + Date.now(),
            type: 'job',
            machine: 'Machine 1',
            jobName: 'Test Job - Delete Me',
            workOrder: 'WO-TEST-001',
            numParts: 100,
            cycleTime: 1.5,
            numCavities: 2,
            material: 'PLA',
            totalMaterial: 150.5,
            totalHours: 2.5,
            dueDate: '2026-01-20',
            percentComplete: 0
        };

        console.log('Test job data:');
        console.log(JSON.stringify(testJob, null, 2));
        console.log('');

        const createdRecord = await jobsTable.create(testJob);

        console.log('✅ SUCCESS! Test job saved to Airtable!');
        console.log('Created record ID:', createdRecord.id);
        console.log('');

        // Clean up: Delete the test record
        console.log('🧹 Cleaning up test record...');
        await jobsTable.destroy(createdRecord.id);
        console.log('✅ Test record deleted\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ALL TESTS PASSED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Your Airtable table is configured correctly!');
        console.log('You can now use the Manufacturing Schedule app.\n');

    } catch (error) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ TEST FAILED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.error('Error:', error.message);
        console.error('');

        if (error.statusCode === 401) {
            console.error('🔒 AUTHENTICATION ERROR');
            console.error('Your API key is invalid or has expired.');
            console.error('');
            console.error('To fix:');
            console.error('1. Go to: https://airtable.com/create/tokens');
            console.error('2. Create a new personal access token');
            console.error('3. Update AIRTABLE_API_KEY in your .env file');
        } else if (error.statusCode === 404) {
            console.error('🔍 NOT FOUND ERROR');
            console.error('The base or table could not be found.');
            console.error('');
            console.error('Check:');
            console.error('- Base ID is correct:', process.env.AIRTABLE_BASE_ID);
            console.error('- Table is named "Jobs" (case-sensitive)');
            console.error('- Your API key has access to this base');
        } else if (error.statusCode === 422 || error.message.includes('INVALID_VALUE_FOR_COLUMN') || error.message.includes('UNKNOWN_FIELD_NAME')) {
            console.error('⚠️  FIELD CONFIGURATION ERROR');
            console.error('The Airtable table is missing required fields or has incorrect field types.');
            console.error('');
            console.error('REQUIRED FIELDS (must add to "Jobs" table):');
            console.error('');
            REQUIRED_FIELDS.forEach((field, index) => {
                console.error(`  ${index + 1}. ${field.name}`);
                console.error(`     Type: ${field.type}`);
                if (field.options) {
                    console.error(`     Options: ${field.options.join(', ')}`);
                }
                console.error('');
            });
            console.error('📖 FOLLOW THIS GUIDE:');
            console.error('   Open file: AIRTABLE_FIELD_SETUP.md');
            console.error('   It has step-by-step instructions for adding each field.');
            console.error('');
            console.error('🌐 OR OPEN YOUR AIRTABLE:');
            console.error(`   https://airtable.com/${process.env.AIRTABLE_BASE_ID}`);
        } else {
            console.error('Full error details:');
            console.error(error);
        }

        console.error('');
        process.exit(1);
    }
}

testAirtable();
