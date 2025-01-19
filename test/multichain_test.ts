import { expect } from "chai";
import { ethers, network } from "hardhat";
import { deployContract, MockProvider} from 'ethereum-waffle';
import { Multichain, Multichain__factory } from "../typechain-types";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { waitForNetwork } from "../utils/network-utils";
import { createForkLogger } from "../utils/logger";

describe("Multichain Contract Tests", function () {
  const forks = [
    // { name: "local-ethereum", chainId: 69, url: process.env.ETHEREUM_PROVIDER_URL, port: 8545, blockNumber: 21625925 },
    // { name: "local-polygon", chainId: 42, url: process.env.POLYGON_PROVIDER_URL, port: 8546, blockNumber: 66703587 },
    { name: "local-sepolia", chainId: 11169111, url: process.env.SEPOLIA_PROVIDER_URL, port: 8547, blockNumber: 7200064 },
    { name: "local-amoy", chainId: 80042, url: process.env.AMOY_PROVIDER_URL, port: 8548, blockNumber: 16995897 },
  ];

  const deployerAddress = "0x910bAa33DeB0D614Aa9d80e38b7f0BF87549c2fC";
  
  let contracts: { [chain: string]: Multichain } = {};
  let processes: { [chain: string]: ChildProcessWithoutNullStreams } = {};
  let rpcUrl: { [key: string]: string } = {};

  network.config.chainId = 11169111;
  this.timeout(0); // Extend timeout to 5 minutes
  before(async function () {

    // Start forks in parallel
    await Promise.all(
      forks.map(async (fork) => {

        // Create log file for this fork
        const logger = createForkLogger(fork.name);
        logger.info(`Starting fork: ${fork.name}`);
      
        // Spawn the Hardhat node as a child process
        const child = spawn(
          "hardhat", 
          [
            // "hardhat",
            "node",
            "--fork",
            fork.url || "",
            "--port",
            fork.port.toString(),
            "--fork-block-number",
            fork.blockNumber.toString()
          ],
          {
            env: {
              ...process.env, // Preserve existing environment variables
              HH_CHAIN_ID: fork.chainId.toString(), // Add the custom CHAIN_ID
            },
          }
        );
        
        // Redirect stdout and stderr to logger
        child.stdout.on("data", (data) => logger.info(data.toString()));
        child.stderr.on("data", (data) => logger.error(data.toString()));

        // Handle errors
        child.on("info", (err) => logger.info(`Log starting fork ${fork.name}: ${err.message}`));

        processes[fork.name] = child;

        // Ensure the node is ready before proceeding
        await new Promise((resolve) => setTimeout(resolve, 5000));

        rpcUrl[fork.name] = `http://localhost:${fork.port}`;
         
        try {
          await waitForNetwork(rpcUrl[fork.name], 100000);
          logger.info(`Network at ${rpcUrl[fork.name]} is ready.`);
        } catch (err) {
          if (err instanceof Error) {
            logger.error(`Network validation failed for ${rpcUrl[fork.name]}: ${err.message}`);
          } else {
            logger.error(`Network validation failed for ${rpcUrl[fork.name]}: ${String(err)}`);
          }
          throw err;
        }

        const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
        await provider.send("hardhat_impersonateAccount", [deployerAddress]);

        const deployer = provider.getSigner(deployerAddress);
        
        // Fund the deployer account with setBalance
        await provider.send("hardhat_setBalance", [deployerAddress, "0x56BC75E2D63100000"]);
        console.log(`Deployer Balance ${await deployer.getBalance()}`);

        logger.info(`Deploying Multichain to ${fork.name}`);
        const MultichainFactory = new Multichain__factory(deployer);
        contracts[fork.name] = await MultichainFactory.deploy();
        await contracts[fork.name].deployed();

        logger.info(`Multichain deployed to ${fork.name} at ${contracts[fork.name].address}`);
      })
    );
  });

  it("Should return the correct chain name resolved in the test contract", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
      const deployer = provider.getSigner(deployerAddress);
  
      // Raw call to the contract using JSON-RPC
      const contractAddress = contracts[fork.name].address; // Ensure this is populated with the deployed address
      const contractAbi = Multichain__factory.abi; // ABI of the contract
      const contractInterface = new ethers.utils.Interface(contractAbi);
  
      // Encode the function call
      const data = contractInterface.encodeFunctionData("getChain", []);
  
      // Send a raw JSON-RPC request to `eth_call` the contract
      const result = await provider.send("eth_call", [
        {
          to: contractAddress, // Contract address
          data: data,          // Encoded function call data
        },
        "latest",              // Block tag
      ]);
  
      // Decode the result
      const decoded = contractInterface.decodeFunctionResult("getChain", result);
      const [chainId, chainName] = decoded;
  
      console.log(`Chain ID on ${fork.name}: ${chainId}`);
      console.log(`Chain Name on ${fork.name}: ${chainName}`);
      console.log(`Expected Chain Name: ${fork.name}`);
  
      // Assert the chain name matches the expected fork name
      expect(chainName).to.equal(fork.name);
    }
  });
  
  it("Should return the correct chain name", async function () {
    for (const fork of forks) {
      const [chainId, chainName] = await contracts[fork.name].getChain();
      console.log(chainId.toNumber());
      expect(chainId.toNumber()).to.equal(fork.chainId);
      console.log(chainName)
      expect(chainName).to.equal(fork.name);
    }
  });
  
  it("Should validate the chain ID", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);  
      const networkInfo = await provider.getNetwork();
      console.log(`Chain ID: ${networkInfo.chainId}`);
      console.log(`Fork chain ID: ${fork.chainId}`);
      expect(networkInfo.chainId).to.equal(fork.chainId); 
    }
  });

  it("Should fetch the current block number", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
      const blockNumber = await provider.getBlockNumber();
      console.log(`Current block number: ${blockNumber}`);
      console.log(`Fork block number: ${fork.blockNumber}`);
      expect(blockNumber).to.be.a("number").and.greaterThanOrEqual(fork.blockNumber);
    }
  });

  it("Should retrieve the balance of an account and send ETH to the first signer", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
      ethers.provider=provider;
      const deployer = await provider.getSigner(deployerAddress); // Get the first signer
      const deployerBalance = await provider.getBalance(deployer.getAddress());
      expect(deployerBalance).to.be.instanceOf(ethers.BigNumber); // Check if balance is an instance of BigNumber
      expect(deployerBalance.gt(0)).to.be.true; // Check if balance is greater than 0
      
      const signers = await ethers.getSigners();
      const signer = signers[0];
      const signerBalance = await signer.getBalance()
      console.log(`Signer address: ${signer.address}`);
      console.log(`Signer balance: ${signerBalance}`);
      console.log(`Signer ChainID: ${await signer.getChainId()}`);
      console.log(`Deployer address: ${deployerAddress}`);
      console.log(`Deployer balance: ${deployerBalance}`);
      console.log(`Deployer balance: ${ethers.utils.formatEther(deployerBalance)} ETH`);
      console.log(`Deployer balance: ${deployerBalance.toString()} wei`);
      // send ETH to the first signer from the deployer
      const tx = await deployer.sendTransaction({
        to: signer.address,
        value: ethers.utils.parseEther("1.0"),
      });
      await tx.wait();
      const newSignerBalance = await provider.getBalance(signer.address);
      console.log(`Signer balance after transfer: ${newSignerBalance}`);
      expect(newSignerBalance.gt(signerBalance)).to.be.true; // Check if the new balance is greater than the old balance      
    }
  });

  it("Should query the latest block details", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
      const latestBlock = await provider.getBlock("latest");
      console.log(`Latest block details: ${latestBlock}`);
      console.log(`Latest block number: ${latestBlock.number}`);
      expect(latestBlock).to.have.property("number").that.is.a("number");
      expect(latestBlock).to.have.property("hash").that.is.a("string");
    }
  });

  it("Should send a raw JSON-RPC request", async function () {
    for (const fork of forks) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl[fork.name]);
      const rawChainId = await provider.send("eth_chainId", []);
      console.log(`Raw chain ID: ${parseInt(rawChainId, 16)}`);
      console.log(`Fork chain ID: ${fork.chainId}`);
      expect(parseInt(rawChainId, 16)).to.equal(fork.chainId); // Default Hardhat chain ID
    }
  });

  after(async function () {
    console.log("Stopping forks...");

    // Stop all child processes
    for (const forkName in processes) {
      // This is actually unnecessary since child processes are 'hardhat' they will exit automatically
      const child = processes[forkName];
      child.kill("SIGINT");
      console.log(`Fork ${forkName} stopped.`);
    }
  });
});
