import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await new Promise(r => setTimeout(r, 2000));

// Naviguer vers Paramètres
await page.click('text=Paramètres');
await new Promise(r => setTimeout(r, 1000));

// Prendre un screenshot pour référence
await page.screenshot({ path: '.hermes/screenshots/check-boutons.png' });

// Récupérer les styles computed du premier bouton primaire
const result = await page.evaluate(() => {
  const boutons = document.querySelectorAll('button');
  const resultats = [];
  for (const btn of boutons) {
    const text = btn.textContent?.trim().substring(0, 30);
    const style = window.getComputedStyle(btn);
    resultats.push({
      text,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      background: style.background,
      color: style.color,
      border: style.border,
      boxShadow: style.boxShadow,
      className: btn.className,
    });
  }
  return resultats;
});

console.log('=== Résultats styles boutons ===');
for (const r of result) {
  console.log(`\n[${r.text}]`);
  console.log(`  className: ${r.className}`);
  console.log(`  backgroundImage: ${r.backgroundImage}`);
  console.log(`  backgroundColor: ${r.backgroundColor}`);
  console.log(`  color: ${r.color}`);
  console.log(`  border: ${r.border}`);
}

await browser.close();
