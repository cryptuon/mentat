import { createServer } from 'http';
import { config } from './config';
import { logger } from './logger';
import { db } from './database';
import { SolanaEventParser } from './parsers/eventParser';
import { LogListener } from './listeners/logListener';

// Placeholder IDLs - these should be loaded from actual IDL files
// TODO: Load from apps/solana-programs/target/idl/*.json
const MARKET_FACTORY_IDL = null;
const MARKET_SETTLEMENT_IDL = null;

class IndexerService {
  private logListener: LogListener | null = null;
  private healthServer: ReturnType<typeof createServer> | null = null;
  private isShuttingDown = false;

  async start(): Promise<void> {
    logger.info('Starting Mentat Protocol Indexer');
    logger.info('Configuration', {
      rpcUrl: config.solana.rpcUrl,
      wsUrl: config.solana.wsUrl,
      marketFactory: config.programs.marketFactory.toBase58(),
      marketSettlement: config.programs.marketSettlement.toBase58(),
    });

    try {
      // Connect to database
      logger.info('Connecting to database...');
      await db.connect();
      logger.info('Database connected');

      // Initialize event parser
      logger.info('Initializing event parser...');
      const eventParser = new SolanaEventParser(
        config.programs.marketFactory,
        config.programs.marketSettlement
      );

      // Note: IDL initialization is commented out until programs are built
      // await eventParser.initialize(MARKET_FACTORY_IDL, MARKET_SETTLEMENT_IDL);

      // Start log listener
      logger.info('Starting log listener...');
      this.logListener = new LogListener(eventParser);
      // Uncomment when IDLs are available:
      // await this.logListener.start();
      logger.info('Log listener started (currently disabled - awaiting IDLs)');

      // Start health check server
      this.startHealthCheckServer();

      logger.info('Indexer service started successfully');
      logger.info('To enable event indexing:');
      logger.info('1. Build Solana programs: cd apps/solana-programs && anchor build');
      logger.info('2. Update src/index.ts to load IDL files');
      logger.info('3. Uncomment eventParser.initialize() and logListener.start()');
    } catch (error) {
      logger.error('Failed to start indexer service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      await this.shutdown();
      process.exit(1);
    }
  }

  private startHealthCheckServer(): void {
    this.healthServer = createServer(async (req, res) => {
      if (req.url === '/health') {
        const isHealthy =
          (await db.healthCheck()) &&
          (!this.logListener || this.logListener.isHealthy());

        res.writeHead(isHealthy ? 200 : 503, {
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            status: isHealthy ? 'healthy' : 'unhealthy',
            database: await db.healthCheck(),
            listener: this.logListener?.isHealthy() ?? false,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    this.healthServer.listen(config.monitoring.healthCheckPort, () => {
      logger.info('Health check server started', {
        port: config.monitoring.healthCheckPort,
        url: `http://localhost:${config.monitoring.healthCheckPort}/health`,
      });
    });
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    logger.info('Shutting down indexer service...');

    // Stop log listener
    if (this.logListener) {
      await this.logListener.stop();
    }

    // Close health check server
    if (this.healthServer) {
      await new Promise<void>((resolve) => {
        this.healthServer!.close(() => {
          logger.info('Health check server closed');
          resolve();
        });
      });
    }

    // Close database connection
    await db.close();

    logger.info('Indexer service shut down successfully');
  }
}

// Create and start service
const service = new IndexerService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal');
  await service.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  await service.shutdown();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  await service.shutdown();
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  logger.error('Unhandled rejection', { reason });
  await service.shutdown();
  process.exit(1);
});

// Start the service
service.start().catch(async (error) => {
  logger.error('Failed to start service', { error: error.message });
  await service.shutdown();
  process.exit(1);
});
