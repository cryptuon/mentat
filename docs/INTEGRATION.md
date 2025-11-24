# Web-Backend Integration Guide

This guide explains how to run the Mentat Protocol web frontend integrated with the FastAPI backend.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────┐
│   Vue 3 Web     │ HTTP    │  FastAPI Backend │         │ PostgreSQL │
│   Frontend      ├────────►│  + TortoiseORM   ├────────►│  Database  │
│  (Port 5173)    │  REST   │   (Port 8000)    │         │            │
└─────────────────┘         └──────────────────┘         └────────────┘
        │
        │ Axios Client
        │ JWT Auth
        │ Pinia Stores
        └──► Real-time market data, auth, curation
```

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **PostgreSQL** 14+ (for database)
- **npm** or **yarn** (package manager)

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb mentat_dev

# Or using psql
psql -U postgres
CREATE DATABASE mentat_dev;
\q
```

### 2. Backend Setup

```bash
cd apps/backend

# Install Python dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database with Aerich
aerich init-db

# Run backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd apps/web

# Install Node dependencies
npm install

# Configure environment
cp .env.example .env
# Default API URL is http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## Integration Features

### Authentication System

The web app now uses real JWT-based authentication:

#### Register Flow
1. User clicks "Connect Wallet" or "Sign in"
2. AuthModal opens with registration form
3. User enters wallet address (required) + optional email/password
4. Frontend calls `POST /api/v1/auth/register`
5. Backend creates user and returns JWT token
6. Token stored in localStorage
7. User state managed by Pinia auth store

#### Login Flow
1. User enters credentials (wallet or email/password)
2. Frontend calls `POST /api/v1/auth/login`
3. Backend validates and returns JWT token
4. Token automatically included in subsequent requests

#### Protected Routes
- All API requests include `Authorization: Bearer <token>` header
- Axios interceptor handles token injection
- 401 responses trigger automatic logout

### API Services

The frontend now uses real backend APIs instead of mock data:

| Frontend Function | Backend Endpoint | Description |
|------------------|------------------|-------------|
| `fetchActiveMarkets()` | `GET /api/v1/markets?state=active` | Get active markets |
| `fetchFeaturedMarkets()` | `GET /api/v1/markets?sort_by=total_volume` | Get top markets |
| `fetchMarketDetail(id)` | `GET /api/v1/markets/{id}` | Get market details |
| `fetchDrafts()` | `GET /api/v1/drafts` | Get user's drafts |
| `createDraft(data)` | `POST /api/v1/drafts` | Create market draft |
| `fetchCuratorQueue()` | `GET /api/v1/curator/queue` | Get curator queue |
| `approveDraft(id)` | `POST /api/v1/curator/{id}/approve` | Approve draft |

### Data Transformation

The integration includes adapters that transform backend API types to match frontend expectations:

- **Backend**: `MarketListItem` → **Frontend**: `MarketSummary`
- **Backend**: `MarketDetail` → **Frontend**: `MarketDetail`
- Handles field name conversions (snake_case ↔ camelCase)
- Converts basis points to percentages
- Adds computed/derived fields

## File Structure

### Frontend Integration Files

```
apps/web/src/
├── config/
│   └── api.ts                 # API endpoints configuration
├── lib/
│   └── apiClient.ts           # Axios instance with auth interceptors
├── stores/
│   └── auth.ts                # Pinia auth store
├── services/
│   ├── api.ts                 # Real API service functions
│   ├── adapters.ts            # Type adapters
│   └── mockApi.ts             # (deprecated, keep for reference)
├── types/
│   ├── index.ts               # Frontend types
│   └── api.ts                 # Backend API types
└── components/
    ├── AuthModal.vue          # Login/Register modal
    └── AppHeader.vue          # Updated with auth UI
```

### Backend API Structure

```
apps/backend/src/
├── api/v1/
│   ├── auth.py                # Authentication endpoints
│   ├── markets.py             # Market endpoints
│   ├── drafts.py              # Draft management
│   └── curator.py             # Curator workflow
├── models/
│   ├── user.py                # User model
│   ├── market.py              # Market models
│   └── curation.py            # Draft/curation models
└── schemas/
    ├── user.py                # Request/response schemas
    ├── market.py
    └── curation.py
```

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Mentat Protocol
VITE_APP_ENV=development
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mentat_dev
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Testing the Integration

### 1. Register a User

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
    "username": "testuser"
  }'

# Or use the web UI: Click "Connect Wallet" button
```

### 2. Browse Markets

Navigate to http://localhost:5173/ to see:
- Active markets fetched from backend
- Real-time data (currently empty until you create markets)

### 3. Create a Draft

1. Sign in to web app
2. Go to "Create" page
3. (Creator studio UI integration TBD)

### 4. Curator Workflow

1. Sign in with curator account
2. Go to "Curate" page
3. View pending drafts from backend

## Development Workflow

### Making Schema Changes

1. Update models in `apps/backend/src/models/`
2. Create migration:
   ```bash
   cd apps/backend
   aerich migrate --name "description"
   ```
3. Apply migration:
   ```bash
   aerich upgrade
   ```
4. Update TypeScript types in `apps/web/src/types/api.ts`
5. Update adapters if needed

### Adding New Endpoints

1. Add route to `apps/backend/src/api/v1/`
2. Add endpoint constant to `apps/web/src/config/api.ts`
3. Add service function to `apps/web/src/services/api.ts`
4. Update components to use new service

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check `CORS_ORIGINS` in backend `.env`
2. Ensure frontend dev server URL is included
3. Restart backend server

### 401 Unauthorized

- Check that JWT token is in localStorage (`auth_token`)
- Verify backend `SECRET_KEY` hasn't changed
- Token expires after 7 days by default

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep mentat_dev

# Verify DATABASE_URL in backend .env
```

### Markets Not Showing

The database starts empty. To seed data:
1. Create a user via registration
2. Create drafts via API
3. Approve drafts as curator
4. Markets will appear in discovery

## Next Steps

- [ ] Connect Creator Studio UI to draft creation API
- [ ] Implement WebSocket for real-time market updates
- [ ] Add wallet signature verification
- [ ] Implement proof submission UI
- [ ] Add market trading interface
- [ ] Integrate with Solana devnet

## Production Deployment

### Backend

```bash
# Use production ASGI server
gunicorn src.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### Frontend

```bash
# Build for production
npm run build

# Serve with nginx, Vercel, or Netlify
```

### Environment

- Set `ENVIRONMENT=production` and `DEBUG=false`
- Use strong `SECRET_KEY` (32+ random bytes)
- Enable HTTPS
- Configure production database
- Set proper CORS origins

## Support

- Backend API docs: http://localhost:8000/docs
- Frontend issues: Check browser console
- Database issues: Check PostgreSQL logs
- General issues: See repo README.md
