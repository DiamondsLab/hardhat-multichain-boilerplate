import { debug } from 'debug';

const logger = debug('hardhat-multichain-boilerplate');

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public networkName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public configField?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    maxDelayMs = 30000
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger(`Final attempt failed: ${error}`);
        break;
      }

      logger(`Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms: ${error}`);
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(
        errorMessage || `Operation timed out after ${timeoutMs}ms`,
        timeoutMs
      ));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(networkName: string, config: any): void {
  if (!config.rpcUrl && !config.url) {
    throw new ConfigurationError(
      `RPC URL not configured for network '${networkName}'. ` +
      'Please set the appropriate environment variable.',
      'rpcUrl'
    );
  }

  if (config.blockNumber && (isNaN(config.blockNumber) || config.blockNumber < 0)) {
    throw new ConfigurationError(
      `Invalid block number for network '${networkName}': ${config.blockNumber}. ` +
      'Block number must be a positive integer.',
      'blockNumber'
    );
  }
}

/**
 * Safe process cleanup utility
 */
export class ProcessCleanup {
  private static cleanup: Array<() => Promise<void> | void> = [];

  static register(cleanupFn: () => Promise<void> | void): void {
    this.cleanup.push(cleanupFn);
  }

  static async executeAll(): Promise<void> {
    logger('Executing cleanup tasks...');
    
    const cleanupPromises = this.cleanup.map(async (fn, index) => {
      try {
        await fn();
        logger(`Cleanup task ${index + 1} completed`);
      } catch (error) {
        logger(`Cleanup task ${index + 1} failed: ${error}`);
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.cleanup = [];
    logger('All cleanup tasks completed');
  }

  static setupSignalHandlers(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger(`Received ${signal}, performing cleanup...`);
        await this.executeAll();
        process.exit(0);
      });
    });

    process.on('exit', () => {
      logger('Process exiting, final cleanup...');
    });
  }
}

/**
 * Enhanced logging utility
 */
export function createLogger(namespace: string) {
  const log = debug(namespace);
  
  return {
    debug: (message: string, ...args: any[]) => log(`[DEBUG] ${message}`, ...args),
    info: (message: string, ...args: any[]) => {
      log(`[INFO] ${message}`, ...args);
      console.log(`ℹ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      log(`[WARN] ${message}`, ...args);
      console.warn(`⚠ ${message}`, ...args);
    },
    error: (message: string, error?: Error, ...args: any[]) => {
      log(`[ERROR] ${message}`, error, ...args);
      console.error(`❌ ${message}`, error, ...args);
    },
    success: (message: string, ...args: any[]) => {
      log(`[SUCCESS] ${message}`, ...args);
      console.log(`✅ ${message}`, ...args);
    }
  };
}
