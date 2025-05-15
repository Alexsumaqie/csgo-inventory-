// File path: /pages/api/csnews.js

export default async function handler(req, res) {
  try {
    const steamNewsURL = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=20&maxlength=20000&format=json';

    const response = await fetch(steamNewsURL, {
      headers: {
        'User-Agent': 'csgo-news-hub/1.0',
        'Accept': 'application/json',
      },
    });

    // Check if Steam API responded correctly
    if (!response.ok) {
      console.error(`Steam API responded with status ${response.status}`);
      return res.status(502).json({ error: 'Failed to fetch Steam news' });
    }

    const data = await response.json();

    // Basic validation
    if (!data?.appnews?.newsitems) {
      return res.status(500).json({ error: 'Malformed Steam response' });
    }

    // Respond with the parsed news list
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    console.error('❌ Failed to fetch CS news:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
