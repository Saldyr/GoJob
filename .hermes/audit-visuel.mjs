// Audit visuel GoJob — capture tous les écrans
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';
const DIR = '.hermes/screenshots';

async function shot(page, name, { fullPage = false } = {}) {
  const path = `${DIR}/${name}.png`;
  await page.screenshot({ path, fullPage });
  console.log(`📸 ${path}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Accueil
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // laisser les animations
  await shot(page, '01-accueil');

  // 2. Onglet Offres
  await page.goto(`${BASE}/?tab=offres`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await shot(page, '02-offres');

  // 3. Onglet Paramètres
  await page.goto(`${BASE}/?tab=parametres`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await shot(page, '03-parametres');

  // 4. Full page scroll de l'accueil
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await shot(page, '04-accueil-full', { fullPage: true });

  // 5. Métriques visuelles : mesurer les couleurs des éléments clés
  const metrics = await page.evaluate(() => {
    const styles = getComputedStyle(document.body);
    const sidebar = document.querySelector('aside, nav, [class*="sidebar"], [class*="Sidebar"]');
    const sidebarBg = sidebar ? getComputedStyle(sidebar).background : 'n/a';
    const card = document.querySelector('[class*="card"], [class*="Card"], [class*="offre"], [class*="Offre"]');
    const cardBg = card ? getComputedStyle(card).background : 'n/a';
    return {
      bodyBg: styles.background,
      bodyColor: styles.color,
      sidebarBg,
      cardBg,
      bodyFont: styles.fontFamily,
    };
  });

  writeFileSync(`${DIR}/metrics.json`, JSON.stringify(metrics, null, 2));
  console.log('📊 Métriques visuelles:', JSON.stringify(metrics, null, 2));

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
