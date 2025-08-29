import { getLink } from "./get-link.js";
import { scrapeCart } from "./scrape-cart.js";

export const getProductsInfo = async(url)=>{
    const cartUrl = await getLink(url);
    const productObjects = await scrapeCart(cartUrl);
    return productObjects;
}

