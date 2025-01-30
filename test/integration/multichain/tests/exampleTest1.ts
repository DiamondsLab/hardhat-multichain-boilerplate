import { expect } from 'chai';
import ChainManager from '../setup/chainManager';
import { ethers } from 'hardhat';

describe('Multichain Integration Tests', function () {
  this.timeout(0); // Extend timeout to 5 minutes
    let chains: Map<string, any>;

  before(async function () {
    // Setup chains based on command-line arguments
    const chainArgs = process.env.CHAINS?.split(',') || ['amoy', 'sepolia'];
    chains = await ChainManager.setupChains(chainArgs);
  });

  after(function () {
    // Cleanup chain processes
    ChainManager.cleanup();
  });
  
  it('should check chain provider is defined and has valid blocknumber ', async function () {
    for (const [chainName, provider] of chains.entries()) {
      console.log(`Chain: ${chainName}`);
      const forkProvider = chains.get(chainName);
      expect(forkProvider).to.not.be.undefined;
      
      ethers.provider = forkProvider;
      const blockNumber = await ethers.provider.getBlockNumber();
      console.log(`Block number for ${chainName} fork: ${blockNumber}`);
      console.log('Amoy block number:', blockNumber);
      expect(blockNumber).to.be.a('number');
    }
  });

  it('Should perform check on getting a chain object that exists', async function () {
    for (const [chainName] of chains.entries()) {
      const provider = await ChainManager.getChain(chainName);
      expect(provider).to.not.be.undefined;
      
      ethers.provider = provider;
      const blockNumber = await ethers.provider.getBlockNumber();
      console.log('Amoy block number:', blockNumber);
      expect(blockNumber).to.be.a('number');
    }
  });
});
