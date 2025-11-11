# 📧 Email Integration Guide

## How to Integrate Unsubscribe System with Your Emails

This guide shows you exactly how to integrate the unsubscribe system with your email sending service.

---

## 🎯 Overview

**What you need to do:**
1. Generate an unsubscribe token for each user
2. Replace `{{UNSUBSCRIBE_URL}}` in email template
3. Add List-Unsubscribe headers
4. Filter out unsubscribed users before sending

---

## 📝 Step-by-Step Integration

### **Step 1: Token Generation Code**

Add this function to your email sending code:

```javascript
const crypto = require('crypto');

// IMPORTANT: Use the same SECRET_KEY as your unsubscribe server!
const SECRET_KEY = process.env.UNSUB_SECRET_KEY;

function generateUnsubscribeToken(userId, email) {
  // Token expires in 90 days
  const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000);
  
  // Create payload
  const payload = `${userId}:${email}:${expiresAt}`;
  
  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Encode as base64url
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  
  return token;
}
```

### **Step 2: Generate URL for Each User**

```javascript
// When sending email to a user
const userId = 123; // from your database
const userEmail = 'user@example.com'; // from your database

// Generate token
const token = generateUnsubscribeToken(userId, userEmail);

// Create full unsubscribe URL
const unsubscribeUrl = `https://yourdomain.com/unsubscribe?token=${token}`;
```

### **Step 3: Replace Placeholder in Email Template**

Your `email-template.html` now contains `{{UNSUBSCRIBE_URL}}`:

```javascript
const fs = require('fs');

// Read your email template
const emailTemplate = fs.readFileSync('email-template.html', 'utf-8');

// Replace placeholder with actual URL
const htmlContent = emailTemplate.replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl);

// Now htmlContent is ready to send!
```

### **Step 4: Add List-Unsubscribe Headers**

**Why?** These headers enable one-click unsubscribe in Gmail, Outlook, etc.

#### **With Nodemailer:**

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: '"Focalpay" <noreply@focalpay.se>',
  to: userEmail,
  subject: 'Your Newsletter Subject',
  html: htmlContent,
  // IMPORTANT: Add these headers!
  headers: {
    'List-Unsubscribe': `<mailto:unsubscribe@yourdomain.com>, <${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  }
});
```

#### **With SendGrid:**

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: userEmail,
  from: 'noreply@focalpay.se',
  subject: 'Your Newsletter Subject',
  html: htmlContent,
  headers: {
    'List-Unsubscribe': `<mailto:unsubscribe@yourdomain.com>, <${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  }
};

await sgMail.send(msg);
```

#### **With AWS SES:**

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

const params = {
  Source: 'noreply@focalpay.se',
  Destination: { ToAddresses: [userEmail] },
  Message: {
    Subject: { Data: 'Your Newsletter Subject' },
    Body: { Html: { Data: htmlContent } }
  },
  // Add custom headers
  Tags: [
    { Name: 'List-Unsubscribe', Value: `<${unsubscribeUrl}>` }
  ]
};

await ses.sendEmail(params).promise();
```

---

## 📋 Complete Example: Sending Newsletter

Here's a complete example that brings it all together:

```javascript
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const db = require('./database'); // Your database connection

const SECRET_KEY = process.env.UNSUB_SECRET_KEY;
const DOMAIN = 'yourdomain.com';

// Token generation function
function generateUnsubscribeToken(userId, email) {
  const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000);
  const payload = `${userId}:${email}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

// Main function to send newsletter
async function sendNewsletter() {
  // 1. Get active (subscribed) users only
  const activeUsers = await db('users')
    .where('unsubscribed', false)
    .select('id', 'email', 'name');
  
  console.log(`Sending to ${activeUsers.length} active subscribers`);
  
  // 2. Load email template
  const emailTemplate = fs.readFileSync('email-template.html', 'utf-8');
  
  // 3. Setup email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  // 4. Send to each user
  for (const user of activeUsers) {
    try {
      // Generate unique unsubscribe token
      const token = generateUnsubscribeToken(user.id, user.email);
      const unsubscribeUrl = `https://${DOMAIN}/unsubscribe?token=${token}`;
      
      // Replace placeholder in template
      let htmlContent = emailTemplate.replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl);
      
      // Optionally personalize with user name
      htmlContent = htmlContent.replace('{{USER_NAME}}', user.name || 'there');
      
      // Send email
      await transporter.sendMail({
        from: '"Focalpay" <noreply@focalpay.se>',
        to: user.email,
        subject: 'The Future of Retail Has No Checkout Line',
        html: htmlContent,
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@focalpay.se>, <${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      });
      
      console.log(`✓ Sent to ${user.email}`);
      
      // Rate limit to avoid spam filters (optional)
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`✗ Failed to send to ${user.email}:`, error.message);
    }
  }
  
  console.log('Newsletter sending complete!');
}

