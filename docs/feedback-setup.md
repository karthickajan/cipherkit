# CipherKit Feedback System — Backend Setup

This guide walks you through setting up the Google Sheets + Apps Script backend for the CipherKit feedback widget.

## Overview

The feedback system uses:
- **Frontend**: `src/assets/js/feedback.js` + `src/assets/css/feedback.css`
- **Backend**: Google Sheets + Apps Script Web App (no authentication required)

All feedback data (passive votes, feedback, error reports) flows into a single Google Sheet with these columns:

| Timestamp | Type | Tool | Rating | Comment | Error Message | Input Snapshot | User Agent | URL |
|-----------|------|------|--------|---------|---------------|----------------|------------|-----|

---

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a **new blank spreadsheet**
3. Name it `CipherKit Feedback`
4. In **row 1**, add these column headers (copy-paste the entire row):

```
Timestamp	Type	Tool	Rating	Comment	Error Message	Input Snapshot	User Agent	URL
```

5. (Optional) Format the header row: **bold**, background color, freeze row

---

## Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions → Apps Script**
2. A new tab will open with the Apps Script editor
3. Delete any default code in `Code.gs`

---

## Step 3: Paste the Apps Script Code

Copy and paste this **complete code** into `Code.gs`:

```javascript
function doPost(e) {
  try {
    // Parse incoming JSON
    const data = JSON.parse(e.postData.contents);
    
    // Get the active sheet (first sheet in the spreadsheet)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the data
    sheet.appendRow([
      new Date().toISOString(),                    // Timestamp
      data.type || '',                             // Type (passive_vote, feedback, error_report)
      data.tool || '',                             // Tool name
      data.rating || data.vote || '',              // Rating (positive/negative) or vote (up/down)
      data.comment || '',                          // Optional comment
      data.errorMessage || '',                     // Error message (for error reports)
      JSON.stringify(data.inputSnapshot || {}),    // Input data snapshot (JSON string)
      data.userAgent || '',                        // Browser user agent
      data.url || ''                               // Page URL
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'Feedback received' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    Logger.log('Error processing feedback: ' + error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **💾 Save** (or `Ctrl+S` / `Cmd+S`)
5. Name the project `CipherKit Feedback Handler`

---

## Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the ⚙️ **gear icon** next to "Select type"
3. Choose **Web app**
4. Configure deployment settings:
   - **Description**: `CipherKit Feedback v1`
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** ← **IMPORTANT!** (this allows public access without login)
5. Click **Deploy**
6. You may see a warning: "This app isn't verified"
   - Click **Advanced**
   - Click **Go to [Your Project Name] (unsafe)** — it's safe because you wrote the code
   - Click **Allow** to grant permissions
7. **Copy the Web App URL** — it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
8. **SAVE THIS URL!** You'll need it in the next step.

---

## Step 5: Update the Frontend Code

1. Open `src/assets/js/feedback.js`
2. Find this line near the top:
   ```javascript
   const FEEDBACK_ENDPOINT = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the Web App URL you copied:
   ```javascript
   const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file
5. Run `node build.js` to regenerate the `docs/` folder
6. Commit and push to GitHub

---

## Step 6: Test the System

1. Visit any tool page on your deployed site (e.g., `https://karthickajan.github.io/cipherkit/tools/base64-encode/`)
2. You should see:
   - **Passive bar** at the bottom: "Was this tool helpful?"
   - **FAB button** (floating chat bubble) in the bottom-right corner
3. Test the passive bar:
   - Click **Yes** or **No**
   - Check your Google Sheet — a new row should appear with Type = `passive_vote`
4. Test the FAB feedback:
   - Click the FAB button
   - Click a thumbs up/down
   - Optionally add a comment
   - Click **Send feedback**
   - Check your Google Sheet — a new row with Type = `feedback`
5. Test error reporting:
   - In your browser console, run:
     ```javascript
     window.CKFeedback.reportError('Test error message', { 'Test Input': 'Sample data' });
     ```
   - The FAB should turn red and pulse
   - Click it, toggle "Include my input", and submit
   - Check your Google Sheet — a new row with Type = `error_report`

---

## Data Structure Reference

### Passive Vote
```json
{
  "type": "passive_vote",
  "tool": "Base64 Encoder",
  "vote": "up",
  "ts": "2026-04-09T01:23:45.678Z"
}
```

### Feedback
```json
{
  "type": "feedback",
  "tool": "JWT Decoder",
  "rating": "positive",
  "comment": "Very useful!",
  "userAgent": "Mozilla/5.0...",
  "url": "https://...",
  "ts": "2026-04-09T01:23:45.678Z"
}
```

### Error Report
```json
{
  "type": "error_report",
  "tool": "SHA-256 Generator",
  "errorMessage": "Cannot read properties of undefined",
  "comment": "I was hashing a large file",
  "inputSnapshot": {
    "Input": "Sample text that caused the error..."
  },
  "userAgent": "Mozilla/5.0...",
  "url": "https://...",
  "ts": "2026-04-09T01:23:45.678Z"
}
```

---

## Troubleshooting

### "This app isn't verified" warning during deployment
- **Expected behavior**. Click "Advanced" → "Go to [Project] (unsafe)" → "Allow"
- This is safe because you wrote the code yourself

### No data appearing in the sheet
1. Open Apps Script editor → **Executions** (left sidebar)
2. Check for errors in recent executions
3. Verify the Web App URL in `feedback.js` is correct
4. Check browser console for network errors (`Ctrl+Shift+J` / `Cmd+Option+J`)

### CORS errors in browser console
- Apps Script Web Apps use `mode: 'no-cors'` in the fetch request
- This is normal — the request still succeeds, but the response is opaque
- Check your Google Sheet to confirm data is arriving

### Want to redeploy after making changes
1. Edit the Apps Script code
2. Click **Deploy → Manage deployments**
3. Click ✏️ **Edit** on your existing deployment
4. Change **Version** to "New version"
5. Click **Deploy**
6. The Web App URL stays the same — no need to update `feedback.js`

---

## Security & Privacy Notes

- ✅ **No authentication required** — anyone can POST to the endpoint (by design)
- ✅ **Input data is opt-in only** — users must toggle "Include my input" before it's sent
- ✅ **No PII collected** — only tool name, browser type, and optional comments
- ✅ **File content never sent** — only metadata (filename, type, size in KB)
- ⚠️ **Rate limiting**: Consider adding rate limiting in Apps Script if you see spam
  ```javascript
  // Example: limit to 100 submissions per hour per IP (not implemented by default)
  ```

---

## Need Help?

- Check the [Apps Script documentation](https://developers.google.com/apps-script/guides/web)
- Open an issue on the [CipherKit GitHub repo](https://github.com/karthickajan/cipherkit/issues)
