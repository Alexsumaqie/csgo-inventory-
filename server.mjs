// server.mjs
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

// ✅ CS news
app.get('/api/csnews', async (req, res) => {
  try {
    const response = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch CS news:', err);
    res.status(500).json({ error: 'Failed to fetch CS news' });
  }
});

// ✅ Steam icon proxy (for market listings)
app.get('/api/steam-icon/:skinName', async (req, res) => {
  const skinName = req.params.skinName;
  const marketUrl = `https://steamcommunity.com/market/listings/730/${decodeURIComponent(skinName)}`;

  try {
    const response = await fetch(marketUrl);
    const html = await response.text();
    const match = html.match(/"icon_url":"([^"]+)"/);

    if (match && match[1]) {
      const cleaned = match[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
      const fullUrl = `https://steamcommunity-a.akamaihd.net/economy/image/${cleaned}`;
      return res.json({ icon_url: fullUrl });
    }

    // 🔁 fallback to cs.money if Steam failed
    const fallbackUrl = `https://wiki.cs.money/img/items/730-${skinName.replace(" | ", "-")}.png`;
    return res.json({ icon_url: fallbackUrl });
  } catch (err) {
    console.error("❌ Steam fetch failed:", err);
    const fallbackUrl = `https://wiki.cs.money/img/items/730-${skinName.replace(" | ", "-")}.png`;
    return res.json({ icon_url: fallbackUrl });
  }
});

// ✅ NEW: Steam market price proxy
app.get('/api/steam-price', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing market_hash_name' });

  try {
    const steamUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(name)}`;
    const response = await fetch(steamUrl);
    const json = await response.json();
    res.json(json);
  } catch (err) {
    console.error('❌ Failed to fetch Steam price:', err);
    res.status(500).json({ error: 'Failed to fetch Steam price' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Local server running at http://localhost:${PORT}`);
});