// Run it
sendNewsletter().catch(console.error);
```

---

## 🗄️ Database Integration

### **Filter Unsubscribed Users**

Always filter out unsubscribed users before sending:

```javascript
// ✅ CORRECT
const users = await db('users')
  .where('unsubscribed', false)
  .select('id', 'email', 'name');

// ❌ WRONG - Don't send to everyone!
const users = await db('users').select('*');
```

### **Check Individual User**

```javascript
async function canSendTo(email) {
  const user = await db('users')
    .where({ email: email })
    .first();
  
  return user && !user.unsubscribed;
}

// Usage
if (await canSendTo('user@example.com')) {
  await sendEmail(user);
}
```

### **Sync Unsubscribes**

The unsubscribe server automatically updates your database when users unsubscribe. No extra code needed!

But you can query the unsubscribe log:

```javascript
// Get recent unsubscribes
const recentUnsubs = await db('unsubscribe_log')
  .orderBy('timestamp', 'desc')
  .limit(100);

console.log(`Recent unsubscribes: ${recentUnsubs.length}`);
```

---

## 🔄 Testing Before Production

### **1. Test Token Generation**

```javascript
// Test file: test-token.js
const token = generateUnsubscribeToken(1, 'test@example.com');
console.log('Generated token:', token);
console.log('Unsubscribe URL:', `https://yourdomain.com/unsubscribe?token=${token}`);
```

### **2. Test Email Sending**

```javascript
// Send to your own email first
const testEmail = 'your-email@example.com';
const token = generateUnsubscribeToken(999, testEmail);
const unsubscribeUrl = `https://yourdomain.com/unsubscribe?token=${token}`;

// ... send test email
console.log('Check your inbox and click the unsubscribe link!');
```

### **3. Verify Unsubscribe Flow**

1. Send test email to yourself
2. Click "Unsubscribe" link
3. Verify confirmation page appears (dark theme)
4. Click "Yes" or "No"
5. Check database was updated correctly

---

## 📊 Best Practices

### **1. Always Filter Unsubscribed Users**

```javascript
// Good practice
const subscribers = await db('users')
  .where('unsubscribed', false)
  .where('email_verified', true); // bonus: only verified emails
```

### **2. Log Email Sends**

```javascript
// Track what you send
await db('email_log').insert({
  user_id: user.id,
  email: user.email,
  subject: 'Newsletter',
  sent_at: new Date()
});
```

### **3. Handle Bounces**

```javascript
// If email bounces, mark as unsubscribed
await db('users')
  .where({ email: bouncedEmail })
  .update({ unsubscribed: true, bounce_reason: 'hard_bounce' });
```

### **4. Respect Timing**

```javascript
// Don't send too frequently
const lastSent = await db('email_log')
  .where({ user_id: user.id })
  .orderBy('sent_at', 'desc')
  .first();

const daysSinceLastEmail = (Date.now() - new Date(lastSent.sent_at)) / (1000 * 60 * 60 * 24);

if (daysSinceLastEmail < 7) {
  console.log('Skipping - too soon since last email');
  return;
}
```

---

## 🔐 Security Notes

### **SECRET_KEY Must Match!**

The `UNSUB_SECRET_KEY` in your email sending code **must be exactly the same** as in your unsubscribe server!

```bash
# Set in both places:
# 1. Where you send emails
export UNSUB_SECRET_KEY="your-secret-key-here"

# 2. Unsubscribe server
export UNSUB_SECRET_KEY="your-secret-key-here"
```

### **Use Environment Variables**

```javascript
// ❌ NEVER hardcode secrets!
const SECRET_KEY = 'my-secret-key';

// ✅ Always use environment variables
const SECRET_KEY = process.env.UNSUB_SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('UNSUB_SECRET_KEY environment variable is required!');
}
```

---

## 🆘 Troubleshooting

### **"Invalid token" errors**

- Check SECRET_KEY is the same in both places
- Verify token hasn't expired (90 days)
- Ensure no extra spaces or characters in token

### **Users not getting unsubscribed**

- Check unsubscribe server is running
- Verify database connection works
- Check `users` table has `unsubscribed` column

### **Headers not working**

- Verify List-Unsubscribe format is correct
- Check domain reputation (SPF, DKIM, DMARC)
- Test with different email clients

---

## ✅ Integration Checklist

- [ ] Token generation function added to email code
- [ ] `{{UNSUBSCRIBE_URL}}` placeholder replaced in template
- [ ] List-Unsubscribe headers added to emails
- [ ] Filtering unsubscribed users before sending
- [ ] Same SECRET_KEY used in both email and unsubscribe server
- [ ] Tested end-to-end with real email
- [ ] Verified database updates when users unsubscribe
- [ ] Confirmed dark theme displays correctly
- [ ] Tested "Yes" and "No" flows

**You're ready to send emails with working unsubscribe!** 🎉

