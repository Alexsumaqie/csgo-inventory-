export default async function handler(req, res) {
  try {
    const response = await fetch('https://store.steampowered.com/news/app/730?l=english');
    const html = await response.text();
    res.status(200).send(html);
  } catch (err) {
    console.error('❌ Failed to fetch CS news:', err);
    res.status(500).json({ error: 'Failed to fetch CS news' });
  }
}
