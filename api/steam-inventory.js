export default async function handler(req, res) {
  const { steamId } = req.query;
  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error('Steam inventory fetch failed:', e);
    res.status(500).json({ error: 'Steam API failed' });
  }
}
