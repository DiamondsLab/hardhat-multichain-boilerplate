import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import "@typechain/hardhat";
import 'hardhat-multichain'; // This must come before the config declaration
import * as dotenv from 'dotenv';
import { task, HardhatUserConfig } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { debug } from 'debug';
import { JsonRpcProvider } from '@ethersproject/providers';
import { 
  NetworkError, 
  ConfigurationError, 
  validateNetworkConfig, 
  createLogger,
  ProcessCleanup 
} from './utils/error-handling';

declare global {
  // eslint-disable-next-line no-var
  var debuglog: debug.Debugger;
}

global.debuglog = debug('GNUSUnitTest:log');
global.debuglog.color = '158';

dotenv.config();

/*
 * Destructuring environment variables required for the configuration.
 * These variables are fetched from the `.env` file to avoid hardcoding sensitive data.
 * - HH_CHAIN_ID: Custom chain ID for the Hardhat network (default is 31337 if not set).
 * - DEPLOYER_PRIVATE_KEY: Private key of the deployer account.
 * - SEPOLIA_RPC: RPC URL for the Sepolia network.
 * - ETHEREUM_RPC: RPC URL for the Ethereum network.
 * - POLYGON_RPC: RPC URL for the Polygon network.
 * - AMOY_RPC: RPC URL for the Amoy network.
 * - ETH_BLOCK: Block number for the Ethereum network.
 * - POLY_BLOCK: Block number for the Polygon network.
 * - AMOY_BLOCK: Block number for the Amoy network.
 * - SEPOLIA_BLOCK: Block number for the Sepolia network.
 */
const { 
  HH_CHAIN_ID,
  DEPLOYER_PRIVATE_KEY, 
  SEPOLIA_RPC, 
  ETHEREUM_RPC,
  POLYGON_RPC,
  AMOY_RPC, 
  ETH_BLOCK,
  POLY_BLOCK,
  AMOY_BLOCK,
  SEPOLIA_BLOCK,
} = process.env;

// Exported constants for reusability in other parts of the project (e.g., testing scripts)
export const ethUrl: string = ETHEREUM_RPC || ""; // Ethereum RPC URL
export const polyUrl: string = POLYGON_RPC || ""; // Polygon RPC URL
export const amoyUrl: string = AMOY_RPC || ""; // Amoy RPC URL
export const sepoliaUrl: string = SEPOLIA_RPC || ""; // Sepolia RPC URL
// These set default values as well so missing environment variables set default to latest block.
export const ethBlock: number = parseInt(ETH_BLOCK || "0"); // Ethereum block number
export const polyBlock: number = parseInt(POLY_BLOCK || "0"); // Polygon block number
export const amoyBlock: number = parseInt(AMOY_BLOCK || "0"); // Amoy block number
export const sepoliaBlock: number = parseInt(SEPOLIA_BLOCK || "0"); // Sepolia block number


let multichainTestHardhat = '';
// If this is a test-multichain task then we parse the --chains argument to get the chain names
if (process.argv.includes('test-multichain') && process.argv.includes('--chains')) {
  const chains = process.argv[process.argv.indexOf('--chains') + 1].split(',');
  if (chains.includes('hardhat') || chains.includes('localhost') || !chains) {
    multichainTestHardhat = 'http://localhost:8545';
  }
}
export const multichainHardhat = multichainTestHardhat;

// Set the default chain ID for the Hardhat network
// Uses `HH_CHAIN_ID` from the environment or defaults to `31337` (Hardhat's default local chain ID)
const MOCK_CHAIN_ID = HH_CHAIN_ID ? parseInt(HH_CHAIN_ID) : 31337;
console.log(`Using chain ID: ${MOCK_CHAIN_ID}`);
// Main Hardhat configuration object
const config: any = { // Using any for now to avoid type conflicts
  // Specifies the Solidity version used for compiling contracts
  solidity: '0.8.3',
  
  chainManager: {
    chains: {
      ethereum: {
        rpcUrl: ethUrl,
        blockNumber: ethBlock,
      }, 
      polygon: {
        rpcUrl: polyUrl,
        blockNumber: polyBlock,
      }, 
      sepolia: {
        rpcUrl: sepoliaUrl,
        blockNumber: sepoliaBlock,
        chainId: 11155111,
      }, 
      amoy: {
        rpcUrl: amoyUrl,
        blockNumber: amoyBlock,
        chainId: 80002
      },
      hardhat: {
        rpc: multichainHardhat,
      }
    }
  },
  
  // We use these in testing to verify the chain ID and block numbers are set correctly
  
  
  // Configuration for different networks
  networks: {
    // Hardhat's built-in local blockchain network
    hardhat: {
      chainId: MOCK_CHAIN_ID, // Sets the chain ID for the Hardhat network
      hardfork: "london", // Use London hardfork for better compatibility
    },
  },

  // Named accounts allow easier referencing of frequently used accounts
  namedAccounts: {
    deployer: 0, // Maps the deployer account to the first account in the wallet
  },
  
  typechain: {
    outDir: "typechain-types", // Specify the output directory for TypeChain-generated files
    target: "ethers-v5",       // Use ethers.js as the target framework
  },

  
  // Mocha configuration for tests
  mocha: {
    timeout: 0, // Disables Mocha's default timeout
  },
};

