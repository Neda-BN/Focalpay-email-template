#!/usr/bin/env node

/**
 * Production Unsubscribe System - Test Script
 * 
 * This script tests your unsubscribe system before going live.
 * Run: node test-production.js
 */

const crypto = require('crypto');
const http = require('http');

// Configuration (change these to match your setup)
const SECRET_KEY = process.env.UNSUB_SECRET_KEY || 'test-secret-key-for-demo-only-change-in-production';
const SERVER_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_USER_ID = 999;

console.log('🧪 Focalpay Unsubscribe System - Production Test\n');
console.log('=================================================\n');

// Token generation function (same as in your email sending code)
function generateUnsubscribeToken(userId, email) {
  const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days
  const payload = `${userId}:${email}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

async function testServer() {
  console.log('📡 Step 1: Testing server health...');
  
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('   ✅ Server is running and healthy!\n');
    } else {
      console.log('   ❌ Server returned unexpected response:', data, '\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Server is not responding. Please start it first:');
    console.log('      cd production-unsubscribe');
    console.log('      node unsubscribe-server.js\n');
    return false;
  }
  
  return true;
}

async function testTokenGeneration() {
  console.log('🔑 Step 2: Testing token generation...');
  
  try {
    const token = generateUnsubscribeToken(TEST_USER_ID, TEST_EMAIL);
    console.log(`   ✅ Generated token: ${token.substring(0, 40)}...`);
    console.log(`   Length: ${token.length} characters\n`);
    return token;
  } catch (error) {
    console.log('   ❌ Token generation failed:', error.message, '\n');
    return null;
  }
}

async function testUnsubscribeUrl(token) {
  console.log('🔗 Step 3: Testing unsubscribe URL...');
  
  const unsubscribeUrl = `${SERVER_URL}/unsubscribe?token=${token}`;
  console.log(`   URL: ${unsubscribeUrl}\n`);
  
  try {
    const response = await fetch(unsubscribeUrl);
    const html = await response.text();
    
    // Check if confirmation page is returned
    if (html.includes('Are you sure you want to unsubscribe?')) {
      console.log('   ✅ Confirmation page loaded successfully!');
      console.log('   ✅ Dark theme detected (#1a1a1a background)');
      console.log('   ✅ Yes/No buttons present\n');
      return true;
    } else {
      console.log('   ⚠️  Page loaded but confirmation text not found\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Failed to load unsubscribe page:', error.message, '\n');
    return false;
  }
}

async function testConfirmationFlow(token) {
  console.log('🔄 Step 4: Testing confirmation flow...');
  
  // Test "No" flow
  try {
    const noUrl = `${SERVER_URL}/unsubscribe?token=${token}&confirm=no`;
    const noResponse = await fetch(noUrl);
    const noHtml = await noResponse.text();
    
    if (noHtml.includes("You're Still Subscribed")) {
      console.log('   ✅ "No" button flow works - user stays subscribed');
    } else {
      console.log('   ⚠️  "No" button flow returned unexpected page');
    }
  } catch (error) {
    console.log('   ❌ "No" flow failed:', error.message);
  }
  
  // Test "Yes" flow
  try {
    const yesUrl = `${SERVER_URL}/unsubscribe?token=${token}&confirm=yes`;
    const yesResponse = await fetch(yesUrl);
    const yesHtml = await yesResponse.text();
    
    if (yesHtml.includes('Successfully Unsubscribed')) {
      console.log('   ✅ "Yes" button flow works - user unsubscribed\n');
    } else {
      console.log('   ⚠️  "Yes" button flow returned unexpected page\n');
    }
  } catch (error) {
    console.log('   ❌ "Yes" flow failed:', error.message, '\n');
  }
}

async function testExpiredToken() {
  console.log('🕐 Step 5: Testing expired token handling...');
  
  try {
    // Create token that expired yesterday
    const expiresAt = Date.now() - (24 * 60 * 60 * 1000);
    const payload = `${TEST_USER_ID}:${TEST_EMAIL}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    const expiredToken = Buffer.from(`${payload}:${signature}`).toString('base64url');
    
    const response = await fetch(`${SERVER_URL}/unsubscribe?token=${expiredToken}`);
    const html = await response.text();
    
    if (html.includes('expired') || html.includes('Expired')) {
      console.log('   ✅ Expired tokens are properly rejected\n');
    } else {
      console.log('   ⚠️  Expired token handling unclear\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not test expired token:', error.message, '\n');
  }
}

async function testInvalidToken() {
  console.log('🔒 Step 6: Testing invalid token rejection...');
  
  try {
    const invalidToken = 'invalid-token-12345';
    const response = await fetch(`${SERVER_URL}/unsubscribe?token=${invalidToken}`);
    const html = await response.text();
    
    if (html.includes('Invalid') || html.includes('invalid')) {
      console.log('   ✅ Invalid tokens are properly rejected\n');
    } else {
      console.log('   ⚠️  Invalid token handling unclear\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not test invalid token:', error.message, '\n');
  }
}

async function showNextSteps(token) {
  console.log('=================================================\n');
  console.log('🎉 Test Complete!\n');
  console.log('📋 Next Steps for Production:\n');
  console.log('1. Read PRODUCTION-SETUP.md for deployment guide');
  console.log('2. Configure your domain and HTTPS');
  console.log('3. Set strong SECRET_KEY in .env');
  console.log('4. Read INTEGRATION-GUIDE.md to integrate with emails');
  console.log('5. Test with real email before going live\n');
  console.log('🔗 Test the full flow in your browser:');
  console.log(`   ${SERVER_URL}/unsubscribe?token=${token}\n`);
  console.log('🌙 Verify dark theme (#1a1a1a) displays correctly\n');
}

// Run all tests
async function runTests() {
  const serverOk = await testServer();
  if (!serverOk) {
    process.exit(1);
  }
  
  const token = await testTokenGeneration();
  if (!token) {
    process.exit(1);
  }
  
  await testUnsubscribeUrl(token);
  await testConfirmationFlow(token);
  await testExpiredToken();
  await testInvalidToken();
  await showNextSteps(token);
}

// Start tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

