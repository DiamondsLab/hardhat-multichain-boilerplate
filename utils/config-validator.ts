import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from './error-handling';

const logger = createLogger('config-validation');

interface ChainConfig {
  rpcUrl?: string;
  rpc?: string;
  blockNumber?: number;
  chainId?: number;
  gasPrice?: string;
  gasLimit?: number;
  timeout?: number;
  retries?: number;
}

interface MultiChainConfig {
  chains: Record<string, ChainConfig>;
}

interface HardhatMultichainConfig {
  chainManager: MultiChainConfig;
}

export class ConfigValidator {

  /**
   * Validate a configuration object
   */
  validate(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check top-level structure
    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    if (!config.chainManager) {
      errors.push('Configuration must have a chainManager property');
      return { isValid: false, errors };
    }

    if (!config.chainManager.chains) {
      errors.push('chainManager must have a chains property');
      return { isValid: false, errors };
    }

    if (typeof config.chainManager.chains !== 'object') {
      errors.push('chains must be an object');
      return { isValid: false, errors };
    }

    // Validate individual chains
    const chainValidation = this.validateChains(config.chainManager.chains);
    errors.push(...chainValidation.errors);

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate individual chain configurations
   */
  validateChains(chains: Record<string, ChainConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [chainName, config] of Object.entries(chains)) {
      // Check that either rpcUrl or rpc is provided
      if (!config.rpcUrl && !config.rpc) {
        errors.push(`Chain '${chainName}': Either 'rpcUrl' or 'rpc' must be provided`);
      }

      // Validate RPC URL format
      const url = config.rpcUrl || config.rpc;
      if (url && !this.isValidUrl(url)) {
        errors.push(`Chain '${chainName}': Invalid RPC URL format: ${url}`);
      }

      // Validate block number
      if (config.blockNumber !== undefined) {
        if (!Number.isInteger(config.blockNumber) || config.blockNumber < 0) {
          errors.push(`Chain '${chainName}': Block number must be a non-negative integer`);
        }
      }

      // Validate chain ID
      if (config.chainId !== undefined) {
        if (!Number.isInteger(config.chainId) || config.chainId < 1) {
          errors.push(`Chain '${chainName}': Chain ID must be a positive integer`);
        }
      }

      // Validate timeout
      if (config.timeout !== undefined) {
        if (!Number.isInteger(config.timeout) || config.timeout < 1000) {
          errors.push(`Chain '${chainName}': Timeout must be at least 1000ms`);
        }
      }

      // Validate retries
      if (config.retries !== undefined) {
        if (!Number.isInteger(config.retries) || config.retries < 0 || config.retries > 10) {
          errors.push(`Chain '${chainName}': Retries must be between 0 and 10`);
        }
      }

      // Validate gas price
      if (config.gasPrice !== undefined) {
        if (!/^[0-9]+$/.test(config.gasPrice)) {
          errors.push(`Chain '${chainName}': Gas price must be a numeric string`);
        }
      }

      // Validate gas limit
      if (config.gasLimit !== undefined) {
        if (!Number.isInteger(config.gasLimit) || config.gasLimit < 21000) {
          errors.push(`Chain '${chainName}': Gas limit must be at least 21000`);
        }
      }

      // Chain name validation
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(chainName)) {
        errors.push(`Invalid chain name '${chainName}': Must start with a letter and contain only letters, numbers, underscores, and hyphens`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Load and validate configuration from file
   */
  loadAndValidateConfig(configPath: string): { isValid: boolean; config?: any; errors: string[] } {
    try {
      if (!fs.existsSync(configPath)) {
        return {
          isValid: false,
          errors: [`Configuration file not found: ${configPath}`]
        };
      }

      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);

      const validation = this.validate(config);
      return {
        isValid: validation.isValid,
        config: validation.isValid ? config : undefined,
        errors: validation.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to load config file: ${error}`]
      };
    }
  }

  /**
   * Generate a sample configuration
   */
  generateSampleConfig(): HardhatMultichainConfig {
    return {
      chainManager: {
        chains: {
          ethereum: {
            rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY',
            blockNumber: 0,
            chainId: 1,
            timeout: 30000,
            retries: 3
          },
          polygon: {
            rpcUrl: 'https://polygon-mainnet.alchemyapi.io/v2/YOUR_API_KEY',
            blockNumber: 0,
            chainId: 137,
            timeout: 30000,
            retries: 3
          }
        }
      }
    };
  }

  /**
   * Validate environment variables for configuration
   */
  validateEnvironmentVars(chainNames: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const chainName of chainNames) {
      const envVarName = `${chainName.toUpperCase()}_RPC`;
      const altEnvVarName = `${chainName.toUpperCase()}_PROVIDER_URL`;

      if (!process.env[envVarName] && !process.env[altEnvVarName]) {
        errors.push(`Missing environment variable for ${chainName}: ${envVarName} or ${altEnvVarName}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://');
    } catch {
      return false;
    }
  }
}

export const configValidator = new ConfigValidator();
