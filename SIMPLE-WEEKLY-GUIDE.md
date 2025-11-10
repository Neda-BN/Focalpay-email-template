# 📧 SUPER SIMPLE Weekly Email Update Guide
## (No Coding Skills Needed!)

---

## ⏰ Time Needed: 10 minutes per week

---

## 📋 WHAT YOU NEED BEFORE STARTING:

From each news article website, collect:
1. ✅ The website address (URL) - copy from browser address bar
2. ✅ The article title - copy from the article
3. ✅ A short summary (2-3 sentences) - write it yourself or copy from article
4. ✅ The main image - right-click and "Save Image As..."

---

## 🎯 STEP-BY-STEP PROCESS:

### STEP 1: Prepare Your Images (5 minutes)

#### What to do:
1. Open the first news article in your browser
2. Find the main article image
3. **Right-click** on the image
4. Click **"Save Image As..."**
5. Save it with this **EXACT** name: `News1.png`
6. Save it **in the same folder** as your email-template.html

#### Repeat for all 4 articles:
- Article 1 image → Save as `News1.png`
- Article 2 image → Save as `News2.png`  
- Article 3 image → Save as `News3.png`
- Article 4 image → Save as `News4.png`

⚠️ **IMPORTANT - IMAGE SIZE REQUIREMENT:**
**ALL news images (News1.png, News2.png, News3.png, News4.png) MUST have the SAME dimensions as News1.png.**

**How to check and resize images:**
1. **Check News1.png size:** Right-click on News1.png → Get Info (Mac) or Properties (Windows)
2. Note the dimensions (e.g., 800 x 600 pixels)
3. **For all other news images:** Make sure they match News1.png dimensions
4. **To resize images:**
   - **Mac:** Open image in Preview → Tools → Adjust Size → Enter News1.png dimensions
   - **Windows:** Open image in Photos → Resize → Enter News1.png dimensions
   - **Online tool:** Use https://www.iloveimg.com/resize-image (free, no signup needed)

💡 **TIP:** Replace the old News1.png, News2.png, News3.png, News4.png files - just overwrite them!

---

### STEP 2: Write Down Your Article Info

Open a Word document or Notes and write:

```
ARTICLE 1:
URL: [paste the website address]
Title: [copy the headline]
Summary: [write 2-3 sentences]

ARTICLE 2:
URL: [paste the website address]
Title: [copy the headline]
Summary: [write 2-3 sentences]

ARTICLE 3:
URL: [paste the website address]
Title: [copy the headline]
Summary: [write 2-3 sentences]
```

Save this for reference!

---

### STEP 3: Update Article URLs (2 minutes)

#### For Article 1:

1. Open `email-template.html` in **TextEdit** (Mac) or **Notepad** (Windows)
2. Press **Cmd+F** (Mac) or **Ctrl+F** (Windows) to open Find
3. Type: `ARTICLE_1_URL_HERE`
4. Click **"Find"**
5. When it highlights, **delete** `ARTICLE_1_URL_HERE`
6. **Paste** your Article 1 URL
7. Click **"Find"** again - do this 2 more times (there are 3 places to update)

#### Repeat for Articles 2 & 3:
- Search for: `ARTICLE_2_URL_HERE` (replace 3 times)
- Search for: `ARTICLE_3_URL_HERE` (replace 3 times)

---

### STEP 4: Update Article Titles (2 minutes)

#### For Article 1:

1. Press **Cmd+F** (Mac) or **Ctrl+F** (Windows)
2. Type: `Article 1 Title Goes Here`
3. When it highlights, **delete** it
4. **Paste** or type your real article title

#### Repeat for Articles 2 & 3:
- Find and replace: `Article 2 Title Goes Here`
- Find and replace: `Article 3 Title Goes Here`

---

### STEP 5: Update Article Descriptions (2 minutes)

#### For Article 1:

1. Press **Cmd+F** (Mac) or **Ctrl+F** (Windows)
2. Type: `Article 1 description goes here`
3. When it highlights, **select ALL the placeholder text**
4. **Delete** it
5. **Paste** or type your 2-3 sentence summary

#### Repeat for Articles 2 & 3:
- Find and replace: `Article 2 description goes here`
- Find and replace: `Article 3 description goes here`

---

### STEP 6: Save & Test! ✅

1. **Save** the file (Cmd+S or Ctrl+S)
2. **Double-click** `email-template.html` to open in browser
3. **Check:**
   - ✅ All images show
   - ✅ All titles are correct
   - ✅ Click each title - opens correct article in new tab
   - ✅ Click each image - opens correct article in new tab
   - ✅ Click each "Read more" button - opens correct article in new tab

---

## 🎨 VISUAL CHECKLIST:

Before you start updating, have these ready:

- [ ] 3 news article images saved as News1.png, News2.png, News3.png
- [ ] 3 article URLs copied
- [ ] 3 article titles copied
- [ ] 3 article summaries written (2-3 sentences each)

---

## 💡 HELPFUL TIPS:

### Tip 1: Use Find & Replace
Instead of searching manually, use your text editor's Find & Replace feature:
- Mac: **Cmd+F** then switch to "Replace" mode
- Windows: **Ctrl+H** for direct Find & Replace

### Tip 2: Work in Order
Always update in this order:
1. Images (News1.png, News2.png, News3.png)
2. URLs (all 3 articles)
3. Titles (all 3 articles)
4. Descriptions (all 3 articles)

### Tip 3: Save Often
Press Cmd+S (Mac) or Ctrl+S (Windows) after each article to save your work!

### Tip 4: Keep a Template
Save your Word/Notes document with the format for gathering article info. Reuse it every week!

---

## ⚠️ THINGS TO NEVER CHANGE:

When editing `email-template.html`, **ONLY change:**
- ✅ The URL addresses (between the quote marks)
- ✅ The article titles (between `>` and `</a>`)
- ✅ The descriptions (between `<p>` and `</p>`)

**NEVER change:**
- ❌ Any words inside `< >` brackets
- ❌ The image filenames (keep as News1.png, News2.png, News3.png)
- ❌ Anything with `style=` or `href=` before it (except the URL itself)

---

## 🆘 TROUBLESHOOTING:

**Problem: Image doesn't show**
→ Make sure the image file is named EXACTLY `News1.png` (capital N, no spaces)
→ Make sure it's in the SAME folder as email-template.html

**Problem: Link doesn't work**
→ Check you pasted the full URL including `https://`
→ Make sure you updated all 3 places for each article

**Problem: Made a mistake?**
→ Don't panic! Close without saving
→ Open the file again and start over

**Problem: Text looks weird?**
→ You might have deleted something important
→ Use "Undo" (Cmd+Z or Ctrl+Z)
→ Or download a fresh copy from GitHub

---

## 📝 WEEKLY ROUTINE (10 Minutes):

**Monday Morning:**
1. ☕ Get coffee
2. 🔍 Find 3 interesting tech news articles (5 min)
3. 💾 Download 3 images, rename to News1.png, News2.png, News3.png (2 min)
4. 📝 Write article info in your Notes document (2 min)
5. ✏️ Update email-template.html using Find & Replace (3 min)
6. ✅ Test in browser (1 min)
7. 📧 Ready to send!

---

## 🎉 YOU'RE DONE!

Remember: You're just **replacing text** in specific places. You're not writing code - you're just updating content!

Think of it like filling in a form:
- **Blank 1:** Article URL
- **Blank 2:** Article title  
- **Blank 3:** Article description

You've got this! 💪

---

**Need Help?** Save this guide and refer back to it each week!

**Last Updated:** November 2025

