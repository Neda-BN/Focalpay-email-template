// ========================================
// NODE.JS EXPRESS UNSUBSCRIBE ENDPOINT
// ========================================

const express = require('express');
const crypto = require('crypto');
const knex = require('knex');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// DATABASE SETUP (SQLite example)
// ========================================
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './production.db'
  },
  useNullAsDefault: true
});

// ========================================
// TOKEN GENERATION UTILITY
// ========================================
const SECRET_KEY = process.env.UNSUB_SECRET_KEY || 'your-secret-key-change-this';

/**
 * Generate a secure unsubscribe token for a user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {string} - Secure token
 */
function generateUnsubscribeToken(userId, email) {
  // Create token with timestamp (expires in 90 days)
  const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000);
  const payload = `${userId}:${email}:${expiresAt}`;
  
  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Combine payload and signature, encode as base64
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return token;
}

/**
 * Validate and decode unsubscribe token
 * @param {string} token - Token to validate
 * @returns {object|null} - Decoded data or null if invalid
 */
function validateUnsubscribeToken(token) {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) return null;
    
    const [userId, email, expiresAt, signature] = parts;
    
    // Check expiration
    if (Date.now() > parseInt(expiresAt)) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify signature
    const payload = `${userId}:${email}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return {
      valid: true,
      userId: parseInt(userId),
      email: email
    };
  } catch (error) {
    return { valid: false, error: 'Invalid token format' };
  }
}

// ========================================
// RATE LIMITING (simple in-memory)
// ========================================
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // Max 10 requests per minute
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip).filter(time => now - time < windowMs);
  
  if (requests.length >= maxRequests) {
    return false;
  }
  
  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
}

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unsubscribe', timestamp: new Date().toISOString() });
});

// ========================================
// UNSUBSCRIBE ENDPOINT
// ========================================

/**
 * GET /unsubscribe?token=...
 * Handles unsubscribe requests
 */
app.get('/unsubscribe', async (req, res) => {
  const token = req.query.token;
  const confirm = req.query.confirm; // Check if user confirmed
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Too Many Requests</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1>Too Many Requests</h1>
        <p>Please wait a moment before trying again.</p>
      </body>
      </html>
    `);
  }
  
  // Validate token
  if (!token) {
    return res.status(400).send(generateErrorPage('Invalid Request', 'No unsubscribe token provided.'));
  }
  
  const validation = validateUnsubscribeToken(token);
  
  if (!validation.valid) {
    return res.status(400).send(generateErrorPage('Invalid Token', validation.error || 'The unsubscribe link is invalid or has expired.'));
  }
  
  const { userId, email } = validation;
  
  try {
    // Check if user exists
    const user = await db('users').where({ id: userId, email: email }).first();
    
    if (!user) {
      return res.status(404).send(generateErrorPage('User Not Found', 'We could not find your account.'));
    }
    
    // Check if already unsubscribed (idempotency)
    if (user.unsubscribed) {
      return res.send(generateSuccessPage(email, true));
    }
    
    // If user clicked "No" on confirmation
    if (confirm === 'no') {
      return res.send(generateStaySubscribedPage(email));
    }
    
    // If no confirmation yet, show confirmation page
    if (confirm !== 'yes') {
      return res.send(generateConfirmationPage(email, token));
    }
    
    // Mark user as unsubscribed
    await db('users')
      .where({ id: userId })
      .update({
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString()
      });
    
    // Log the unsubscribe action
    await db('unsubscribe_log').insert({
      user_id: userId,
      email: email,
      token: token,
      ip_address: clientIp,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    // Invalidate token (optional - mark as used)
    await db('unsubscribe_tokens')
      .where({ user_id: userId, token: token })
      .update({ used: true, used_at: new Date().toISOString() });
    
    // Return success page
    res.send(generateSuccessPage(email, false));
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send(generateErrorPage('Server Error', 'An error occurred while processing your request. Please try again later.'));
  }
});

// ========================================
// HTML PAGE GENERATORS
// ========================================

