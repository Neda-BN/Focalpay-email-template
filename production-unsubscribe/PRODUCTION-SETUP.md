# 🚀 Production Unsubscribe System - Setup Guide

## ✅ What's Included

This is your **production-ready unsubscribe system** with:
- ✅ Confirmation flow ("Are you sure?" with Yes/No buttons)
- ✅ Dark theme matching your email template (#1a1a1a background)
- ✅ Database integration for managing subscriptions
- ✅ Audit logging (IP, timestamp, user agent)
- ✅ Security features (HMAC-SHA256, rate limiting, token expiration)
- ✅ GDPR/CAN-SPAM compliant

---

## 📁 Files in This Folder

```
production-unsubscribe/
├── unsubscribe-server.js    # Main server (Node.js/Express)
├── schema.sql               # Database schema
├── package.json             # Dependencies
├── PRODUCTION-SETUP.md      # This file
├── INTEGRATION-GUIDE.md     # How to integrate with your email system
└── .env.example             # Environment variables template
```

---

## 🔧 Quick Setup (5 Steps)

### **Step 1: Install Dependencies**

```bash
cd "/Users/nedabagherinezhad/Desktop/Focalpay Sweden AB/Digital Marketing /Email template/production-unsubscribe"
npm install
```

### **Step 2: Create Database**

```bash
# If using SQLite (development/small scale)
sqlite3 production.db < schema.sql

# If using PostgreSQL (recommended for production)
psql -U your_user -d your_database -f schema.sql
```

### **Step 3: Set Environment Variables**

Create a `.env` file:

```bash
# Generate a strong secret key
SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

cat > .env << EOF
# Server Configuration
PORT=3000
NODE_ENV=production

# CRITICAL: Change this to a secure random key!
UNSUB_SECRET_KEY=$SECRET_KEY

# Your Domain
DOMAIN=yourdomain.com

# Database (if using PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
EOF
```

### **Step 4: Start the Server**

```bash
# For production, use PM2 (recommended)
npm install -g pm2
pm2 start unsubscribe-server.js --name unsubscribe
pm2 save
pm2 startup

# Or run directly (for testing)
node unsubscribe-server.js
```

### **Step 5: Configure Your Email Service**

See `INTEGRATION-GUIDE.md` for detailed instructions on integrating with your email sending service.

---

## 🌐 Production Deployment

### **Using PM2 (Recommended)**

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start unsubscribe-server.js --name focalpay-unsubscribe

# Save configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup

# Monitor
pm2 status
pm2 logs focalpay-unsubscribe
```

### **Using Nginx (Reverse Proxy)**

Create `/etc/nginx/sites-available/unsubscribe`:

```nginx
server {
    listen 80;
    server_name unsubscribe.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name unsubscribe.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/unsubscribe.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/unsubscribe.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/unsubscribe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **SSL/TLS Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d unsubscribe.yourdomain.com

# Auto-renewal is configured automatically
```

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] **Strong SECRET_KEY** - Use `crypto.randomBytes(32).toString('hex')`
- [ ] **HTTPS only** - Never use HTTP in production
- [ ] **Environment variables** - Never hardcode secrets
- [ ] **Production database** - Use PostgreSQL, not SQLite
- [ ] **Rate limiting** - Configured (included in server)
- [ ] **Firewall rules** - Only allow necessary ports
- [ ] **Regular backups** - Database backup strategy
- [ ] **Monitoring** - Set up error logging (Sentry, etc.)
- [ ] **Update dependencies** - `npm audit fix`
- [ ] **Server security** - Keep OS and packages updated

---

## 📊 How It Works

### **User Flow**

```
1. User receives email
   ↓
2. Clicks "Unsubscribe" link (contains unique token)
   ↓
3. Sees confirmation page (dark theme):
   "Are you sure you want to unsubscribe?"
   [Yes, Unsubscribe] [No, Stay Subscribed]
   ↓
4A. Clicks "No" → "Great! You're Still Subscribed"
    ✓ User stays in database
   
4B. Clicks "Yes" → "Successfully Unsubscribed"
    ✓ Database updated (unsubscribed = 1)
    ✓ Action logged
```

### **Technical Flow**

1. **Email Sending**: Generate unique token for each user
2. **Token Structure**: `userId:email:expiresAt:signature` (HMAC-SHA256)
3. **Token Expiry**: 90 days
4. **Validation**: Signature verification, expiration check
5. **Database Update**: Mark user as unsubscribed
6. **Audit Log**: Record IP, timestamp, user agent

---

## 🔗 Integration with Your Email System

### **Step 1: Generate Token When Sending Email**

```javascript
const crypto = require('crypto');
const SECRET_KEY = process.env.UNSUB_SECRET_KEY;

function generateUnsubscribeToken(userId, email) {
  const expires = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days
  const payload = `${userId}:${email}:${expires}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

// When sending email
const token = generateUnsubscribeToken(user.id, user.email);
const unsubscribeUrl = `https://unsubscribe.yourdomain.com/unsubscribe?token=${token}`;
```

### **Step 2: Replace Placeholder in Email Template**

In your `email-template.html`, you'll see:
```html
<a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a>
```

Replace it when sending:
```javascript
const htmlContent = emailTemplate.replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl);
```

### **Step 3: Add List-Unsubscribe Headers**

```javascript
// When sending email (Nodemailer example)
headers: {
  'List-Unsubscribe': `<mailto:unsubscribe@yourdomain.com>, <${unsubscribeUrl}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
}
```

### **Step 4: Filter Unsubscribed Users**

```javascript
// Before sending emails
const activeUsers = await db('users')
  .where('unsubscribed', false)
  .select('id', 'email', 'name');

// Send only to active users
for (const user of activeUsers) {
  await sendEmail(user);
}
```

---

## 📈 Monitoring & Maintenance

### **Check Unsubscribe Stats**

```sql
-- Total unsubscribes
SELECT COUNT(*) FROM users WHERE unsubscribed = 1;

-- Unsubscribe rate
SELECT 
  ROUND(100.0 * SUM(CASE WHEN unsubscribed = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as unsub_rate
FROM users;

-- Recent unsubscribes
SELECT email, unsubscribed_at 
FROM users 
WHERE unsubscribed = 1 
ORDER BY unsubscribed_at DESC 
LIMIT 20;

-- Unsubscribe activity log
SELECT * FROM unsubscribe_log 
ORDER BY timestamp DESC 
LIMIT 100;
```

### **Server Logs**

```bash
# PM2 logs
pm2 logs focalpay-unsubscribe

# Check server status
pm2 status

# Restart if needed
pm2 restart focalpay-unsubscribe
```

---

## 🆘 Troubleshooting

### **Server won't start**
```bash
# Check port 3000 is not in use
lsof -ti:3000

# Check logs
pm2 logs focalpay-unsubscribe --lines 100
```

### **Database errors**
```bash
# Check database exists
sqlite3 production.db ".tables"

# Verify schema
sqlite3 production.db ".schema users"
```

### **Tokens invalid**
- Ensure SECRET_KEY is the same between email sending and unsubscribe server
- Check tokens haven't expired (90 days)

### **HTTPS errors**
- Verify SSL certificate is valid
- Check Nginx configuration
- Test with `curl -I https://unsubscribe.yourdomain.com`

---

## 📞 Support

For issues:
1. Check logs: `pm2 logs focalpay-unsubscribe`
2. Verify database connection
3. Test token generation/validation separately
4. Check Nginx/SSL configuration

---

## ✅ Pre-Launch Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database created and schema applied
- [ ] `.env` file configured with strong SECRET_KEY
- [ ] Server starts without errors
- [ ] HTTPS configured (SSL certificate)
- [ ] Nginx reverse proxy configured
- [ ] PM2 process manager configured
- [ ] Test unsubscribe flow end-to-end
- [ ] Verified dark theme displays correctly
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Email service integration tested
- [ ] Rate limiting tested
- [ ] Security review completed

**Your unsubscribe system is production-ready!** 🚀

