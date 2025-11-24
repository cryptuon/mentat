# Mentat Protocol Backend

FastAPI backend service for Mentat Protocol, providing REST APIs for web and mobile clients with TortoiseORM and PostgreSQL.

## Features

- **FastAPI** with async/await support
- **TortoiseORM** with Aerich migrations
- **JWT authentication** for web and mobile
- **RESTful API** designed for both platforms
- **Curator workflow** with approval pipeline
- **Market management** aligned with on-chain schema
- **Type-safe** with Pydantic schemas

## Architecture

```
src/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration management
├── database.py          # Database lifecycle & TortoiseORM config
├── models/              # Database models
│   ├── user.py          # User/authentication
│   ├── market.py        # Market entities
│   └── curation.py      # Draft and curation workflow
├── schemas/             # Pydantic request/response schemas
│   ├── user.py
│   ├── market.py
│   └── curation.py
├── api/v1/              # API route modules
│   ├── auth.py          # Authentication endpoints
│   ├── markets.py       # Market discovery & detail
│   ├── drafts.py        # Creator studio
│   └── curator.py       # Curator console
└── middleware/
    └── auth.py          # JWT utilities and dependencies
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis (optional, for session management)

### Installation

1. **Install dependencies:**
   ```bash
   cd apps/backend
   uv sync
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database:**
   ```bash
   # Create database
   createdb mentat_dev

   # Initialize Aerich
   aerich init-db

   # Run migrations
   aerich upgrade
   ```

4. **Run development server:**
   ```bash
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Database Migrations

We use **Aerich** for database migrations with TortoiseORM.

### Create a new migration

```bash
aerich migrate --name "description_of_changes"
```

### Apply migrations

```bash
aerich upgrade
```

### Rollback migration

```bash
aerich downgrade
```

### View migration history

```bash
aerich history
```

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user (wallet or email+password)
- `POST /login` - Login (returns JWT token)
- `GET /me` - Get current user profile
- `PATCH /me` - Update profile

### Markets (`/api/v1/markets`)

- `GET /` - List markets with filters (public)
- `GET /{market_id}` - Get market details (public)
- `GET /user/{wallet_address}` - Get user's markets (public)

### Drafts (`/api/v1/drafts`)

- `POST /` - Create market draft (requires auth)
- `GET /` - List my drafts
- `GET /{draft_id}` - Get draft details
- `PATCH /{draft_id}` - Update draft (after changes requested)
- `POST /{draft_id}/submit` - Submit for curator review

### Curator (`/api/v1/curator`)

- `GET /queue` - Get curator review queue (requires curator role)
- `POST /{draft_id}/claim` - Claim draft for review
- `POST /{draft_id}/approve` - Approve draft
- `POST /{draft_id}/request-changes` - Request changes
- `POST /{draft_id}/reject` - Reject draft
- `GET /{draft_id}/actions` - View audit trail

## Authentication

The API supports two authentication methods:

### 1. Email + Password

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "...",
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### 2. Wallet-Based (for mobile apps)

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
  }'

# Login (signature verification coming soon)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
  }'
```

### Using JWT Tokens

Include the token in the `Authorization` header:

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Mobile App Compatibility

The API is designed to work seamlessly with mobile applications:

- **Stateless JWT authentication** (no cookies)
- **RESTful JSON responses** (no server-side rendering)
- **Optional authentication** on public endpoints
- **CORS enabled** for cross-origin requests
- **Comprehensive error responses** with proper status codes

## Development

### Code Quality

```bash
# Format code
ruff format src/

# Lint
ruff check src/

# Type checking (if using mypy)
mypy src/
```

### Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=src tests/
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)
- `SECRET_KEY` - JWT signing key (MUST change in production!)
- `CORS_ORIGINS` - Allowed origins for CORS
- `OPENAI_API_KEY` - For AI agent integration
- `ANTHROPIC_API_KEY` - For AI agent integration
- `SOLANA_RPC_URL` - Solana RPC endpoint

## Production Deployment

1. Set `ENVIRONMENT=production` and `DEBUG=false`
2. Generate secure `SECRET_KEY`: `openssl rand -hex 32`
3. Configure production database
4. Set up Redis for session management
5. Use a production ASGI server (e.g., gunicorn + uvicorn workers)
6. Enable HTTPS
7. Configure proper CORS origins

Example production command:
```bash
gunicorn src.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## Next Steps

- [ ] Implement wallet signature verification
- [ ] Add WebSocket support for real-time updates
- [ ] Integrate with AI agents service
- [ ] Add rate limiting middleware
- [ ] Implement proof service integration
- [ ] Add Solana on-chain deployment logic
- [ ] Set up monitoring and logging
- [ ] Add comprehensive test coverage

## License

See repository root for license information.
