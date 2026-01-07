import { chromium } from '@playwright/test';

async function recordJiraLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 Opening Jira...');
  await page.goto('https://robertoschmidt.atlassian.net');
  
  console.log('📄 Waiting for login page...');
  await page.waitForLoadState('domcontentloaded');
  
  // Check if already logged in
  const url = page.url();
  console.log('Current URL:', url);
  
  if (!url.includes('login') && !url.includes('id.atlassian.com')) {
    console.log('✅ Already logged in to Jira!');
  } else {
    console.log('🔐 Please login manually...');
    console.log('I will wait for you to complete the login.');
    
    // Wait for navigation after login
    await page.waitForURL('**/atlassian.net/**', { timeout: 0 }).catch(() => {
      console.log('⚠️ No navigation detected. Please login manually.');
    });
  }
  
  // Save the authentication state
  const statePath = 'playwright/.auth/state.json';
  await context.storageState({ path: statePath });
  console.log('✅ Authentication state saved to:', statePath);
  
  await browser.close();
  console.log('🎉 Done!');
}

recordJiraLogin().catch(console.error);
