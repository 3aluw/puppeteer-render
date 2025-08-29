import express from "express";
import { getProductsInfo } from "./scrapeLogic.js";
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("✅ Shein Cart Scraper is running!");
});

// Example endpoint: /scrape?url=...
app.get("/scrape", async (req, res) => {
  let { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url query param" });
  url = decodeURIComponent(url)
  console.log('🔗 Received URL:', url);
  try {
    const products = await getProductsInfo(url);
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
