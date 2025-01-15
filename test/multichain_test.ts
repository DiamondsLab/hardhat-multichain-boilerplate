import { expect } from "chai";
import { ethers } from "hardhat";
import { Multichain, Multichain__factory } from "../typechain-types";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs";
import { waitForNetwork } from "../utils/network-utils";
import { createForkLogger } from "../utils/logger";

describe("Multichain Contract Tests", function () {
  const forks = [
    // { name: "ethereum", chainId: 1, url: process.env.ETHEREUM_PROVIDER_URL, port: 8545, blockNumber: 21625925 },
    // { name: "polygon", chainId: 137, url: process.env.POLYGON_PROVIDER_URL, port: 8546, blockNumber: 66703587 },
    // { name: "sepolia", chainId: 11155111, url: process.env.SEPOLIA_PROVIDER_URL, port: 8547, blockNumber: 7200064 },
    { name: "amoy", chainId: 80002, url: process.env.AMOY_PROVIDER_URL, port: 8548, blockNumber: 15975574 },
  ];

  let contracts: { [chain: string]: Multichain } = {};
  let processes: { [chain: string]: ChildProcessWithoutNullStreams } = {};

  before(async function () {
    this.timeout(300000); // Extend timeout to 5 minutes

    // Start forks in parallel
    await Promise.all(
      forks.map(async (fork) => {

        // Create log file for this fork
        const logger = createForkLogger(fork.name);
        logger.info(`Starting fork: ${fork.name}`);
      
        // Spawn the Hardhat node as a child process
        const child = spawn("npx", [
          "hardhat",
          "node",
          "--fork",
          fork.url || "",
          "--port",
          fork.port.toString(),
          "--fork-block-number",
          fork.blockNumber.toString(),
        ]);

        // Redirect stdout and stderr to logger
        child.stdout.on("data", (data) => logger.info(data.toString()));
        child.stderr.on("data", (data) => logger.error(data.toString()));

        // Handle errors
        child.on("Log", (err) => logger.error(`Log starting fork ${fork.name}: ${err.message}`));

        processes[fork.name] = child;

        // Ensure the node is ready before proceeding
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Validate the network is running
        const rpcUrl = `http://localhost:${fork.port}`;
        try {
          await waitForNetwork(rpcUrl);
          logger.info(`Network at ${rpcUrl} is ready.`);
        } catch (err) {
          if (err instanceof Error) {
            logger.error(`Network validation failed for ${rpcUrl}: ${err.message}`);
          } else {
            logger.error(`Network validation failed for ${rpcUrl}: ${String(err)}`);
          }
          throw err;
        }

        // Deploy the contract
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", provider);

        logger.info(`Deploying Multichain to ${fork.name}`);
        const MultichainFactory = new Multichain__factory(deployer);
        contracts[fork.name] = await MultichainFactory.deploy();
        await contracts[fork.name].deployed();

        logger.info(`Multichain deployed to ${fork.name} at ${contracts[fork.name].address}`);
      })
    );
  });

  after(async function () {
    console.log("Stopping forks...");

    // Stop all child processes
    for (const forkName in processes) {
      const child = processes[forkName];
      child.kill("SIGINT");
      console.log(`Fork ${forkName} stopped.`);
    }
  });

  it("Should return the correct chain ID and name", async function () {
    for (const fork of forks) {
      const [chainId, chainName] = await contracts[fork.name].getChain();
      console.log(chainId.toNumber());
      // expect(chainId.toNumber()).to.equal(fork.chainId);
      expect(chainName).to.equal(fork.name);
    }
  });
});



// import { expect } from "chai";
// import hre, { network, run } from "hardhat";
// import { Multichain, Multichain__factory } from "../typechain-types";
// // import { debug } from "debug";
// import * as fs from "fs";
// import { EthereumProvider } from "hardhat/types";
// // import { expect } from "chai"; 
// import { BigNumber, Contract, Wallet, ethers, providers } from 'ethers';
// import { deployContract } from 'ethereum-waffle';
// import { MockProvider } from '@ethereum-waffle/provider';
// import { ethUrl, polyUrl } from '../hardhat.config'; 
// // import { Multichain, Multichain__factory } from "../typechain-types";
// import config from "../hardhat.config"; 
// import { fork, execSync } from "child_process";
// import { spawn, ChildProcessWithoutNullStreams } from "child_process";