function generateConfirmationPage(email, token) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Unsubscribe</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background-color: #1a1a1a;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background: #2c2c2c;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          text-align: center;
        }
        .icon {
          font-size: 64px;
          color: #f39c12;
          margin-bottom: 20px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          margin-bottom: 16px;
        }
        p {
          color: #b8b8b8;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .email {
          color: #CE9EFF;
          font-weight: 600;
        }
        .button-container {
          margin-top: 30px;
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .btn-yes {
          background-color: #e74c3c;
          color: #ffffff;
        }
        .btn-yes:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
        }
        .btn-no {
          background-color: #CE9EFF;
          color: #1a1a1a;
        }
        .btn-no:hover {
          background-color: #b88ce6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(206, 158, 255, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠️</div>
        <h1>Are you sure you want to unsubscribe?</h1>
        <p>Email address: <span class="email">${email}</span></p>
        <p>If you unsubscribe, you will no longer receive marketing emails from us.</p>
        <p>You can always resubscribe later if you change your mind.</p>
        
        <div class="button-container">
          <a href="/unsubscribe?token=${token}&confirm=yes" class="btn btn-yes">Yes, Unsubscribe</a>
          <a href="/unsubscribe?token=${token}&confirm=no" class="btn btn-no">No, Stay Subscribed</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStaySubscribedPage(email) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Still Subscribed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background-color: #1a1a1a;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background: #2c2c2c;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          text-align: center;
        }
        .icon {
          font-size: 64px;
          color: #27ae60;
          margin-bottom: 20px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          margin-bottom: 16px;
        }
        p {
          color: #b8b8b8;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .email {
          color: #CE9EFF;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✓</div>
        <h1>Great! You're Still Subscribed</h1>
        <p>The email address <span class="email">${email}</span> will continue to receive our newsletters.</p>
        <p>Thank you for staying with us!</p>
        <p style="margin-top: 30px; font-size: 14px; color: #b8b8b8;">
          You can unsubscribe at any time by clicking the unsubscribe link in any of our emails.
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateSuccessPage(email, alreadyUnsubscribed) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribed Successfully</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background-color: #1a1a1a;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background: #2c2c2c;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          text-align: center;
        }
        .icon {
          font-size: 64px;
          color: #27ae60;
          margin-bottom: 20px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          margin-bottom: 16px;
        }
        p {
          color: #b8b8b8;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .email {
          color: #CE9EFF;
          font-weight: 600;
        }
        .resubscribe-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          background-color: #CE9EFF;
          color: #1a1a1a;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .resubscribe-link:hover {
          background-color: #b88ce6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(206, 158, 255, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✓</div>
        <h1>${alreadyUnsubscribed ? 'Already Unsubscribed' : 'Successfully Unsubscribed'}</h1>
        <p>The email address <span class="email">${email}</span> has been ${alreadyUnsubscribed ? 'already' : 'successfully'} removed from our mailing list.</p>
        ${!alreadyUnsubscribed ? '<p>You will no longer receive marketing emails from us.</p>' : ''}
        <p>If you change your mind, you can always resubscribe.</p>
        <a href="https://example.com/resubscribe" class="resubscribe-link">Resubscribe</a>
        <p style="margin-top: 30px; font-size: 14px; color: #b8b8b8;">
          Note: It may take up to 48 hours for this change to take effect.
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background-color: #1a1a1a;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background: #2c2c2c;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          text-align: center;
        }
        .icon {
          font-size: 64px;
          color: #e74c3c;
          margin-bottom: 20px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          margin-bottom: 16px;
        }
        p {
          color: #b8b8b8;
          font-size: 16px;
          line-height: 1.6;
        }
        .contact-link {
          display: inline-block;
          margin-top: 20px;
          color: #CE9EFF;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .contact-link:hover {
          color: #b88ce6;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="mailto:support@example.com" class="contact-link">Contact Support</a>
      </div>
    </body>
    </html>
  `;
}

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`Unsubscribe server running on port ${PORT}`);
});

module.exports = { generateUnsubscribeToken, validateUnsubscribeToken };

