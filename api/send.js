export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const response = await fetch('https://universe19.app.n8n.cloud/webhook/quoteflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    });

    const text = await response.text();
    console.log('n8n response:', response.status, text);
    
    res.status(200).json({ ok: true, n8n: response.status });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
