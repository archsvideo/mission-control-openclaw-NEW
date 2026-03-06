#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function argsAfter(name) {
  const i = process.argv.indexOf(name);
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < process.argv.length; j++) {
    if (process.argv[j].startsWith('--')) break;
    out.push(process.argv[j]);
  }
  return out;
}

const copyPath = arg('--copy');
const images = argsAfter('--images');
const verifyTextArg = arg('--verify-text');

if (!copyPath || !images.length) {
  console.error('Usage: node scripts/linkedin_publish.mjs --copy <copy.txt> --images <img1> <img2> ...');
  process.exit(1);
}

const copy = fs.readFileSync(copyPath, 'utf8');
const verifyText = (verifyTextArg || copy.split('\n').find(Boolean) || '').trim();
for (const p of images) {
  if (!fs.existsSync(p)) throw new Error(`Missing image: ${p}`);
}

const cdpUrl = process.env.OPENCLAW_CDP_URL || 'ws://127.0.0.1:18792/cdp';
let browser;
let page;

try {
  // Prefer attaching to existing Chrome session (already logged in LinkedIn).
  browser = await chromium.connectOverCDP(cdpUrl);
  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error('No CDP contexts found');
  const linkedin = ctx.pages().find(p => p.url().includes('linkedin.com'));
  page = linkedin ?? await ctx.newPage();
  console.log(`Connected over CDP: ${cdpUrl}`);
} catch {
  // Fallback: isolated Chrome profile for manual login if needed.
  const userDataDir = path.join(process.cwd(), 'tmp', 'chrome-autopublish-profile');
  fs.mkdirSync(userDataDir, { recursive: true });
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1400, height: 950 },
    args: ['--disable-gpu', '--disable-software-rasterizer'],
  });
  browser = ctx;
  page = ctx.pages()[0] ?? await ctx.newPage();
  console.log('Using fallback persistent profile:', userDataDir);
}

try {
  console.log('[1/6] Open LinkedIn feed');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });

  // If login wall appears, abort cleanly.
  if (await page.locator('input[name="session_key"]').count()) {
    throw new Error('LinkedIn login required in this profile.');
  }

  console.log('[2/6] Open image post composer');
  const photoLink = page.getByRole('link', { name: /foto|photo/i }).first();
  await photoLink.click({ timeout: 15000 });

  console.log('[3/6] Upload images with setInputFiles');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(images);

  console.log('[4/6] Continue to editor');
  const uploadDialog = page.getByRole('dialog').filter({ hasText: /selecciona archivos|editor|create a post|crear publicación/i }).first();

  const editorLocator = page
    .locator('div[role="textbox"][contenteditable="true"], div.ql-editor[contenteditable="true"], [data-placeholder*="comparte" i][contenteditable="true"]')
    .first();

  for (let i = 0; i < 3; i++) {
    const hasEditor = await editorLocator.isVisible().catch(() => false);
    if (hasEditor) break;
    const nextInDialog = uploadDialog.getByRole('button', { name: /siguiente|next/i }).last();
    await nextInDialog.click({ timeout: 15000, force: true });
    await page.waitForTimeout(1200);
  }

  await page.screenshot({ path: path.join(process.cwd(), 'tmp', 'linkedin_publish', 'after-next.png'), fullPage: true }).catch(() => {});

  console.log('[5/6] Paste copy');
  const editor = editorLocator;
  await editor.waitFor({ state: 'visible', timeout: 30000 });
  await editor.click({ timeout: 15000 });
  await editor.fill(copy);

  console.log('[6/6] Publish');
  const publishBtn = page.getByRole('button', { name: /publicar|post/i }).first();
  await publishBtn.click({ timeout: 20000, force: true });
  // ensure publish actually completed
  await page.waitForFunction(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')].find(d => /editor|crear publicación|create a post/i.test(d.innerText || ''));
    return !dlg;
  }, { timeout: 30000 }).catch(() => { throw new Error('Publish click did not close composer dialog'); });

  await page.waitForTimeout(5000);

  if (verifyText) {
    console.log('[7/7] Verify in recent activity');
    await page.goto('https://www.linkedin.com/in/oscar-leon-archs/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    let found = false;
    for (let i = 0; i < 20; i++) {
      const bodyText = (await page.locator('body').innerText()).toLowerCase();
      if (bodyText.includes(verifyText.toLowerCase())) {
        found = true;
        break;
      }
      await page.waitForTimeout(1500);
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
    await page.screenshot({ path: path.join(process.cwd(), 'tmp', 'linkedin_publish', 'verify-proof.png'), fullPage: true }).catch(() => {});
    if (!found) throw new Error(`Published but verify text not found in activity: "${verifyText}"`);
  }

  console.log('SUCCESS: Post published and verified.');
} catch (err) {
  console.error('FAILED:', err.message);
  process.exitCode = 2;
} finally {
  // Keep browser open briefly for manual verification.
  await page.waitForTimeout(1500);
  await browser.close();
}