// // import { chainId } from "viem/_types/utils/chain/extractChain";

// // describe("Multichain Contract Tests", function () {
// //   const forks  = [
// //     // { name: "ethereum", chainId: 69, url: process.env.ETHEREUM_PROVIDER_URL, port: 8545, blockNumber: 21625925 },
// //     // { name: "polygon", chainId: 42, url: process.env.POLYGON_PROVIDER_URL, port: 8546, blockNumber: 66703587 },
// //     // { name: "sepolia", chainId: 690, url: process.env.SEPOLIA_PROVIDER_URL, port: 8547, blockNumber: 7200064 },
// //     { name: "amoy", chainId: 420, url: process.env.AMOY_PROVIDER_URL, port: 8548, blockNumber: 16869384 },
// //   ];

// //   let contracts: { [chain: string]: Multichain } = {};

// //   before(async function () {
// //     this.timeout(100000); // Extend timeout to 5 minutes
  
// //     // Run forks and deploy contracts in parallel
// //     await Promise.all(
// //       forks.map(async (fork) => {
// //         console.log(`Starting fork: ${fork.name}`);
// //         await hre.run("node", {
// //           fork: fork.url,
// //           port: fork.port,
// //           blockNumber: fork.blockNumber,
// //           chainId: fork.chainId,
// //         });
// //         console.log(`Fork ${fork.name} started`);
        
// //         // Set the provider for the forked network
// //         hre.network.provider = new ethers.providers.JsonRpcProvider(`http://localhost:${fork.port}`) as any;

// //         console.log(`Deploying Multichain to ${fork.name}`);
// //         const deployFunction = await import("../deploy/multichain_deploy");
// //         await deployFunction.default(hre);

// //         const MultichainFactory = new Multichain__factory(hre.network.provider.getSigner());
// //         const deployedContract = await MultichainFactory.attach(hre.network.provider);
// //         contracts[fork.name] = deployedContract;
        
// //         // const provider = await new ethers.providers.JsonRpcProvider(`http://localhost:${fork.port}`);
// //         // const deployer = await  new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", provider);
  
// //         // console.log(`Deploying Multichain to ${fork.name}`);
// //         // const MultichainFactory = new Multichain__factory(deployer);
// //         // contracts[fork.name] = await MultichainFactory.deploy();
// //         // await contracts[fork.name].deployed();
  
// //         console.log(`Multichain deployed to ${fork.name} at ${contracts[fork.name].address}`);
// //       })
// //     );
// //   });
  

// //   after(async function () {
// //     console.log("Stopping forks...");
// //     // No explicit cleanup is needed because Hardhat stops nodes when the process exits
// //   });

// //   // Test each chain
// //   for (const fork of forks) {
// //     it(`Should return the correct chain ID and name for ${fork.name}`, async function () {
// //       const contract = contracts[fork.name];
// //       const [chainId, chainName] = await contract.getChain();
// //       console.log(chainId.toNumber());
// //       console.log(fork.chainId);
// //       console.log(chainName);
// //       expect(chainId.toNumber()).to.equal(fork.chainId);
// //       expect(chainName).to.equal(fork.name);
// //     });
    
// //   }
// // });

// /*********** */

// // describe("Multichain Contract Tests", function () {
// //   const forks = [
// //     { name: "ethereum", chainId: 1, port: 8545, blockNumber: 21625925 },
// //     { name: "polygon", chainId: 137, port: 8546, blockNumber:  66703587 },
// //     { name: "sepolia", chainId: 11155111, port: 8547, blockNumber:  7200064 },
// //     { name: "amoy", chainId: 80002, port: 8548, blockNumber: 16869384 },
// //   ];
  
// //   let contracts: { [chain: string]: Multichain } = {};

// //   before(async function () {
// //     this.timeout(60000); // Set a timeout to allow forks to initialize

