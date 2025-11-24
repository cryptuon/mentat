# Mentat Protocol - Event Indexer

Real-time Solana event indexer for the Mentat Protocol prediction markets. Listens to on-chain events and syncs them to PostgreSQL database.

## Features

- **Real-time Event Listening**: WebSocket subscriptions to Solana programs
- **Event Parsing**: Parses Anchor events into typed structures
- **Database Persistence**: Stores events in PostgreSQL with proper indexing
- **Error Handling**: Automatic retries and reconnection logic
- **Monitoring**: Health check endpoint for service monitoring
- **Structured Logging**: Winston-based logging with file rotation

## Architecture

```
┌──────────────┐
│ Solana       │
│ Programs     │
│              │
│ - Market     │
│   Factory    │
│ - Settlement │
└──────┬───────┘
       │ Events (WebSocket)
       │
┌──────▼───────┐
│ Log Listener │
│              │
│ - Subscribe  │
│ - Parse      │
│ - Validate   │
└──────┬───────┘
       │
┌──────▼───────┐
│ Event        │
│ Repository   │
│              │
│ - Transform  │
│ - Persist    │
└──────┬───────┘
       │
┌──────▼───────┐
│ PostgreSQL   │
│              │
│ - Markets    │
│ - Trades     │
│ - Liquidity  │
│ - Resolution │
└──────────────┘
```

## Installation

```bash
cd apps/indexer
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key environment variables:

```env
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com

# Programs
MARKET_FACTORY_PROGRAM_ID=3sgfKweTHC5EZgGsh6CCcgP9Bqppb5UA6CwgAcHbF9va
MARKET_SETTLEMENT_PROGRAM_ID=mktRU9S5U6cKzX6dvKeyUgm8g8VPRZxuzizfNX18cR1

# Database
DATABASE_URL=postgresql://mentat_user:password@localhost:5432/mentat_dev

# Monitoring
HEALTH_CHECK_PORT=3001
```

## Database Setup

Run the schema migration:

```bash
psql -U mentat_user -d mentat_dev < src/schema.sql
```

Or use the backend's migration system to add these tables.

## Usage

### Development Mode

Run with auto-reload:

```bash
npm run dev
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

### Health Check

Check service health:

```bash
curl http://localhost:3001/health
```

Response:

```json
{
  "status": "healthy",
  "database": true,
  "listener": true,
  "timestamp": "2025-11-24T22:00:00.000Z"
}
```

## Event Types

### Market Factory Events

- **MarketCreated**: New market initialization
- **TradeExecuted**: Buy/sell trades
- **LiquidityAdded**: LP provides liquidity
- **LiquidityRemoved**: LP withdraws liquidity
- **MarketStateChanged**: Market state transitions
- **MarketClosed**: Market closure with fees
- **FeesWithdrawn**: Fee withdrawals

### Market Settlement Events

- **ProofSubmitted**: Outcome proof submission
- **ProofVerified**: Proof verification result
- **MarketResolved**: Market resolution with winning outcome
- **PayoutClaimed**: User claims winnings
- **DisputeOpened**: Resolution dispute opened
- **DisputeResolved**: Dispute resolution

## Database Tables

### on_chain_markets
Stores market creation events.

### trades
All trade executions with amount, price, fees.

### liquidity_events
Liquidity additions and removals.

### resolution_events
Proofs, resolutions, disputes, and payouts.

### market_state_changes
State transition events.

### market_closures
Market closure with final stats.

### fee_withdrawals
Fee withdrawal events.

### indexer_state
Tracks last processed slot per program.

## Development

### Project Structure

```
apps/indexer/
├── src/
│   ├── index.ts              # Main service
│   ├── config.ts             # Configuration
│   ├── logger.ts             # Logging setup
│   ├── database.ts           # Database client
│   ├── schema.sql            # Database schema
│   ├── types/
│   │   └── events.ts         # Event type definitions
│   ├── parsers/
│   │   └── eventParser.ts    # Event parsing logic
│   ├── repositories/
│   │   └── eventRepository.ts # Database operations
│   └── listeners/
│       └── logListener.ts    # WebSocket listener
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Adding New Events

1. Add event type to `src/types/events.ts`
2. Update parser in `src/parsers/eventParser.ts`
3. Add repository method in `src/repositories/eventRepository.ts`
4. Update database schema if needed

### Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Monitoring

### Logs

Logs are written to:
- `indexer.log` - All logs
- `error.log` - Error logs only
- `stdout` - Console output

Log format:
```
2025-11-24 22:00:00 [info]: Event processed successfully {
  "type": "TradeExecuted",
  "signature": "...",
  "slot": 123456
}
```

### Metrics

Monitor these metrics:
- Events processed per second
- Database write latency
- WebSocket connection status
- Error rate

## Troubleshooting

### Connection Issues

```bash
# Check Solana RPC
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Check database
psql -U mentat_user -d mentat_dev -c "SELECT 1"
```

### Missing Events

1. Check WebSocket subscription is active
2. Verify program IDs are correct
3. Check database for duplicate signature errors
4. Review logs for parsing errors

### High Memory Usage

- Adjust log rotation settings
- Reduce log level in production
- Monitor database connection pool

## Performance

### Expected Throughput

- **Events/sec**: 10-50 (typical)
- **Database writes**: < 100ms per event
- **Memory usage**: ~100MB baseline
- **CPU usage**: < 10% (idle), < 30% (active)

### Optimization Tips

1. Use connection pooling
2. Batch database inserts
3. Add database indexes
4. Monitor WebSocket reconnections

## Production Deployment

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Solana RPC access
- 512MB RAM minimum
- 10GB disk space

### Deployment Steps

1. Build TypeScript:
   ```bash
   npm run build
   ```

2. Set environment variables

3. Run database migrations

4. Start service:
   ```bash
   npm start
   ```

5. Monitor health endpoint

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist

CMD ["node", "dist/index.js"]
```

## Next Steps

- [ ] Load IDL files from built programs
- [ ] Add historical data backfill
- [ ] Implement batch processing
- [ ] Add GraphQL API
- [ ] Create monitoring dashboard
- [ ] Add event replay functionality

## Support

For issues or questions:
- Check logs: `tail -f indexer.log`
- Health check: `curl http://localhost:3001/health`
- Database status: `psql -U mentat_user -d mentat_dev`

## License

MIT
