# Jira Authentication - Manual Setup

Since automated browser setup isn't working due to browser version issues, follow these manual steps:

## Option 1: Export Cookies from Browser (Recommended)

### Using Chrome/Edge:
1. Install "Cookie Editor" extension:
   - Chrome: https://chrome.google.com/webstore/detail/cookied-editor/lopmfdbfclmcjfkmofcjmkecolcgbabj
   - Edge: https://microsoftedge.microsoft.com/addons/detail/cookie-editor-for-microsof/hdonnfjnedlmhggkjboleccljobocgbjk

2. Go to: https://robertoschmidt.atlassian.net

3. Login (complete MFA if required)

4. Click the Cookie Editor extension icon

5. Click "Export" → "Export as JSON"

6. Save the file as: `playwright/.auth/state.json`

### Using Firefox:
1. Install "Cookie Editor" add-on:
   https://addons.mozilla.org/firefox/addon/cookie-editor/

2. Follow same steps as Chrome above

---

## Option 2: Using curl (Advanced)

If you have your Atlassian session cookie:

1. Login to Atlassian in browser
2. Open DevTools (F12) → Network tab
3. Find any request to atlassian.net
4. Copy the `cloud.session.token` or `atlassian.account` cookie value
5. Create `playwright/.auth/state.json`:

```json
{
  "cookies": [
    {
      "name": "cloud.session.token",
      "value": "YOUR_COOKIE_VALUE_HERE",
      "domain": ".atlassian.net",
      "path": "/",
      "expires": -1,
      "httpOnly": false,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": []
}
```

---

## After Creating state.json

```bash
# 1. Encode for GitHub
base64 playwright/.auth/state.json

# 2. Set in GitHub
gh secret set PLAYWRIGHT_STATE --body "PASTE_BASE64_OUTPUT"
```

---

## Verify

```bash
# Test locally (if browser available)
npm test

# Check secrets
gh secret list
# Should show all 3:
# FORGE_EMAIL ✓
# FORGE_API_TOKEN ✓ (after you set it)
# PLAYWRIGHT_STATE ✓ (after you set it)
```

---

## Troubleshooting

### "browser too old" errors
- Use system Chrome/Chromium with latest version
- Or use Cookie Editor extension (works with any browser)

### "No authentication state" errors
- Verify `playwright/.auth/state.json` exists
- Check cookies are valid (not expired)
- Ensure domain is `.atlassian.net`

### Still not working
- Try logging out and back in to Atlassian
- Clear browser cookies before exporting
- Use Incognito/Private mode when logging in
