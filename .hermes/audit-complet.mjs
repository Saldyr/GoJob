// Capture multi-onglets GoJob — clique sur les onglets pour capturer les vues réelles
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';
const DIR = '.hermes/screenshots';

async function shot(page, name) {
  const path = `${DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 ${path}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Capture Accueil
  await shot(page, 'v01-accueil');

  // Cliquer sur "Offres d'emploi" — trouver le lien/button dans la sidebar
  const offresLink = page.locator('a, button, [role="tab"]', { hasText: /offres|Offres/i });
  if (await offresLink.count() > 0) {
    await offresLink.first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await shot(page, 'v02-offres');
  }

  // Cliquer sur "Paramètres"
  const paramsLink = page.locator('a, button, [role="tab"]', { hasText: /param|Setting|Config/i });
  if (await paramsLink.count() > 0) {
    await paramsLink.first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await shot(page, 'v03-parametres');
  }

  // Test de contraste WCAG — mesurer RGB de tous les textes visibles
  const contrastData = await page.evaluate(() => {
    function luminance(r, g, b) {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function ratio(l1, l2) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const bodyMatch = bodyBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const [_, br, bg, bb] = bodyMatch ? bodyMatch.map(Number) : [0, 0, 0, 0];
    const bgLum = luminance(br, bg, bb);

    const results = [];
    const textEls = document.querySelectorAll('p, span, h1, h2, h3, h4, a, button, label, td, th, li, small');
    textEls.forEach(el => {
      const style = getComputedStyle(el);
      const color = style.color;
      const fontSize = parseFloat(style.fontSize);
      const bold = parseInt(style.fontWeight) >= 700;
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return;
      const [_, r, g, b] = match.map(Number);
      const textLum = luminance(r, g, b);
      const cr = ratio(bgLum, textLum);
      if (cr < 4.5 && !(bold && fontSize >= 14 && cr >= 3.0)) {
        // Determine if it's large text (>=18px or bold >=14px)
        const isLarge = fontSize >= 18 || (bold && fontSize >= 14);
        const minRequired = isLarge ? 3.0 : 4.5;
        if (cr < minRequired) {
          const text = el.textContent.trim().substring(0, 60);
          results.push({ text, cr: cr.toFixed(2), fontSize, bold, color, required: minRequired, tag: el.tagName });
        }
      }
    });
    return results.sort((a, b) => a.cr - b.cr).slice(0, 30);
  });

  writeFileSync(`${DIR}/wcag-contrast.json`, JSON.stringify(contrastData, null, 2));
  console.log(`\n🔍 Problèmes de contraste détectés : ${contrastData.length}`);
  if (contrastData.length > 0) {
    contrastData.slice(0, 10).forEach(d => console.log(`  - ${d.text} => ratio ${d.cr} (min: ${d.required}, ${d.fontSize}px, ${d.tag})`));
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
