import { expect } from "chai";
import { multichain } from "hardhat-multichain";
import dotenv from "dotenv";
import hre from 'hardhat';
import { ethers } from "hardhat";
import { JsonRpcProvider } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { retryWithBackoff, withTimeout, createLogger } from "../utils/error-handling";

// Load environment variables
dotenv.config();

describe("Hardhat Multichain Tests", function () {
  // Increase default timeout for network operations
  this.timeout(120000); // 2 minutes

  const logger = createLogger('multichain-tests');
  let chains = multichain.getProviders() || new Map<string, JsonRpcProvider>();

  // Check the process.argv for the Hardhat network name
  if (process.argv.includes('test-multichain')) {
    const chainNames = process.argv[process.argv.indexOf('--chains') + 1]?.split(',') || [];
    if (chainNames.includes('hardhat')) {
      chains = chains.set('hardhat', (hre as any).ethers.provider);
    }
  } else if (process.argv.includes('test')) {
    chains = chains.set('hardhat', (hre as any).ethers.provider);
  }

  // If no chains are available, add hardhat as fallback
  if (chains.size === 0) {
    logger.warn('No chains detected, falling back to hardhat network');
    chains = chains.set('hardhat', (hre as any).ethers.provider);
  }

  for (const [chainName, provider] of chains.entries()) {

    describe(`Multi-Fork Tests for ${chainName}`, function () {
      let signers: HardhatEthersSigner[];
      let signer0: string;
      let signer1: string;
      let signer2: string;

      let ethersMultichain: typeof ethers;
      let snapshotId: string;

      before(async function () {
        logger.info(`Setting up tests for ${chainName}`);

        try {
          ethersMultichain = ethers;
          // No need to assign provider directly - use the provider from multichain

          // Test provider connection with timeout and retry
          await retryWithBackoff(async () => {
            return withTimeout(
              provider.getNetwork(),
              30000, // 30 second timeout
              'Failed to connect to provider within 30 seconds'
            );
          }, {
            maxRetries: 3,
            delayMs: 2000
          });

          // Retrieve the signers for the chain with timeout
          signers = await withTimeout(
            ethersMultichain.getSigners(),
            15000,
            'Failed to get signers within 15 seconds'
          );

          signer0 = signers[0].address;
          signer1 = signers[1].address;
          signer2 = signers[2].address;

          logger.success(`Setup completed for ${chainName}`);
        } catch (error) {
          logger.error(`Setup failed for ${chainName}:`, error as Error);
          throw error;
        }
      });

      beforeEach(async function () {
        try {
          // Take a snapshot before each test
          snapshotId = await provider.send('evm_snapshot', []);
          logger.debug(`Snapshot taken: ${snapshotId}`);
        } catch (error) {
          logger.warn(`Failed to take snapshot for ${chainName}:`, error);
          // Don't fail the test if snapshot fails
        }
      });

      afterEach(async function () {
        try {
          // Restore snapshot after each test
          if (snapshotId) {
            await provider.send('evm_revert', [snapshotId]);
            logger.debug(`Snapshot restored: ${snapshotId}`);
          }
        } catch (error) {
          logger.warn(`Failed to restore snapshot for ${chainName}:`, error);
          // Don't fail the test if snapshot restoration fails
        }
      });

      it(`should ensure that ${chainName} chain object can be retrieved and reused`, async function () {
        logger.info(`Testing chain object retrieval for ${chainName}`);

        expect(provider).to.not.be.undefined;
        // Check if it's either JsonRpcProvider or HardhatEthersProvider
        expect(provider.constructor.name).to.match(/JsonRpcProvider|HardhatEthersProvider/);

        const network = await provider.getNetwork();
        expect(network.chainId).to.be.a('bigint');
        expect(network.chainId).to.be.greaterThan(BigInt(0));

        logger.success(`Chain object test passed for ${chainName} (chainId: ${network.chainId})`);
      });

      it(`should verify that ${chainName} providers are defined and have valid block numbers`, async function () {
        logger.info(`Checking chain provider for: ${chainName}`);

        expect(provider).to.not.be.undefined;

        const blockNumber = await withTimeout(
          provider.getBlockNumber(),
          30000,
          'Failed to get block number within 30 seconds'
        );

        logger.info(`Block number for ${chainName}: ${blockNumber}`);

        expect(blockNumber).to.be.a('number');
        expect(blockNumber).to.be.greaterThanOrEqual(0);

        // This isn't a perfect check, because it is trying to place the current block in a range relative to the configured
        // block number. A bit rough. The default of zero is to account for unconfigured hardhat chain.
        const configBlockNumber = (hre.config as any).chainManager?.chains?.[chainName]?.blockNumber || 0;

        if (configBlockNumber > 0) {
          expect(blockNumber).to.be.gte(configBlockNumber);
          expect(blockNumber).to.be.lte(configBlockNumber + 1000);
        }

        logger.success(`Block number test passed for ${chainName}`);
      });

      it(`should verify signers are available for ${chainName}`, async function () {
        logger.info(`Testing signers for ${chainName}`);

        expect(signers).to.be.an('array');
        expect(signers.length).to.be.greaterThan(0);

        expect(signer0).to.be.a('string');
        expect(signer0).to.match(/^0x[a-fA-F0-9]{40}$/);

        // Test that we can get balance
        const balance = await withTimeout(
          provider.getBalance(signer0),
          15000,
          'Failed to get balance within 15 seconds'
        ) as bigint;

        expect(balance).to.not.be.undefined;
        logger.success(`Signer test passed for ${chainName} (balance: ${ethers.formatEther(balance)} ETH)`);
      });

      it(`should handle network errors gracefully for ${chainName}`, async function () {
        logger.info(`Testing error handling for ${chainName}`);

        try {
          // Test an invalid RPC call
          await provider.send('invalid_method', []);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).to.be.an('error');
          logger.success(`Error handling test passed for ${chainName}`);
        }
      });
    });
  }

  describe("Configuration Tests", function () {
    it("should have valid hardhat configuration", function () {
      expect(hre.config).to.not.be.undefined;
      expect(hre.config.solidity).to.not.be.undefined;
      expect(hre.config.networks).to.be.an('object');
    });

    it("should have chainManager configuration if plugin is loaded", function () {
      if ((hre.config as any).chainManager) {
        expect((hre.config as any).chainManager).to.be.an('object');
        expect((hre.config as any).chainManager.chains).to.be.an('object');
      }
    });
  });
});
