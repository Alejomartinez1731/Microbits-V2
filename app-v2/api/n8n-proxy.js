// Serverless Function para Vercel - Proxy a N8N
// Este archivo permite usar variables de entorno en Vercel

import { API_CONFIG } from '../config/api.config.js';

export default async function handler(req, res) {
  // Log inicial para debugging
  console.log('════════════════════════════════════════════════════════════');
  console.log('🔗 VERCEL PROXY - Petición recibida');
  console.log('════════════════════════════════════════════════════════════');
  console.log('📋 Method:', req.method);
  console.log('📋 URL:', req.url);
  console.log('📋 Query params:', req.query);

  // Configuración CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request - Respondiendo 200');
    res.status(200).end();
    return;
  }

  try {
    // Usar configuración centralizada
    const n8nBaseUrl = API_CONFIG.N8N_BASE_URL;
    console.log('📍 N8N Base URL:', n8nBaseUrl);

    // Obtener el endpoint de los query params
    const endpoint = req.query.path || '';
    const curso = req.query.curso;

    console.log('📍 Endpoint:', endpoint);
    console.log('📍 Curso:', curso);

    // Construir la URL completa
    let url = n8nBaseUrl + endpoint;

    // Agregar query params si existen
    const queryParams = new URLSearchParams();
    if (curso) {
      queryParams.append('curso', curso);
    }

    // Agregar cualquier query param adicional
    Object.keys(req.query).forEach(key => {
      if (key !== 'path' && key !== 'curso') {
        queryParams.append(key, req.query[key]);
      }
    });

    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }

    console.log('📍 URL completa de N8N:', url);

    // Preparar opciones de fetch
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Manejar body para POST/PUT/PATCH
    if (req.method !== 'GET' && req.body) {
      console.log('📦 Body recibido:', req.body);

      // Parsear body si viene como string JSON
      let bodyToSend = req.body;
      if (typeof req.body === 'string') {
        try {
          bodyToSend = JSON.parse(req.body);
          console.log('📦 Body parseado:', bodyToSend);
        } catch (e) {
          console.error('❌ Error parseando body:', e);
          bodyToSend = req.body;
        }
      }

      fetchOptions.body = JSON.stringify(bodyToSend);
      console.log('📦 Body enviado a N8N:', fetchOptions.body);
    }

    console.log('🚀 Enviando petición a N8N...');

    // Hacer la petición a N8N
    const response = await fetch(url, fetchOptions);

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error('❌ N8N respondió con error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ N8N Response JSON:', {
      status: response.status,
      dataReceived: !!data,
      dataKeys: data ? Object.keys(data) : null,
      data: data
    });

    // Enviar respuesta al cliente
    res.status(response.status).json(data);

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ PROXY VERCEL COMPLETADO EXITOSAMENTE');
    console.log('════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('════════════════════════════════════════════════════════════');
    console.error('❌ ERROR EN PROXY VERCEL');
    console.error('════════════════════════════════════════════════════════════');
    console.error('❌ Error:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Stack:', error.stack);
    console.error('════════════════════════════════════════════════════════════');

    res.status(500).json({
      error: 'Error al conectar con N8N',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
