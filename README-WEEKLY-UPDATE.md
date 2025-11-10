# 📧 Email Template - Weekly Update Instructions

## Quick Start Guide

This email template is designed for **easy weekly updates**. Simply follow the steps below to replace the news articles each week.

---

## 📝 What You Need Each Week

Before you start, gather these 3 items for each article from **https://techsverige.se/en/**:

1. **Article Title**
2. **Article URL** (full link)
3. **Brief Description** (1-3 sentences summarizing the article)

---

## 🔄 Weekly Update Process

### Step 1: Open the Template
Open `email-template.html` in your code editor (VS Code, Sublime Text, etc.)

### Step 2: Find the Article Sections
Look for these clearly marked sections:
```html
<!-- ========================================
     NEWS ARTICLE 1 - UPDATE WEEKLY
     ======================================== -->
```

### Step 3: Update Each Article

For **EACH of the 3 articles**, you need to replace **3 things**:

#### ✏️ A. Update the Title
Find: `<!-- ARTICLE X TITLE: Replace text below -->`

**Replace:**
- The URL in `href="ARTICLE_X_URL_HERE"`
- The text between `>` and `</a>` (the visible title)

**Example:**
```html
<!-- Before -->
<a href="ARTICLE_1_URL_HERE" ...>Article 1 Title Goes Here</a>

<!-- After -->
<a href="https://techsverige.se/en/new-swedish-startup-secures-funding" ...>New Swedish Startup Secures €5M Funding</a>
```

#### 🖼️ B. Update the Image Link
Find: `<!-- ARTICLE X IMAGE: Clickable, opens same URL -->`

**Replace:**
- The URL in `href="ARTICLE_X_URL_HERE"` (make it the **same** URL as the title)

**Example:**
```html
<!-- Before -->
<a href="ARTICLE_1_URL_HERE" ...>

<!-- After -->
<a href="https://techsverige.se/en/new-swedish-startup-secures-funding" ...>
```

#### 📄 C. Update the Description
Find: `<!-- ARTICLE X DESCRIPTION: Replace text below (1-3 sentences) -->`

**Replace:**
- The text between `<p>` and `</p>` with your article summary

**Example:**
```html
<!-- Before -->
<p ...>Article 1 description goes here. This should be a brief summary of the article content, typically 1-3 sentences.</p>

<!-- After -->
<p ...>A promising Swedish tech startup has secured €5 million in Series A funding to expand its operations across Europe. The investment will be used to develop new AI-powered solutions.</p>
```

#### 🔗 D. Update the "Read More" Button
Find: `<!-- ARTICLE X READ MORE BUTTON -->`

**Replace:**
- The URL in `href="ARTICLE_X_URL_HERE"` (make it the **same** URL as the title)

**Example:**
```html
<!-- Before -->
<a href="ARTICLE_1_URL_HERE" ...>Read more ...</a>

<!-- After -->
<a href="https://techsverige.se/en/new-swedish-startup-secures-funding" ...>Read more ...</a>
```

---

## 🎯 Quick Update Checklist

For **each** of the 3 articles, replace:

- [ ] **Title link URL** → `href="YOUR_ARTICLE_URL"`
- [ ] **Title text** → Between `>` and `</a>`
- [ ] **Image link URL** → `href="YOUR_ARTICLE_URL"` (same as title)
- [ ] **Description text** → Between `<p>` and `</p>`
- [ ] **Read more URL** → `href="YOUR_ARTICLE_URL"` (same as title)

---

## 🔍 Find & Replace Method (FASTEST!)

Use your code editor's **Find & Replace** feature:

### For Article 1:
1. Find: `ARTICLE_1_URL_HERE`
2. Replace All with: `https://techsverige.se/en/your-actual-article-url`
3. Manually update the title text and description

### For Article 2:
1. Find: `ARTICLE_2_URL_HERE`
2. Replace All with: `https://techsverige.se/en/your-actual-article-url`
3. Manually update the title text and description

### For Article 3:
1. Find: `ARTICLE_3_URL_HERE`
2. Replace All with: `https://techsverige.se/en/your-actual-article-url`
3. Manually update the title text and description

---

## 🖼️ Optional: Update Images

If you want to use different images for each article:

1. Save new images as `News1.png`, `News2.png`, `News3.png`
2. Place them in the same folder as `email-template.html`
3. They will automatically appear (no code changes needed!)

**Recommended image size:** 1120px × 600px (or 2:1 ratio)

---

## ✅ Testing Your Updates

Before sending your email:

1. **Open `email-template.html` in a browser**
   - All images should display
   - All links should work
   
2. **Click each title, image, and "Read more" button**
   - They should all open the correct article
   - They should open in a new tab

3. **Test in email clients**
   - Send a test to yourself in Gmail
   - Check on mobile devices

---

## 💡 Pro Tips

✨ **Save Time:**
- Keep a document with your 3 articles ready before editing
- Use Find & Replace for URLs (faster than manual)
- Copy & paste descriptions from the original articles

⚠️ **Important Notes:**
- All 3 instances of each article URL must match (title, image, read more button)
- Keep descriptions concise (1-3 sentences max)
- Test links before sending the email

🔄 **Consistency:**
- Try to keep article descriptions around the same length
- Maintain a similar tone across all three articles
- Update the same day/time each week

---

## 📞 Need Help?

If you encounter issues:

1. **Links not working?** → Make sure you updated ALL 3 URL locations for each article
2. **Images not showing?** → Ensure image files are in the same folder
3. **Formatting looks off?** → Check you only changed the text/URLs, not the HTML tags

---

## 🚀 Quick Reference

**File to Edit:** `email-template.html`

**Search for:**
- `ARTICLE_1_URL_HERE` (appears 3 times)
- `ARTICLE_2_URL_HERE` (appears 3 times)
- `ARTICLE_3_URL_HERE` (appears 3 times)

**What to Update:**
1. Title text
2. Title link URL (3 places per article)
3. Description text

**Time Estimate:** 10-15 minutes per week

---

## 📋 Example Weekly Workflow

1. Monday morning: Browse https://techsverige.se/en/
2. Select 3 interesting articles
3. Copy titles, URLs, and create brief descriptions
4. Open `email-template.html`
5. Use Find & Replace for each article's URLs
6. Update titles and descriptions
7. Save and test in browser
8. Send test email to yourself
9. Send to mailing list ✅

---

**Last Updated:** November 2025
**Template Version:** 1.0
**Maintained by:** Focalpay Marketing Team

