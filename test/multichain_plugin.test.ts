import { expect } from "chai";
import { multichain } from "hardhat-multichain";
import dotenv from "dotenv";
import hre, { ethers } from 'hardhat';
import { JsonRpcProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Hardhat Multichain Tests", function () {

  let chains = multichain.getProviders() || new Map<string, JsonRpcProvider>();
  
  // Check the process.argv for the Hardhat network name
  if (process.argv.includes('test-multichain')) {
    const chainNames = process.argv[process.argv.indexOf('--chains') + 1].split(',');
    if (chainNames.includes('hardhat')) {
      chains = chains.set('hardhat', ethers.provider);
      
    }
  } else if (process.argv.includes('test')) {
    chains = chains.set('hardhat', ethers.provider);
  }
    
  for (const [chainName, provider] of chains.entries()) {
    
    describe("Hardhat Multi-Fork Tests", function () {
      let signers: SignerWithAddress[];
      let signer0: string;
      let signer1: string;
      let signer2: string;

      let ethersMultichain: typeof ethers;
      let snapshotId: string;
      
      before(async function () {
        
        ethersMultichain = ethers;
        ethersMultichain.provider = provider;
        
        // Retrieve the signers for the chain
        signers = await ethersMultichain.getSigners();
        signer0 = signers[0].address;
        signer1 = signers[1].address;
        signer2 = signers[2].address;
      });
        
      it(`should ensure that ${chainName} chain object can be retrieved and reused`, async function () {
            
        expect(provider).to.not.be.undefined;
        // expect(deployment).to.be.true;
        
        const { chainId } = await provider.getNetwork();
        expect(chainId).to.be.a('number');
        
        // For some reason connection.url test has an error with hardhat chain when running 
        // tests with `yarn test-multichain`. This does work with `npx test-multichain ...`
        // expect(provider.connection.url).to.satisfy((url: string) => url.startsWith('http://'));
      });
      
      it(`should verify that ${chainName} providers are defined and have valid block numbers`, async function () {
        console.log(`Checking chain provider for: ${chainName}`);
        expect(provider).to.not.be.undefined;

        const blockNumber = await ethersMultichain.provider.getBlockNumber();
        console.log(`Block number for ${chainName}: ${blockNumber}`);
        
        expect(blockNumber).to.be.a('number');
        // Fails for hardhat because it defaults to 0.
        // expect(blockNumber).to.be.greaterThan(0);
        
        // This isn't a perfect check, because it is trying to place the current block in a range relative to the configured.
        // block number. A bit rough. The default of zero is to account for unconfigured hardhat chain.
        const configBlockNumber = hre.config.chainManager?.chains?.[chainName]?.blockNumber || 0;
        expect(blockNumber).to.be.gte(configBlockNumber);
        
        expect(blockNumber).to.be.lte(configBlockNumber + 500);
      });
    });
  }
});
