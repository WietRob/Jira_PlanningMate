# Jira Planning Mate - CI/CD Setup

Automated testing and deployment pipeline for the Jira Planning Mate Forge application.

## 🚀 Quick Start

### 1. Record Playwright Authentication

Before running tests, you need to record your Jira login state:

```bash
./setup-auth.sh
```

This will:
1. Open a browser window
2. Login to your Jira instance
3. Save the authentication state to `playwright/.auth/state.json`

### 2. Run Tests Locally

```bash
npm test
```

### 3. Deploy to Forge

```bash
npm run forge:deploy
```

---

## 📁 Project Structure

```
.
├── playwright/
│   ├── config.ts           # Playwright configuration
│   └── .auth/
│       └── state.json      # Jira login state (generated)
├── tests/
│   └── forge.spec.ts       # Forge app tests
├── .github/
│   └── workflows/
│       └── forge.yml       # GitHub Actions pipeline
├── jira-plugin/            # Forge app directory
│   ├── manifest.yml
│   ├── src/
│   └── static/
└── package.json
```

---

## 🔧 Configuration

### GitHub Secrets

Set these in GitHub → Settings → Secrets → Actions:

| Secret | Description |
|--------|-------------|
| `FORGE_EMAIL` | Your Atlassian account email |
| `FORGE_API_TOKEN` | Atlassian API token |
| `PLAYWRIGHT_STATE` | Base64-encoded Playwright auth state |

To generate `PLAYWRIGHT_STATE`:

```bash
# After running setup-auth.sh
base64 playwright/.auth/state.json
```

---

## 🧪 Available Tests

### Forge App Tests (`tests/forge.spec.ts`)

- **Global Page Loading**: Verifies the app loads without platform errors (GLSQ4W)
- **Jira Integration**: Tests app accessibility from Jira navigation
- **Resource Loading**: Checks that static resources are loaded in iframe context
- **Error Handling**: Verifies graceful handling of missing resources
- **Memory Leaks**: Tests for memory issues from repeated loads
- **UI Rendering**: Validates React app renders content correctly

---

## 📜 Available Scripts

### Testing

```bash
npm test                  # Run all Playwright tests
npm run test:ui          # Run tests with UI
npm run test:report      # Show test report
npm run test:install     # Install Playwright browsers
```

### Authentication

```bash
./setup-auth.sh          # Record Jira login state
npm run auth:encode      # Encode auth state for CI
```

### Forge Operations

```bash
npm run forge:lint       # Lint Forge manifest
npm run forge:deploy     # Deploy to development
npm run forge:install    # Install app in Jira
npm run forge:logs       # View Forge logs
npm run forge:tunnel     # Start development tunnel
```

### Build

```bash
npm run build           # Build functions and UI
npm run build:functions # Build only functions
npm run build:ui        # Build only UI
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/forge.yml`) runs:

1. **Lint** - Validate Forge manifest
2. **Build** - Compile functions and UI
3. **Deploy** - Deploy to development environment
4. **Test** - Run Playwright tests
5. **Logs** - Check for errors in Forge logs

### Pipeline Triggers

- **Push** to `main`/`master`: Full pipeline
- **Pull Request**: Lint + Build + Test (no deploy)
- **Manual**: Full pipeline via workflow dispatch

---

## 🎯 Test Strategy

### What We Test

1. **No Platform Errors**: Verify no GLSQ4W or "Something went wrong"
2. **React Rendering**: Confirm `#root` element is visible
3. **Resource Loading**: Check resources load in iframe context
4. **Error Handling**: Verify proper handling of missing resources
5. **Performance**: Test for memory leaks from repeated loads

### What We Don't Test

- Direct resource URLs (these are NOT publicly accessible in Forge)
- External API calls (handled by backend resolver)
- Visual regressions (consider adding in future)

---

## 🔒 Security Notes

- Playwright auth state contains session cookies - treat as sensitive
- Never commit `playwright/.auth/state.json` to git
- Use GitHub secrets for CI authentication
- Forge API tokens have full app access - rotate if compromised

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Forge CLI Reference](https://developer.atlassian.com/platform/forge/cli-reference/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🚨 Troubleshooting

### Tests Failing with Authentication Error

1. Re-run `./setup-auth.sh`
2. Ensure you're logged into the correct Jira instance
3. Check that `playwright/.auth/state.json` exists

### Forge Deploy Fails

1. Run `npm run forge:lint` to check for manifest errors
2. Verify `FORGE_EMAIL` and `FORGE_API_TOKEN` secrets are correct
3. Check Forge status at https://status.atlassian.com/

### Tests Timeout

1. Increase timeout in `playwright.config.ts`
2. Check Jira instance responsiveness
3. Verify no network issues

---

## 📈 Future Improvements

- [ ] Add visual regression tests
- [ ] Add API mock tests
- [ ] Setup staging environment
- [ ] Add canary deployment
- [ ] Implement performance benchmarks
