import { expect } from 'chai';
import ChainManager from '../setup/chainManager';

describe('Multichain Integration Tests', function () {
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

  it('should perform tests on amoy chain', async function () {
    const amoyProvider = chains.get('amoy');
    expect(amoyProvider).to.not.be.undefined;

    const blockNumber = await amoyProvider.getBlockNumber();
    console.log('Amoy block number:', blockNumber);

    expect(blockNumber).to.be.a('number');
  });

  it('should perform tests on sepolia chain', async function () {
    const sepoliaProvider = chains.get('sepolia');
    expect(sepoliaProvider).to.not.be.undefined;

    const blockNumber = await sepoliaProvider.getBlockNumber();
    console.log('Sepolia block number:', blockNumber);

    expect(blockNumber).to.be.a('number');
  });
});
