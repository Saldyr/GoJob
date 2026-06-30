import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 300, height: 300 } })
  
  const htmlPath = join(publicDir, 'icon-render.html')
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`)
  await page.waitForTimeout(500)
  
  // Screenshot 256x256
  await page.screenshot({ 
    path: join(publicDir, 'icon-256.png'),
    clip: { x: 22, y: 22, width: 256, height: 256 }
  })
  
  await browser.close()
  console.log('✅ icon-256.png created')
}

main().catch(console.error)
