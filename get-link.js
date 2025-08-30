import puppeteer from 'puppeteer'
import dotenv from 'dotenv';
dotenv.config();

export const getLink = async (sharejumpUrl) => {
    const browser = await puppeteer.launch({

        defaultViewport: { width: 390, height: 844 }, // mobile viewport
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
    });

    const page = await browser.newPage();

    // Fake mobile device
    await page.setUserAgent(
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Mobile Safari/537.36'
    );

    console.log('🌍 Visiting sharejump URL:', sharejumpUrl);
    await page.goto(sharejumpUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Step 1: Extract shareId + localcountry from inline JSON
    const cartInfo = await page.evaluate(() => {
        const scripts = [...document.querySelectorAll('script')];
        for (const s of scripts) {
            if (s.innerText.includes('"shareId"')) {
                try {
                    const m = s.innerText.match(/var\s+shareInfo\s*=\s*(\{.*\});/);
                    if (m) {
                        const obj = JSON.parse(m[1]);
                        return {
                            shareId: obj.shareId || obj.id || null,
                            country: obj.localcountry || new URL(sharejumpUrl).searchParams.get("localcountry") || null,
                        };
                    }
                } catch (e) { }
            }
        }
        return null;
    });

    if (!cartInfo) {
        console.error('❌ Could not extract shareInfo');
        await browser.close();
        return;
    }

    console.log('🆔 shareId:', cartInfo.shareId);
    console.log('🌎 localcountry:', cartInfo.country);

    
    const cartUrl = `https://m.shein.com/ar-en/cart/share/landing?countryCode=SA&${cartInfo.shareId}&local_country=${cartInfo.country}`;

    return cartUrl
}
/* const link = await getLink("https://api-shein.shein.com/h5/sharejump/appjump?link=ljho68mULQJ_b&localcountry=DZ")
console.log(link); */
