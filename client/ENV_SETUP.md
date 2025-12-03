# Environment Variables Setup

## Production Build

The `.env.production` file has been created with production API URLs pointing to:
- `http://54.179.120.126/api`

When you run `npm run build`, Vite will automatically use `.env.production` and the frontend will connect to your production backend.

## Environment Variables

### VITE_API_URL
- **Production**: `http://54.179.120.126/api`
- **Default (dev)**: `http://localhost:8000/api`
- Used in: `ApiService.ts`, `GeminiService.ts`, `OfflinePrefetch.ts`, etc.

### VITE_API_BASE
- **Production**: `http://54.179.120.126`
- **Default (dev)**: `http://localhost:8000` or `http://127.0.0.1:8000`
- Used in: `ApiService.ts`, `KidsApi.ts`, `TeenApi.ts`
- Base URL without `/api` suffix (for media files and some endpoints)

### VITE_API_BASE_URL
- **Production**: `http://54.179.120.126`
- **Default (dev)**: `http://localhost:8000`
- Used in: `KidsListeningAnalytics.ts`
- Alternative name for base URL

## How It Works

1. **Development** (`npm run dev`):
   - Uses `.env.local` if it exists
   - Otherwise uses defaults in code (`http://localhost:8000/api`)

2. **Production Build** (`npm run build`):
   - Automatically uses `.env.production`
   - All API calls will go to `http://54.179.120.126/api`

## Files Created

- ✅ `.env.production` - Production environment variables (used when building)
- ✅ `.env.local.example` - Example for local development overrides

## Important Notes

- `.env.production` is used automatically when building for production
- You don't need to do anything special - just run `npm run build`
- The built files in `dist/` will have the production API URLs baked in
- For local development, the code defaults to `localhost:8000` (no .env file needed)

## Testing Production Build Locally

If you want to test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the production build (with production API URLs) on a local server.

## Updating Production URLs

If your production server URL changes, update `.env.production`:

```env
VITE_API_URL=http://your-new-server.com/api
VITE_API_BASE=http://your-new-server.com
VITE_API_BASE_URL=http://your-new-server.com
```

Then rebuild:
```bash
npm run build
```