// //     // Start all forks in parallel
// //     for (const fork of forks) {
// //       console.log(`Starting fork: ${fork.name}`);
// //       execSync(
// //         `yarn hardhat customFork --n ${fork.name} --b ${fork.blockNumber} --port ${fork.port}`,
// //         { stdio: "inherit" }
// //       );
// //     }

// //     // Deploy the contract to each fork
// //     for (const fork of forks) {
// //       const provider = new ethers.providers.JsonRpcProvider(
// //         `http://localhost:${fork.port}`
// //       );
// //       const deployer = new ethers.Wallet(
// //         process.env.DEPLOYER_PRIVATE_KEY || "",
// //         provider
// //       );

// //       console.log(`Deploying Multichain to ${fork.name}`);
// //       const MultichainFactory = new Multichain__factory(deployer);
// //       contracts[fork.name] = await MultichainFactory.deploy();
// //       await contracts[fork.name].deployed();
// //       console.log(
// //         `Multichain deployed to ${fork.name} at ${contracts[fork.name].address}`
// //       );
// //     }
// //   });

// //   after(async function () {
// //     // Stop all forked networks
// //     for (const fork of forks) {
// //       console.log(`Stopping fork: ${fork.name}`);
// //       execSync(`kill $(lsof -t -i:${fork.port})`, { stdio: "inherit" });
// //     }
// //   });

// //   // Test each chain
// //   for (const fork of forks) {
// //     it(`Should return the correct chain ID and name for ${fork.name}`, async function () {
// //       const contract = contracts[fork.name];
// //       const [chainId, chainName] = await contract.getChain();
// //       expect(chainId.toNumber()).to.equal(fork.chainId);
// //       expect(chainName).to.equal(fork.name);
// //     });
// //   }
// // });

// /************************************************ */

// describe("Multichain Contract Tests2", function () {

//   const forks  = [
//     // { name: "ethereum", chainId: 69, url: process.env.ETHEREUM_PROVIDER_URL, port: 8545, blockNumber: 21625925 },
//     // { name: "polygon", chainId: 42, url: process.env.POLYGON_PROVIDER_URL, port: 8546, blockNumber: 66703587 },
//     // { name: "sepolia", chainId: 690, url: process.env.SEPOLIA_PROVIDER_URL, port: 8547, blockNumber: 7200064 },
//     { name: "amoy", chainId: 420, url: process.env.AMOY_PROVIDER_URL, port: 8548, blockNumber: 16869384 },
//   ];
  
//     before(async function () {
//     this.timeout(100000); // Extend timeout to 5 minutes
  
//     // Run forks and deploy contracts in parallel
//     await Promise.all(
//       forks.map(async (fork) => {
//         console.log(`Starting fork: ${fork.name}`);
//         await hre.run("node", {
//           fork: fork.url,
//           port: fork.port,
//           blockNumber: fork.blockNumber,
//           chainId: fork.chainId,
//         });
//         console.log(`Fork ${fork.name} started`);
//       })
//     );
//   });
  
//   // it("Should return the ethereum mainnet chainid", async function () {
//   //   this.timeout(1000000); // Increases the test timeout to 10 seconds.
//   //   // Configuration for forking the Ethereum Mainnet locally.
//   //   const options = { fork: ethUrl, fork_block_number: 21274700 }; 
//   //   // Creates a mock blockchain provider with a forked Ethereum Mainnet.
//   //   const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
//   //   // Retrieves test wallets from the provider for use in transactions.
//   //   const wallets: ethers.Wallet[] = provider.getWallets(); 
//   //   // Selects the first wallet as the deployment wallet.
//   //   const deployWallet: Wallet = wallets[0]; 
//   //   // Deploys the `Multichain` contract using the `deployWallet`.
//   //   const multichainContract: Contract = await deployContract(deployWallet, { 
//   //     abi: [...Multichain__factory.abi], 
//   //     bytecode: Multichain__factory.bytecode 
//   //   }, [], { gasLimit: 5000000 });
    
