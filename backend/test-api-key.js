#!/usr/bin/env node
/**
 * Quick Airtable API Key Test
 * Tests if your API key and Base ID are valid
 */

require('dotenv').config();
const Airtable = require('airtable');

console.log('\n🔑 AIRTABLE API KEY VALIDATOR\n');
console.log('=' .repeat(60));

// Check if env vars are set
console.log('\n1. Checking Environment Variables:');
console.log('   AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? '✓ Set' : '✗ NOT SET');
console.log('   AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? '✓ Set' : '✗ NOT SET');

if (!process.env.AIRTABLE_API_KEY) {
  console.error('\n❌ ERROR: AIRTABLE_API_KEY not set');
  console.log('Set it in Heroku Config Vars or create a .env file locally\n');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID) {
  console.error('\n❌ ERROR: AIRTABLE_BASE_ID not set');
  console.log('Set it in Heroku Config Vars or create a .env file locally\n');
  process.exit(1);
}

// Show first few characters (for verification without exposing full key)
console.log('\n2. API Key Format Check:');
console.log('   First 4 chars:', process.env.AIRTABLE_API_KEY.substring(0, 4));
console.log('   Total length:', process.env.AIRTABLE_API_KEY.length);

if (process.env.AIRTABLE_API_KEY.startsWith('pat')) {
  console.log('   ✓ Using new Personal Access Token (PAT) format');
} else if (process.env.AIRTABLE_API_KEY.startsWith('key')) {
  console.log('   ⚠️  Using old API key format (deprecated)');
  console.log('   Consider upgrading to Personal Access Token at:');
  console.log('   https://airtable.com/create/tokens');
} else {
  console.log('   ⚠️  Unknown API key format');
}

console.log('\n3. Base ID Format Check:');
console.log('   First 4 chars:', process.env.AIRTABLE_BASE_ID.substring(0, 4));
if (process.env.AIRTABLE_BASE_ID.startsWith('app')) {
  console.log('   ✓ Correct format (starts with "app")');
} else {
  console.log('   ✗ Invalid format (should start with "app")');
}

// Test connection
console.log('\n4. Testing Airtable Connection:');
console.log('   Configuring Airtable...');

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testConnection() {
  try {
    console.log('   Attempting to connect to "Jobs" table...');

    const jobsTable = base('Jobs');
    const records = await jobsTable.select({ maxRecords: 1 }).all();

    console.log('\n✅ SUCCESS! API Key is VALID');
    console.log('   Connected to base successfully');
    console.log('   Found', records.length > 0 ? records.length + ' record(s)' : 'empty table (no records yet)');

    if (records.length > 0) {
      console.log('   Fields in table:', Object.keys(records[0].fields).join(', '));
    }

    console.log('\n✅ Your Airtable credentials are working correctly!');
    console.log('   The 503 error must be caused by something else.\n');

  } catch (error) {
    console.log('\n❌ FAILED! API Key is INVALID or has issues');
    console.log('\n   Error Type:', error.name);
    console.log('   Error Message:', error.message);

    if (error.statusCode) {
      console.log('   HTTP Status:', error.statusCode);
    }

    console.log('\n📋 What this error means:\n');

    if (error.message.includes('AUTHENTICATION_REQUIRED')) {
      console.log('   ❌ API key is invalid, expired, or revoked');
      console.log('   → Generate a new Personal Access Token at:');
      console.log('     https://airtable.com/create/tokens');
    } else if (error.message.includes('NOT_FOUND')) {
      console.log('   ❌ Base ID is wrong or table "Jobs" doesn\'t exist');
      console.log('   → Check your Base ID at: https://airtable.com/api');
      console.log('   → Verify a table named "Jobs" exists in your base');
    } else if (error.message.includes('INVALID_PERMISSIONS')) {
      console.log('   ❌ API key doesn\'t have permission to access this base');
      console.log('   → Go to: https://airtable.com/create/tokens');
      console.log('   → Edit your token and add access to this base');
    } else if (error.message.includes('INVALID_REQUEST')) {
      console.log('   ❌ API key format is invalid');
      console.log('   → Check for extra spaces or characters');
      console.log('   → Should start with "pat" or "key"');
    } else {
      console.log('   ❌ Unknown error - see message above');
    }

    console.log('\n');
    process.exit(1);
  }
}

testConnection();
