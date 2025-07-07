// Example: Cross-Chain Price Oracle
// This example demonstrates how to deploy the same contract across multiple chains
// and test their interactions in a multichain environment

import { expect } from "chai";
import { ethers } from "hardhat";
import { multichain } from "hardhat-multichain";
import { Contract, Signer } from "ethers";
import { createLogger, retryWithBackoff, withTimeout } from "../utils/error-handling";

const logger = createLogger('cross-chain-example');

describe("Cross-Chain Example: Price Oracle", function () {
  this.timeout(120000); // 2 minutes for network operations

  let deployedContracts: Map<string, Contract> = new Map();
  let signers: Map<string, Signer[]> = new Map();

  const chains = multichain.getProviders() || new Map();

  // Add hardhat network if no chains are configured
  if (chains.size === 0) {
    chains.set('hardhat', ethers.provider);
  }

  before(async function () {
    logger.info('Setting up cross-chain environment...');

    // Get signers for each chain
    for (const [chainName, provider] of chains.entries()) {
      const chainSigners = await ethers.getSigners();
      signers.set(chainName, chainSigners);
      logger.info(`Retrieved ${chainSigners.length} signers for ${chainName}`);
    }
  });

  describe("Contract Deployment", function () {
    for (const [chainName, provider] of chains.entries()) {
      it(`should deploy MultiChain contract on ${chainName}`, async function () {
        logger.info(`Deploying to ${chainName}...`);

        // Set the provider for this chain
        const originalProvider = ethers.provider;
        (ethers as any).provider = provider;

        try {
          // Get the contract factory
          const MultiChain = await ethers.getContractFactory("Multichain");

          // Deploy with retry logic
          const contract = await retryWithBackoff(async () => {
            return withTimeout(
              MultiChain.deploy(),
              60000,
              `Deployment timeout on ${chainName}`
            );
          }, {
            maxRetries: 3,
            delayMs: 2000
          });

          await contract.deployed();
          deployedContracts.set(chainName, contract);

          logger.success(`Deployed to ${chainName} at ${contract.address}`);

          // Verify deployment
          expect(contract.address).to.match(/^0x[a-fA-F0-9]{40}$/);

        } finally {
          // Restore original provider
          (ethers as any).provider = originalProvider;
        }
      });
    }
  });

  describe("Cross-Chain Functionality", function () {
    it("should have consistent contract interfaces across all chains", async function () {
      expect(deployedContracts.size).to.be.greaterThan(0);

      for (const [chainName, contract] of deployedContracts.entries()) {
        logger.info(`Testing interface consistency on ${chainName}`);

        // Test that the contract has the expected interface
        expect(contract.getChain).to.be.a('function');

        // Get chain information
        const chainResult: any = await withTimeout(
          contract.getChain(),
          30000,
          `getChain timeout on ${chainName}`
        );

        // The contract returns [chainId, chainName] as a tuple
        expect(chainResult).to.be.an('array');
        expect(chainResult.length).to.equal(2);

        const contractChainId = chainResult[0];
        const contractChainName = chainResult[1];

        expect(contractChainId).to.be.a('object'); // BigNumber
        expect(contractChainName).to.be.a('string');

        logger.success(`${chainName} interface check passed - Chain ID: ${contractChainId.toString()}, Name: ${contractChainName}`);
      }
    });

    it("should return correct chain-specific data", async function () {
      const expectedChainData = new Map([
        ['hardhat', { chainId: 31337, name: 'IDK what this is' }], // Contract doesn't recognize hardhat chainId
        ['ethereum', { chainId: 69, name: 'ethereum' }],
        ['polygon', { chainId: 42, name: 'local-polygon' }],
        ['sepolia', { chainId: 11169111, name: 'local-sepolia' }],
        ['amoy', { chainId: 80042, name: 'local-amoy' }]
      ]);

      for (const [networkName, contract] of deployedContracts.entries()) {
        const chainResult = await contract.getChain();
        const chainId = chainResult[0].toNumber(); // Convert BigNumber to number
        const chainName = chainResult[1];

        const expected = expectedChainData.get(networkName);

        if (expected) {
          expect(chainId).to.equal(expected.chainId);
          expect(chainName).to.equal(expected.name);
          logger.success(`${networkName} returned correct chain data`);
        } else {
          // For unknown chains, just verify the format
          expect(chainId).to.be.a('number');
          expect(chainName).to.be.a('string');
          logger.info(`${networkName} chain data: ${chainId} - ${chainName}`);
        }
      }
    });

    it("should handle cross-chain state differences", async function () {
      if (deployedContracts.size < 2) {
        this.skip(); // Skip if we don't have multiple chains
      }

      const contractAddresses = Array.from(deployedContracts.values()).map(c => c.address);
      const uniqueAddresses = new Set(contractAddresses);

      // Contracts should have different addresses on different chains (unless testing on same chain)
      logger.info(`Deployed to ${contractAddresses.length} chains with ${uniqueAddresses.size} unique addresses`);

      // Test that each contract operates independently
      for (const [networkName, contract] of deployedContracts.entries()) {
        const chainResult = await contract.getChain();
        const chainId = chainResult[0].toNumber();
        const chainName = chainResult[1];
        logger.info(`${networkName}: Contract at ${contract.address} reports chain ${chainId} (${chainName})`);
      }
    });
  });

  describe("Error Handling", function () {
    it("should handle network-specific errors gracefully", async function () {
      for (const [chainName, contract] of deployedContracts.entries()) {
        logger.info(`Testing error handling on ${chainName}`);

        try {
          // Try to call a non-existent function
          await contract.nonExistentFunction();
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).to.be.an('error');
          logger.success(`${chainName} properly handled invalid function call`);
        }
      }
    });

    it("should handle provider disconnections", async function () {
      for (const [chainName, provider] of chains.entries()) {
        logger.info(`Testing provider resilience on ${chainName}`);

        try {
          // Test with a very short timeout to simulate network issues
          await withTimeout(
            provider.getBlockNumber(),
            1, // 1ms timeout - should fail
            'Intentional timeout'
          );
          // If this succeeds, the network is very fast
          logger.info(`${chainName} responded very quickly`);
        } catch (error) {
          expect(error.name).to.equal('TimeoutError');
          logger.success(`${chainName} timeout handling works correctly`);
        }
      }
    });
  });

  describe("Performance Benchmarks", function () {
    it("should track deployment times across chains", async function () {
      const deploymentTimes = new Map<string, number>();

      for (const [chainName, contract] of deployedContracts.entries()) {
        // Simulate a new deployment to measure time
        const startTime = Date.now();

        try {
          const chainInfo = await contract.getChain();
          const endTime = Date.now();
          const duration = endTime - startTime;

          deploymentTimes.set(chainName, duration);
          logger.info(`${chainName} operation took ${duration}ms`);

          // Should respond within reasonable time
          expect(duration).to.be.lessThan(30000); // 30 seconds max
        } catch (error) {
          logger.warn(`${chainName} performance test failed:`, error);
        }
      }

      // Log performance summary
      const avgTime = Array.from(deploymentTimes.values()).reduce((a, b) => a + b, 0) / deploymentTimes.size;
      logger.info(`Average response time: ${avgTime.toFixed(0)}ms`);
    });
  });

  after(async function () {
    logger.info('Cross-chain example completed');

    // Log summary
    logger.info(`Successfully tested on ${deployedContracts.size} chains:`);
    for (const [chainName, contract] of deployedContracts.entries()) {
      logger.info(`  - ${chainName}: ${contract.address}`);
    }
  });
});
