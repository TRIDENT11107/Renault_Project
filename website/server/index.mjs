import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const loadEnvFile = (filename) => {
  const fullPath = path.join(ROOT_DIR, filename);
  if (!existsSync(fullPath)) return;
  const raw = readFileSync(fullPath, 'utf8');
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex < 1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
};

loadEnvFile('.env');
loadEnvFile('.env.local');

const PORT = Number(process.env.PORT || 3001);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const ENV_PROVIDER = String(process.env.LLM_PROVIDER || '').toLowerCase();
const LLM_PROVIDER =
  ENV_PROVIDER === 'openai' || ENV_PROVIDER === 'ollama'
    ? ENV_PROVIDER
    : OPENAI_API_KEY
      ? 'openai'
      : 'ollama';

const cleanEnergyMixCsv = readFileSync(path.join(ROOT_DIR, 'src', 'data', 'clean_energy_mix_data.csv'), 'utf8');
const launchesRaw = readFileSync(path.join(ROOT_DIR, 'src', 'data', 'launches.json'), 'utf8');
const launches = JSON.parse(launchesRaw);

const parseCsv = (csvText) => {
  const lines = String(csvText || '')
    .trim()
    .split('\n')
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return headers.reduce((acc, header, idx) => {
      const rawValue = values[idx] ?? '';
      const numberValue = Number(rawValue);
      acc[header] = Number.isFinite(numberValue) && rawValue !== '' ? numberValue : rawValue;
      return acc;
    }, {});
  });
};

const cleanEnergyRows = parseCsv(cleanEnergyMixCsv).sort((a, b) => Number(b.Year || 0) - Number(a.Year || 0));
const latestEnergy = cleanEnergyRows[0] || null;

const toPowertrain = (value = '') => {
  const v = String(value).toLowerCase();
  if (v.includes('ev') || v.includes('electric')) return 'EV';
  if (v.includes('hybrid') || v.includes('hev')) return 'HEV';
  if (v.includes('cng')) return 'CNG';
  return 'ICE';
};

const getDataContext = () => {
  const upcomingByType = launches.reduce((acc, item) => {
    const type = toPowertrain(item.powertrain);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const energySummary = latestEnergy
    ? `Latest share dataset year ${latestEnergy.Year}: Petrol=${latestEnergy.Petrol}, Diesel=${latestEnergy.Diesel}, CNG=${latestEnergy.CNG}, EV=${latestEnergy.EV}`
    : 'No energy share dataset available.';

  return [
    'You are a market-insights assistant for Indian automotive powertrains.',
    'Use only provided context when giving numerical claims.',
    'If exact value is not present in context, clearly say data is unavailable.',
    energySummary,
    `Upcoming launches count by powertrain: ${JSON.stringify(upcomingByType)}.`,
    `Known upcoming launch samples: ${launches
      .slice(0, 10)
      .map((item) => `${item.model} (${item.powertrain}, ${item.launch_date})`)
      .join('; ')}.`
  ].join('\n');
};

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const extractTextFromResponse = (payload) => {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const texts = [];
  output.forEach((item) => {
    const content = Array.isArray(item?.content) ? item.content : [];
    content.forEach((part) => {
      if (part?.type === 'output_text' && typeof part?.text === 'string') {
        texts.push(part.text);
      }
    });
  });
  return texts.join('\n').trim();
};

const requestOpenAI = async (message, history) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const sanitizedHistory = history
    .slice(-8)
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')
    .map((item) => ({
      role: item.role,
      content: [{ type: 'input_text', text: item.text }]
    }));

  const input = [
    {
      role: 'system',
      content: [{ type: 'input_text', text: getDataContext() }]
    },
    ...sanitizedHistory,
    {
      role: 'user',
      content: [{ type: 'input_text', text: message }]
    }
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const payload = await response.json();
  const answer = extractTextFromResponse(payload);
  return answer || 'No response text returned by model.';
};

const requestOllama = async (message, history) => {
  const sanitizedHistory = history
    .slice(-8)
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')
    .map((item) => ({
      role: item.role,
      content: item.text
    }));

  const messages = [
    { role: 'system', content: getDataContext() },
    ...sanitizedHistory,
    { role: 'user', content: message }
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${errorText}`);
  }

  const payload = await response.json();
  const answer = payload?.message?.content;
  if (!answer || typeof answer !== 'string') {
    return 'No response text returned by local model.';
  }
  return answer.trim();
};

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    res.end();
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    json(res, 200, {
      ok: true,
      provider: LLM_PROVIDER,
      openaiConfigured: Boolean(OPENAI_API_KEY),
      model: LLM_PROVIDER === 'openai' ? OPENAI_MODEL : OLLAMA_MODEL,
      baseUrl: LLM_PROVIDER === 'ollama' ? OLLAMA_BASE_URL : 'https://api.openai.com'
    });
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    try {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const message = String(parsed.message || '').trim();
      const history = Array.isArray(parsed.messages) ? parsed.messages : [];
      if (!message) {
        json(res, 400, { error: 'message is required' });
        return;
      }

      const answer =
        LLM_PROVIDER === 'openai'
          ? await requestOpenAI(message, history)
          : await requestOllama(message, history);

      json(res, 200, { answer, provider: LLM_PROVIDER });
    } catch (error) {
      json(res, 500, { error: 'chat_request_failed', detail: String(error.message || error) });
    }
    return;
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `API server listening on http://localhost:${PORT} using ${LLM_PROVIDER}:${LLM_PROVIDER === 'openai' ? OPENAI_MODEL : OLLAMA_MODEL}`
  );
});
