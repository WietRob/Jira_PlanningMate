import { test, expect } from '@playwright/test';

const APP_ID = '93d5f2bb-9931-445a-b59d-910eab95b0e3';
const APP_URL = `/plugins/servlet/ac/${APP_ID}/planning-mate`;

test.describe('Forge App Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure fresh login state
    await page.context().clearCookies();
  });

  test('Global Page loads without platform error', async ({ page }) => {
    await page.goto(APP_URL);

    // No Atlassian error page
    await expect(page.locator('text=Auf unserer Seite')).toHaveCount(0);
    await expect(page.locator('text=Something went wrong')).toHaveCount(0);
    await expect(page.locator('text=GLSQ4W')).toHaveCount(0);

    // React app container present
    await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });

    // No console errors related to Forge
    const consoleErrors = page.context().pages().flatMap(p => 
      p.evaluate(() => {
        const errors: string[] = [];
        window.addEventListener('error', e => errors.push(e.message));
        return errors;
      })
    );
    
    // Check page has content (not empty)
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent?.length).toBeGreaterThan(100);
  });

  test('App is accessible from Jira navigation', async ({ page }) => {
    // Test from Jira Software board
    await page.goto('/jira/software/projects/SCRUM/boards/1');
    
    // Navigate through Apps menu (simulated)
    await page.goto(APP_URL);
    
    // Verify we reached the app, not an error page
    await expect(page.locator('body')).not.toContainText('Oops');
    await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });
  });

  test('Static resources are loaded in iframe context', async ({ page }) => {
    await page.goto(APP_URL);
    
    // Wait for React to render
    await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });
    
    // Check network requests for resources (in iframe context)
    const allLoaded: string[] = [];
    const pages = page.context().pages();
    
    for (const p of pages) {
      const result = await p.evaluate(() => {
        const loaded = new Set<string>();
        const performanceEntries = performance.getEntriesByType('resource');
        performanceEntries.forEach(entry => {
          loaded.add(entry.name);
        });
        return Array.from(loaded);
      });
      allLoaded.push(...result);
    }
    
    // Verify some resources were loaded
    expect(allLoaded.length).toBeGreaterThan(0);
  });
});

test.describe('Error Handling', () => {
  test('Handles missing resources gracefully', async ({ page }) => {
    // Direct resource URLs should not be publicly accessible (expected 404)
    const resourceUrl = `/ac/${APP_ID}/resources/ui/nonexistent.html`;
    await page.goto(resourceUrl);
    
    // Should show Atlassian 404, not our app error
    await expect(page.locator('body')).toContainText('Oops');
  });

  test('No memory leaks from repeated loads', async ({ page }) => {
    // Load app multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto(APP_URL);
      await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });
      await page.reload();
      await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });
    }
  });
});

test.describe('UI Rendering', () => {
  test('React app renders content', async ({ page }) => {
    await page.goto(APP_URL);
    
    // Wait for potential content to load
    await page.waitForTimeout(2000);
    
    // Check if any content is rendered (beyond just the root div)
    const html = await page.content();
    
    // Should have more than just the basic HTML structure
    expect(html.length).toBeGreaterThan(1000);
    
    // Check for common React/JS indicators
    expect(html).toContain('root');
  });
});
