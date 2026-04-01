# Technology Radar

Technology intelligence dashboard with radar visualization, benchmarking, roadmap predictions, and insights.

## Stack

- React 18
- React Router 7
- Vite 5
- Tailwind CSS + Radix UI components
- Recharts
- Axios

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure local env in `.env.local`:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_ENABLE_EMERGENT=false
ALLOWED_ORIGIN=http://localhost:5173
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b

# Optional paid provider:
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_MODEL=gpt-4.1-mini
# LLM_PROVIDER=openai
```

3. Install and start Ollama (free local model):

```bash
# one-time model download
ollama pull llama3.1:8b

# start ollama server
ollama serve
```

## Scripts

- `npm run dev` or `npm start`: start local dev server
- `npm run api`: start local backend API (`/api/chat`, `/api/health`) on port `3001`
- `npm run build`: production build to `dist/`
- `npm run preview`: preview built app locally

## Build Output

Vite emits optimized files in `dist/` ready for deployment.
