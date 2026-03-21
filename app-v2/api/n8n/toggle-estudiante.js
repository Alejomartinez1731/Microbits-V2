// Vercel Serverless Function: /api/n8n/toggle-estudiante

const N8N_BASE_URL = 'https://micro-bits-n8n.aejhww.easypanel.host/webhook';

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parsear body si viene como string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Error parsing body:', e);
      }
    }

    const n8nUrl = `${N8N_BASE_URL}/toggle-estudiante`;
    console.log('Proxying POST to:', n8nUrl);
    console.log('Body:', body);

    // Usar fetch igual que el proxy local
    const fetchResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('Response status:', fetchResponse.status);

    // Obtener texto como el proxy local (maneja respuestas vacías)
    const data = await fetchResponse.text();
    console.log('Response length:', data.length, 'bytes');
    console.log('Response:', data);

    // Enviar respuesta con el mismo status
    res.writeHead(fetchResponse.status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    });
    res.end(data);

  } catch (error) {
    console.error('Error in toggle-estudiante:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
