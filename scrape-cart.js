import puppeteer from 'puppeteer'
import dotenv from 'dotenv';
dotenv.config();

export async function scrapeCart(url) {
  const browser = await puppeteer.launch({ 
       args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  
  })
  const page = await browser.newPage()

  // Spoof mobile
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  )
  await page.setViewport({ width: 390, height: 844, isMobile: true })

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

  // Wait until cart content is there
  await page.waitForSelector('.csl-cart-list')

  const products = await page.evaluate(() => {
    return [...document.querySelectorAll('.csl-cart-item')].map(item => {
      const title = item.querySelector('.bsc-cart-item-goods-title__content')?.innerText.trim() || null
      const link = item.querySelector('.bsc-cart-item-goods-title__content')?.getAttribute('href') || null
      const image = item.querySelector('.bsc-cart-item-goods-img__content img')?.src || null
      const price = item.querySelector('.bsc-cart-item-goods-price__sale-price')?.innerText.trim() || null
      const attr = item.querySelector('.bsc-cart-item-goods-sale-attr__text')?.innerText.trim() || null

      return { title, link, image, price, attr }
    })
  })

  console.log('🛒 Extracted products:', products)
  await browser.close()
  return products
  
}

// Usage
/* ;(async () => {
  const url = 'https://m.shein.com/cart/share/landing?group_id=500990230&local_country=DZ'
  await scrapeCart(url)
})()
 */
