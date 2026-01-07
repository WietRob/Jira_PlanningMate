# GitHub Secrets Setup Required

The CI/CD pipeline needs these secrets to run:

## 1. FORGE_EMAIL ✅ Already Set
```
robertoschmidt2706@gmail.com
```

## 2. FORGE_API_TOKEN ❌ Required

**Steps to get your API Token:**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token (starts with `ATATT...`)

**Set in GitHub:**
```bash
gh secret set FORGE_API_TOKEN --body "YOUR_API_TOKEN_HERE"
```

Or manually:
- GitHub → Settings → Secrets → Actions → New repository secret
- Name: `FORGE_API_TOKEN`
- Value: Your Atlassian API token

## 3. PLAYWRIGHT_STATE ❌ Required (Manual Step)

**You must do this manually in a browser:**

```bash
cd /home/roberto_schmidt/projects/Jira_PlanningMate
./setup-auth.sh
```

This will:
1. Open a browser window
2. Login to Jira (robertoschmidt2706@gmail.com)
3. Save authentication state to `playwright/.auth/state.json`

**Then encode and set:**
```bash
# Encode the auth state
base64 playwright/.auth/state.json

# Set in GitHub
gh secret set PLAYWRIGHT_STATE --body "PASTE_BASE64_OUTPUT_HERE"
```

## Verify Setup

```bash
# Check secrets
gh secret list

# Should show:
# FORGE_EMAIL      ✓
# FORGE_API_TOKEN  ✓ (after you set it)
# PLAYWRIGHT_STATE ✓ (after you set it)
```

## Troubleshooting

If tests fail with authentication errors:
1. Re-run `./setup-auth.sh`
2. Ensure you're logged into the correct Jira instance
3. Verify the `playwright/.auth/state.json` file exists
