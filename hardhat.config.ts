import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import "@typechain/hardhat";
import * as dotenv from 'dotenv';
// import { task, HardhatUserConfig } from 'hardhat/config';
// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import exp from 'constants';
import { debug } from 'debug';
import 'hardhat-multichain';

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

// Set the default chain ID for the Hardhat network
// Uses `HH_CHAIN_ID` from the environment or defaults to `31337` (Hardhat's default local chain ID)
const MOCK_CHAIN_ID = HH_CHAIN_ID ? parseInt(HH_CHAIN_ID) : 31337;
console.log(`Using chain ID: ${MOCK_CHAIN_ID}`);

// Main Hardhat configuration object
const config = {
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
        chainId: 11169111 
      }, 
      amoy: {
        rpcUrl: amoyUrl,
        blockNumber: amoyBlock,
        chainId: 11180002
      },
    }
  },
  
  // We use these in testing to verify the chain ID and block numbers are set correctly
  
  
  // Configuration for different networks
  networks: {
    // Hardhat's built-in local blockchain network
    hardhat: {
      chainId: MOCK_CHAIN_ID, // Sets the chain ID for the Hardhat network
      // Sets the Amoy hardfork history which is required for hardhat "unknown" networks
      80002: {
        hardforkHistory: {
          london: 10000000,
        }
      },
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

// // Custom Hardhat task definition
// // Task Name: `customFork`
// // Description: Sets up a forked network for local testing with specific configurations
// task(
//   'customFork', // Task name
//   "Sets the name of the fork, so it's visible in deployment scripts" // Task description
// )
//   .addParam('n', 'name of forked network') // Adds a parameter `n` for specifying the network name
//   .addParam('b', 'block number to fork from') // Adds a parameter `b` for specifying the block number
//   .setAction(async (taskArgs, hre) => {
//     // Accesses the Hardhat runtime environment (`hre`) to modify runtime configurations
//     hre.forkName = taskArgs.n; // Sets the fork name based on the parameter
//     const forkBlockNumber = taskArgs.b; // Sets the block number to fork from based on the parameter

//     let url; // RPC URL for the forked network
//     let port; // Port on which the forked network will run

//     // Determines the RPC URL and port based on the specified fork name
//     if (hre.forkName === 'ethereum') {
//       url = ethUrl; // Use Ethereum RPC URL
//       port = 8545;  // Default port for Ethereum fork
//     } else if (hre.forkName === 'polygon') {
//       url = polyUrl; // Use Polygon RPC URL
//       port = 8546; // Default port for Polygon fork
//     } else if (hre.forkName === 'sepolia') {
//       url = sepoliaUrl; // Use Sepolia RPC URL
//       port = 8547; // Default port for Sepolia fork
//     } else if (hre.forkName === 'amoy') {
//       url = amoyUrl; // Use Amoy RPC URL
//       port = 8548; // Default port for Amoy fork
//     }
//     else {
//       throw 'Incorrect fork name!'; // Throws an error if the fork name is invalid
//     }

    // // Runs the Hardhat node with the specified forked network and port
    // await hre.run('node', {
    //   fork: url,  // Specifies the network to fork
    //   port: port, // Specifies the port for the forked node
    //   blockNumber: forkBlockNumber, // Specifies the block number to fork from
    //   chainId: MOCK_CHAIN_ID, // Sets the chain ID for the forked network
    // });
  // });
};

// Exports the configuration object to be used by Hardhat
export default config;
