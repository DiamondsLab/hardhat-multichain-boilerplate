import { expect } from "chai"; 
import { BigNumber, Contract, Wallet, ethers, providers } from 'ethers';
import { deployContract } from 'ethereum-waffle';
import { MockProvider } from '@ethereum-waffle/provider';
import { ethUrl, polyUrl } from '../hardhat.config'; 
import { HelloWorlds, HelloWorlds__factory } from "../typechain-types";
import config from "../hardhat.config"; 
// Importing the full Hardhat configuration to access specific network settings.

describe("Hello Worlds", function () {

  it("Should return the ethereum mainnet chainid", async function () {
    this.timeout(10000); // Increases the test timeout to 10 seconds.
    // Configuration for forking the Ethereum Mainnet locally.
    const options = { fork: ethUrl }; 
    // Creates a mock blockchain provider with a forked Ethereum Mainnet.
    const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
    // Retrieves test wallets from the provider for use in transactions.
    const wallets: ethers.Wallet[] = provider.getWallets(); 
    // Selects the first wallet as the deployment wallet.
    const deployWallet: Wallet = wallets[0]; 
    // Deploys the `HelloWorlds` contract using the `deployWallet`.
    const helloWorldsContract: Contract = await deployContract(deployWallet, { 
      abi: [...HelloWorlds__factory.abi], 
      bytecode: HelloWorlds__factory.bytecode 
    });
    
    // Expected chain ID for Ethereum Mainnet.
    const resultNumber: BigNumber = BigNumber.from(1); 
    // Expected chain name for Ethereum Mainnet.
    const chain: string = "ethereum"; 
    // Calls the `getChain` function from the deployed contract.
    const res = await helloWorldsContract.getChain(); 
    // Asserts that the returned chain ID matches the expected value.
    expect(res[0].eq(resultNumber)); 
    // Asserts that the returned chain name matches the expected value.
    expect(res[1]).to.equal(chain); 
  });

  it("Should return the polygon mainnet chainid", async function () {
    this.timeout(10000); // Increases the test timeout to 10 seconds.
    // Test case for verifying the Polygon Mainnet chain ID.
    const options = { fork: polyUrl, _chainId: 137 }; 
    // Configuration for forking the Polygon Mainnet locally with chain ID 137.
    const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
    const wallets: Wallet[] = provider.getWallets(); 
    const deployWallet: Wallet = wallets[0]; 
    const helloWorldsContract: Contract = await deployContract(deployWallet, { 
      abi: [...HelloWorlds__factory.abi], 
      bytecode: HelloWorlds__factory.bytecode 
    });

    const resultNumber: BigNumber = BigNumber.from(137); 
    const chain: string = "polygon"; 
    const res = await helloWorldsContract.getChain(); 
    expect(res[0].eq(resultNumber)); 
    expect(res[1]).to.equal(chain); 
  });

  it("Should return the sepolia testnet chainid", async function () {
    this.timeout(10000); // Increases the test timeout to 10 seconds.
    // Test case for verifying the Sepolia Testnet chain ID.
    const options = { 
      fork: config.networks.sepolia.url, 
      _chainId: config.networks.sepolia.chainId 
    }; 
    // Configuration for forking the Sepolia Testnet locally.

    const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
    const wallets: Wallet[] = provider.getWallets(); 
    const deployWallet: Wallet = wallets[0]; 

    const helloWorldsContract: Contract = await deployContract(deployWallet, { 
      abi: [...HelloWorlds__factory.abi], 
      bytecode: HelloWorlds__factory.bytecode 
    });

    const resultNumber: BigNumber = BigNumber.from(11155111); 
    const chain: string = "sepolia"; 

    const res = await helloWorldsContract.getChain(); 
    expect(res[0].eq(resultNumber)); 
    expect(res[1]).to.equal(chain); 
  });

  it("Should return the amoy testnet chainid", async function () {
    this.timeout(10000); // Increases the test timeout to 10 seconds.
    // Test case for verifying the Amoy Testnet chain ID.
    const options = { 
      fork: config.networks.amoy.url, 
      _chainId: config.networks.amoy.chainId 
    }; 
    // Configuration for forking the Amoy Testnet locally.

    const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
    const wallets: Wallet[] = provider.getWallets(); 
    const deployWallet: Wallet = wallets[0]; 

    const helloWorldsContract: Contract = await deployContract(deployWallet, { 
      abi: [...HelloWorlds__factory.abi], 
      bytecode: HelloWorlds__factory.bytecode 
    });

    const resultNumber: BigNumber = BigNumber.from(80002); 
    const chain: string = "amoy"; 

    const res = await helloWorldsContract.getChain(); 
    expect(res[0].eq(resultNumber)); 
    expect(res[1]).to.equal(chain); 
  });
});
