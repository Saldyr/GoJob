import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('pageerror', err => console.log('ERR:', err.message));

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForSelector('#root > *', { timeout: 10000 });

// Passer l'onboarding modal
const passerBtn = page.locator('button:has-text("Passer"), button:has-text("Skip")').first();
if (await passerBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await passerBtn.click();
  console.log('✅ Onboarding passé');
  await page.waitForTimeout(1500);
}

// Vérifier l'accueil
const allText = await page.locator('body').innerText();
console.log('Texte visible (400 chars):', allText.substring(0, 400));

const checks = [
  'Offres',
  'Ajouter une offre',
  'Démarre en 3 clics',
  'Générer une lettre',
  'Importer des offres',
  'Importer depuis ma boîte mail',
  'France Travail',
];
checks.forEach(c => console.log(allText.includes(c) ? `✅ "${c}"` : `❌ "${c}" absent`));

await page.screenshot({ path: 'test-screenshots/01-accueil.png', fullPage: true });

// Navigation : Offres
const navOffres = page.locator('nav a, nav button, [role="navigation"] button').filter({ hasText: /Offres/ }).first();
if (await navOffres.isVisible({ timeout: 2000 }).catch(() => false)) {
  await navOffres.click();
  await page.waitForTimeout(1000);
  const offresText = await page.locator('body').innerText();
  console.log(offresText.includes('Offres d\'emploi') ? '✅ Page Offres' : '⚠️ Page Offres?');
  await page.screenshot({ path: 'test-screenshots/02-offres.png', fullPage: true });
}

// Paramètres
const navParams = page.locator('nav a, nav button, [role="navigation"] button').filter({ hasText: /Paramètres/ }).first();
if (await navParams.isVisible({ timeout: 2000 }).catch(() => false)) {
  await navParams.click();
  await page.waitForTimeout(1000);
  console.log('✅ Page Paramètres');
  await page.screenshot({ path: 'test-screenshots/03-parametres.png', fullPage: true });
}

console.log('\n✅ Tests terminés');
await browser.close();