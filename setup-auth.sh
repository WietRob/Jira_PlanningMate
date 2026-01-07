#!/bin/bash

# Playwright Authentication Setup Script
# This script helps you record the Jira login state for automated testing

set -e

echo "🎭 Playwright Authentication Setup"
echo "===================================="
echo ""
echo "This script will help you record your Jira login state."
echo "This is needed for running Playwright tests against your Forge app."
echo ""

# Check if playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Check if playwright is installed
if ! npx playwright --version &> /dev/null; then
    echo "📦 Installing Playwright..."
    npm install -D @playwright/test
    npx playwright install --with-deps chromium
fi

# Create auth directory if it doesn't exist
mkdir -p playwright/.auth

echo ""
echo "📝 Instructions:"
echo "----------------"
echo "1. A browser window will open"
echo "2. Login to: https://robertoschmidt.atlassian.net"
echo "3. Complete the login (MFA if enabled)"
echo "4. After login, close the browser window"
echo "5. Your login state will be saved to: playwright/.auth/state.json"
echo ""
echo "🚀 Starting browser..."
echo ""

# Start the codegen tool
npx playwright codegen \
    https://robertoschmidt.atlassian.net \
    --save-storage=playwright/.auth/state.json

echo ""
echo "✅ Authentication state saved!"
echo ""
echo "📦 To use this in CI, encode the state:"
echo "   npm run auth:encode"
echo ""
echo "🔐 Then add the output as PLAYWRIGHT_STATE secret in GitHub."
echo ""
echo "🧪 To test the setup:"
echo "   npm test"
echo ""
