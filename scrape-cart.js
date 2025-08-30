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
    // Block heavy resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    }); 

  // Spoof mobile
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36'
  )

const waitForCart = page.waitForResponse(res =>
  res.url().includes("/bff-api/order/cart/share/landing")
);

  await page.goto(url,{ waitUntil: "domcontentloaded" })
const response = await waitForCart;  
const cartData = await response.json(); 
  console.log(cartData);

  await browser.close();
  return cartData;
}

// Usage
/* ;(async () => {
  const url = 'https://m.shein.com/ar-en/cart/share/landing?countryCode=SA&group_id=500990230&local_country=DZ'
  await scrapeCart(url)
})()
  */
