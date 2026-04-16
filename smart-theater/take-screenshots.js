const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Screenshot 1: Homepage top
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/01-home-top.png' });

  // Screenshot 2: Scroll down to featured shows
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/02-home-featured.png' });

  // Screenshot 3: Scroll more
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/03-home-stats.png' });

  // Screenshot 4: Shows page
  await page.goto('http://localhost:3000/shows', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/04-shows.png' });

  // Screenshot 5: Show detail
  await page.goto('http://localhost:3000/show/show-001', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/05-show-detail.png' });

  // Screenshot 6: Venue
  await page.goto('http://localhost:3000/venue', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/06-venue.png' });

  // Screenshot 7: Schedule
  await page.goto('http://localhost:3000/schedule', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/07-schedule.png' });

  // Screenshot 8: About
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/08-about.png' });

  // Screenshot 9: Contact
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/09-contact.png' });

  if (errors.length) {
    console.log('Browser errors:', errors.join('\n'));
  }

  console.log('Done! Screenshots saved.');
  await browser.close();
})();
