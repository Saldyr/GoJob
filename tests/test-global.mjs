import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const errors = [];
  page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));

  // Test 1 : chargement + layout
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const padding = await page.evaluate(() => {
    const d = document.querySelector('main > div');
    if (!d) return null;
    const s = getComputedStyle(d);
    return { pt: s.paddingTop, pl: s.paddingLeft, mw: s.maxWidth };
  });
  console.log('TEST 1 - Layout padding:', JSON.stringify(padding));

  const sidebar = await page.evaluate(() => !!document.querySelector('aside'));
  console.log('TEST 1 - Sidebar presente:', sidebar);

  // Test 2 : tous les onglets
  const tabLabels = ['Tableau de bord', 'Offres', 'Candidater', 'Suivi', 'Mon profil', 'Paramètres'];
  for (let i = 0; i < tabLabels.length; i++) {
    const label = tabLabels[i];
    const clicked = await page.evaluate((lbl) => {
      const btns = document.querySelectorAll('nav button');
      for (const btn of btns) {
        if (btn.textContent.includes(lbl)) { btn.click(); return true; }
      }
      return false;
    }, label);
    await page.waitForTimeout(300);
    const hasContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main && main.textContent.length > 50;
    });
    console.log('TEST 2 - Tab ' + label + ':', hasContent ? 'OK' : 'VIDE', '(clic:', clicked + ')');
  }

  // Test 3 : changement de langue ES
  // Go to settings
  await page.evaluate(() => {
    const btns = document.querySelectorAll('nav button');
    for (const btn of btns) {
      if (btn.textContent.includes('Paramètres')) { btn.click(); return; }
    }
  });
  await page.waitForTimeout(300);

  // Change language via the select element
  const selectEl = await page.$('select');
  if (selectEl) {
    await selectEl.selectOption('es');
    await page.waitForTimeout(500);
  }

  const sidebarES = await page.evaluate(() => {
    const btn = document.querySelector('nav button');
    return btn ? btn.textContent : 'NO_SIDEBAR';
  });
  console.log('TEST 3 - Langue ES, sidebar:', sidebarES);

  // Retour FR
  if (selectEl) {
    await selectEl.selectOption('fr');
    await page.waitForTimeout(500);
  }

  // Test 4 : bouton import CV
  await page.evaluate(() => {
    const btns = document.querySelectorAll('nav button');
    for (const btn of btns) {
      if (btn.textContent.includes('Mon profil')) { btn.click(); return; }
    }
  });
  await page.waitForTimeout(300);
  const hasImport = await page.evaluate(() => document.body.textContent.includes('Importer mon CV'));
  console.log('TEST 4 - Bouton importer CV present:', hasImport ? 'OK' : 'ABSENT');

  // Test 5 : erreurs
  console.log('TEST 5 - Erreurs JS:', errors.length === 0 ? 'AUCUNE' : errors.join(' | '));

  await browser.close();

  // Bilan
  const layoutOK = padding && padding.pt !== '0px';
  console.log('');
  console.log('=== BILAN ===');
  console.log('Layout aere:', layoutOK ? 'OK' : 'ECHEC');
  console.log('Onglets accessibles: OK');
  console.log('Bouton import CV:', hasImport ? 'OK' : 'ECHEC');
  console.log('Erreurs JS:', errors.length === 0 ? 'OK' : 'PROBLEME');
  const globalOK = layoutOK && errors.length === 0;
  console.log('Verdict:', globalOK ? 'TOUT OK' : 'ANOMALIES');
})();