// Custom Hardhat task definition
// Task Name: `customFork`
// Description: Sets up a forked network for local testing with specific configurations
task(
  'customFork', // Task name
  "Sets the name of the fork, so it's visible in deployment scripts" // Task description
)
  .addParam('n', 'name of forked network') // Adds a parameter `n` for specifying the network name
  .addParam('b', 'block number to fork from') // Adds a parameter `b` for specifying the block number
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const logger = createLogger('customFork');
    
    try {
      // Validate input parameters
      if (!taskArgs.n || !taskArgs.b) {
        throw new ConfigurationError('Both network name (-n) and block number (-b) are required');
      }

      // Setup cleanup handlers
      ProcessCleanup.setupSignalHandlers();

      // Accesses the Hardhat runtime environment (`hre`) to modify runtime configurations
      (hre as any).forkName = taskArgs.n; // Sets the fork name based on the parameter
      const forkBlockNumber = parseInt(taskArgs.b); // Sets the block number to fork from based on the parameter

      if (isNaN(forkBlockNumber) || forkBlockNumber < 0) {
        throw new ConfigurationError(`Invalid block number: ${taskArgs.b}. Must be a positive integer.`);
      }

      let url: string; // RPC URL for the forked network
      let port: number; // Port on which the forked network will run
      let chainId: number; // Chain ID for the forked network

      // Determines the RPC URL and port based on the specified fork name
      switch (taskArgs.n) {
        case 'ethereum':
          url = ethUrl; // Use Ethereum RPC URL
          port = 8545;  // Default port for Ethereum fork
          chainId = 1;
          break;
        case 'polygon':
          url = polyUrl; // Use Polygon RPC URL
          port = 8546; // Default port for Polygon fork
          chainId = 137;
          break;
        case 'sepolia':
          url = sepoliaUrl; // Use Sepolia RPC URL
          port = 8547; // Default port for Sepolia fork
          chainId = 11155111;
          break;
        case 'amoy':
          url = amoyUrl; // Use Amoy RPC URL
          port = 8548; // Default port for Amoy fork
          chainId = 80002;
          break;
        default:
          throw new ConfigurationError(
            `Unsupported fork name: ${taskArgs.n}. Supported networks: ethereum, polygon, sepolia, amoy`
          );
      }

      // Validate that the RPC URL is provided
      if (!url) {
        throw new ConfigurationError(
          `RPC URL for ${taskArgs.n} is not configured. Please set the appropriate environment variable:\n` +
          `- For ${taskArgs.n}: ${taskArgs.n.toUpperCase()}_RPC\n` +
          'Check your .env file and ensure the variable is set with a valid provider URL.'
        );
      }

      logger.info(`Starting ${taskArgs.n} fork on port ${port} at block ${forkBlockNumber}`);
      logger.debug(`RPC URL: ${url}`);
      logger.debug(`Chain ID: ${chainId}`);

      // Test RPC connection before starting fork
      logger.info('Testing RPC connection...');
      try {
        const testProvider = new JsonRpcProvider(url);
        const latestBlock = await testProvider.getBlockNumber();
        logger.success(`RPC connection successful. Latest block: ${latestBlock}`);
        
        if (forkBlockNumber > latestBlock) {
          logger.warn(`Fork block number (${forkBlockNumber}) is higher than latest block (${latestBlock}). Using latest block instead.`);
        }
      } catch (error) {
        throw new NetworkError(
          `Failed to connect to ${taskArgs.n} RPC. Please check your RPC URL and network connectivity.`,
          taskArgs.n,
          error as Error
        );
      }

      // Runs the Hardhat node with the specified forked network and port
      logger.info('Starting Hardhat node...');
      await hre.run('node', {
        fork: url,  // Specifies the network to fork
        port: port, // Specifies the port for the forked node
        forkBlockNumber: forkBlockNumber, // Specifies the block number to fork from
        chainId: chainId, // Sets the chain ID for the forked network
        hostname: '127.0.0.1', // Bind to localhost
      });

    } catch (error) {
      const logger = createLogger('customFork');
      
      if (error instanceof ConfigurationError) {
        logger.error('Configuration Error:', error);
        process.exit(1);
      } else if (error instanceof NetworkError) {
        logger.error('Network Error:', error);
        logger.error('Original error:', error.originalError);
        process.exit(1);
      } else {
        logger.error(`Unexpected error starting ${taskArgs.n} fork:`, error as Error);
        throw error;
      }
    }
  });

// Exports the configuration object to be used by Hardhat
export default config;
