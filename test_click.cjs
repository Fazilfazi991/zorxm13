const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Puppeteer browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:8080/seo-tools', { waitUntil: 'networkidle2' });
  
  // Try HeroSection URL
  console.log("Testing HeroSection URL Analyzer...");
  await page.type('input[placeholder="Enter your website URL..."]', 'https://example.com');
  const heroAnalyzeButton = await page.$('button[type="submit"]:not([disabled])');
  if (heroAnalyzeButton) {
    await heroAnalyzeButton.click();
    console.log("Clicked Hero! Waiting 3s...");
    await new Promise(r => setTimeout(r, 3000));
  }
  
  // Try to use SEORulesChecker
  console.log("Filling form...");
  const inputs = await page.$$('input[placeholder="e.g. SEO tips"]');
  if (inputs.length > 0) {
    await inputs[0].type('test keyword');
  }
  
  const textareas = await page.$$('textarea[placeholder="Paste your full article text or HTML here..."]');
  if (textareas.length > 0) {
    await textareas[0].type('This is a test article with more than five words.');
  }
  
  console.log("Clicking Analyze button in SEORulesChecker...");
  const buttons = await page.$$('button[type="submit"]:not([disabled])');
  if (buttons.length > 1) {
    await buttons[1].click();
    console.log("Clicked! Waiting for network/timeout...");
    await new Promise(r => setTimeout(r, 5000));
  } else {
    console.log("Could not find enabled Analyze button");
  }

  await browser.close();
  console.log("Done.");
})();
