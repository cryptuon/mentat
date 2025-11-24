# Mentat Protocol - Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+
- **API Keys**: OpenAI or Anthropic (for AI agents)

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/mentat-protocol.git
cd mentat-protocol
```

### 2. Backend Setup

```bash
cd apps/backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and settings

# Run migrations
make migrate

# Start server
make run
# Backend will run on http://localhost:8000
```

**Verify Backend**:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","version":"0.1.0","environment":"development"}
```

### 3. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend will run on http://localhost:5173 (or 5174 if 5173 is in use)
```

**Verify Frontend**:
Open http://localhost:5173 in your browser. You should see the Discovery Hub.

### 4. AI Agents Setup (Optional)

```bash
cd apps/ai-agents

# Install dependencies
uv sync

# Configure API key
export OPENAI_API_KEY="sk-..."  # or ANTHROPIC_API_KEY="sk-ant-..."

# Test agents
uv run python examples/quickstart.py
```

## Using the Platform

### Create Your First Market

1. **Navigate to Creator Studio**
   - Open http://localhost:5173/create
   - Sign in (or register) with wallet address or email

2. **Fill Topic Form**
   ```
   Category: Crypto
   Keywords: Bitcoin, price, $100k
   Context: Will Bitcoin reach $100,000 by end of 2025?
   Deadline: 365 days
   ```

3. **Generate with AI**
   - Click "Generate market with AI"
   - Watch real-time progress:
     - Scout Agent researching sources (~3s)
     - Draft Agent generating spec (~8s)
     - Validator Agent checking quality (~4s)

4. **Review Draft**
   - Check validation scores (Quality, Safety, Clarity)
   - Review resolution sources
   - View AI rationale
   - Submit for curator review

### Curate Markets (Curator Role)

1. **Navigate to Curator Console**
   - Open http://localhost:5173/curate
   - Sign in as curator (requires curator role)

2. **Review Queue**
   - View pending drafts
   - Filter by status or assignment
   - Select drafts to review

3. **Single Review**
   - Click draft to open
   - Review validation scores
   - Check resolution criteria
   - Approve, reject, or request changes

4. **Bulk Operations**
   - Select multiple drafts with checkboxes
   - Use bulk actions:
     - Claim (assign to yourself)
     - Approve (with notes)
     - Reject (with reason)

5. **View Changes**
   - Click "Changes" tab for revisions
   - See side-by-side diff
   - View field-level changes
   - Check version history

## API Endpoints

Base URL: `http://localhost:8000`

### Authentication

**Register**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234...",
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234...",
    "password": "secure_password"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "wallet_address": "0x1234...",
    "roles": ["creator"]
  }
}
```

### AI Generation

**Generate Draft**:
```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": {
      "category": "crypto",
      "keywords": ["bitcoin", "price"],
      "context": "Will Bitcoin reach $100k by EOY 2025?"
    },
    "deadline_days": 365
  }'
```

### Curation

**Get Queue**:
```bash
curl http://localhost:8000/api/v1/curator/queue?status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Approve Draft**:
```bash
curl -X POST http://localhost:8000/api/v1/curator/{draft_id}/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "curator_notes": "Excellent market specification",
    "deploy_immediately": false
  }'
```

**Bulk Approve**:
```bash
curl -X POST http://localhost:8000/api/v1/curator/bulk/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "draft_ids": ["uuid1", "uuid2", "uuid3"],
    "curator_notes": "Batch approved - high quality"
  }'
```

## Database Setup

### PostgreSQL

**Create Database**:
```sql
CREATE DATABASE mentat_dev;
CREATE USER mentat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mentat_dev TO mentat_user;
```

**Configure .env**:
```env
DATABASE_URL=postgresql://mentat_user:your_password@localhost:5432/mentat_dev
```

### Run Migrations

```bash
cd apps/backend
make migrate
```

### Seed Data (Optional)

```bash
make seed  # Seeds test users, markets, and drafts
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mentat_dev

# API Settings
APP_NAME="Mentat Protocol"
APP_VERSION="0.1.0"
DEBUG=true
ENVIRONMENT=development

# Security
SECRET_KEY=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174"]

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
ALGORITHM=HS256
```

### AI Agents (.env)

```env
# LLM Provider (choose one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Model Selection
LLM_PROVIDER=openai  # or anthropic
MODEL_NAME=gpt-4-turbo-preview  # or claude-3-opus-20240229

# Agent Configuration
MIN_QUALITY_SCORE=0.7
MIN_SAFETY_SCORE=0.8
MIN_CLARITY_SCORE=0.7
```

## Troubleshooting

### Port Already in Use

**Frontend**:
```bash
# Vite will automatically use next available port (5174, 5175, etc.)
# Or kill existing process:
lsof -ti:5173 | xargs kill -9
```

**Backend**:
```bash
# Kill existing process:
lsof -ti:8000 | xargs kill -9
# Or change port in config.py
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Test connection
psql -U mentat_user -d mentat_dev -h localhost
```

### Missing Dependencies

**Frontend**:
```bash
cd apps/web
rm -rf node_modules package-lock.json
npm install
```

**Backend**:
```bash
cd apps/backend
rm -rf .venv
uv sync
```

### AI Agent Errors

**OpenAI Rate Limit**:
```python
# Add retry logic or use exponential backoff
# Or switch to Anthropic: export ANTHROPIC_API_KEY="..."
```

**Invalid Model Name**:
```bash
# Update MODEL_NAME in .env
# OpenAI: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
# Anthropic: claude-3-opus-20240229, claude-3-sonnet-20240229
```

## Testing

### Backend Tests

```bash
cd apps/backend
pytest tests/
```

### Frontend Tests

```bash
cd apps/web
npm run test
```

### E2E Tests

```bash
cd apps/web
npm run test:e2e
```

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**
   - Backend: `apps/backend/`
   - Frontend: `apps/web/`
   - AI Agents: `apps/ai-agents/`

3. **Test locally**
   ```bash
   # Backend
   cd apps/backend
   pytest

   # Frontend
   cd apps/web
   npm run test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

5. **Create Pull Request**

### Code Style

**Backend** (Python):
```bash
cd apps/backend
make format  # Runs black + isort
make lint    # Runs flake8
```

**Frontend** (TypeScript):
```bash
cd apps/web
npm run lint
npm run format
```

## Production Deployment

### Backend

```bash
# Use gunicorn with uvicorn workers
gunicorn src.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### Frontend

```bash
cd apps/web
npm run build
# Serve dist/ with nginx or CDN
```

### Database

```bash
# Run migrations on production
cd apps/backend
aerich upgrade
```

## Getting Help

- **Documentation**: See [`docs/`](./docs/) directory
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions on GitHub Discussions

## Next Steps

1. ✅ Complete M2 - Creator MVP (DONE)
2. 🚧 Start M3 - On-Chain Launch
   - Implement Solana programs
   - Add wallet integration
   - Build trading interface
   - Add WebSocket updates

See [M2 Completion Summary](./docs/M2-COMPLETION-SUMMARY.md) for detailed milestone documentation.

---

**Happy Building!** 🚀