//   //   // Expected chain ID for Ethereum Mainnet.
//   //   const resultNumber: BigNumber = BigNumber.from(1); 
//   //   // Expected chain name for Ethereum Mainnet.
//   //   const chain: string = "ethereum"; 
//   //   // Calls the `getChain` function from the deployed contract.
//   //   const res = await multichainContract.getChain(); 
//   //   // Asserts that the returned chain ID matches the expected value.
//   //   expect(res[0].eq(resultNumber)); 
//   //   // Asserts that the returned chain name matches the expected value.
//   //   expect(res[1]).to.equal(chain); 
//   // });

//   // it("Should return the polygon mainnet chainid", async function () {
//   //   this.timeout(1000000); // Increases the test timeout to 10 seconds.
//   //   // Test case for verifying the Polygon Mainnet chain ID.
//   //   const options = { fork: polyUrl, _chainId: 137, fork_block_number: 52914554 }; 
//   //   // Configuration for forking the Polygon Mainnet locally with chain ID 137.
//   //   const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
//   //   const wallets: Wallet[] = provider.getWallets(); 
//   //   const deployWallet: Wallet = wallets[0]; 
//   //   const multichainContract: Contract = await deployContract(deployWallet, { 
//   //     abi: [...Multichain__factory.abi], 
//   //     bytecode: Multichain__factory.bytecode 
//   //   }, [], { gasLimit: 5000000 });

//   //   const resultNumber: BigNumber = BigNumber.from(137);
//   //   const chain: string = "polygon";
//   //   const res = await multichainContract.getChain();
//   //   expect(res[0].eq(resultNumber)); 
//   //   expect(res[1]).to.equal(chain); 
//   // });

//   it("Should return the sepolia testnet chainid", async function () {
//     // this.timeout(1000000); // Increases the test timeout to 10 seconds.
//     // Test case for verifying the Sepolia Testnet chain ID.
//     const chainID = config.networks.sepoliaHardhat.chainId;
//     const options = { 
//       fork: config.networks.sepoliaHardhat.url, 
//       _chainId: config.networks.sepoliaHardhat.chainId, 
//     }; 
//     // Configuration for forking the Sepolia Testnet locally.

//     const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
//     const wallets: Wallet[] = provider.getWallets(); 
//     const deployWallet: Wallet = wallets[0]; 

//     // Add a delay to avoid hitting rate limits
//     await new Promise(resolve => setTimeout(resolve, 5000));
    
//     const multichainContract: Contract = await deployContract(deployWallet, { 
//       abi: [...Multichain__factory.abi], 
//       bytecode: Multichain__factory.bytecode 
//     }, [], { gasLimit: 5000000 });

//     const contractProperties = await multichainContract.getChain(); 
//     const contractChainId: BigNumber = contractProperties[0].toNumber();
//     // print the result to the console
//     console.log(chainID);
//     expect(contractChainId.eq(chainID)); 
//   });

// //   it("Should return the amoy testnet chainid", async function () {
// //     this.timeout(1000000); // Increases the test timeout to 10 seconds.
// //     // Test case for verifying the Amoy Testnet chain ID.
// //     const options = { 
// //       fork: config.networks.amoy.url, 
// //       _chainId: config.networks.amoy.chainId ,
// //       fork_block_number: config.networks.amoy.blocknumber,
// //     }; 
// //     // Configuration for forking the Amoy Testnet locally.

// //     const provider: MockProvider = new MockProvider({ ganacheOptions: options }); 
// //     const wallets: Wallet[] = provider.getWallets(); 
// //     const deployWallet: Wallet = wallets[0]; 

// //     const multichainContract: Contract = await deployContract(deployWallet, { 
// //       abi: [...Multichain__factory.abi], 
// //       bytecode: Multichain__factory.bytecode 
// //     }, [], { gasLimit: 5000000 });

// //     const resultNumber: BigNumber = BigNumber.from(80002); 
// //     const chain: string = "amoy"; 

// //     const res = await multichainContract.getChain(); 
// //     expect(res[0].eq(resultNumber)); 
// //     expect(res[1]).to.equal(chain); 
// //   });
// });
