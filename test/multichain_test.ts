import { expect } from "chai";
import { ethers } from "hardhat";
import { Multichain, Multichain__factory } from "../typechain-types";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs";
import { waitForNetwork } from "../utils/network-utils";
import { createForkLogger } from "../utils/logger";

describe("Multichain Contract Tests", function () {
  const forks = [
    // { name: "local-ethereum", chainId: 69, url: process.env.ETHEREUM_PROVIDER_URL, port: 8545, blockNumber: 21625925 },
    // { name: "local-polygon", chainId: 42, url: process.env.POLYGON_PROVIDER_URL, port: 8546, blockNumber: 66703587 },
    { name: "local-sepolia", chainId: 11169111, url: process.env.SEPOLIA_PROVIDER_URL, port: 8547, blockNumber: 7200064 },
    { name: "local-amoy", chainId: 80042, url: process.env.AMOY_PROVIDER_URL, port: 8548, blockNumber: 15975574 },
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

        // Validate the network is running
        const rpcUrl = `http://localhost:${fork.port}`;
        try {
          await waitForNetwork(rpcUrl, 100000);
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

  it("Should return the correct chain ID and name", async function () {
    for (const fork of forks) {
      const [chainId, chainName] = await contracts[fork.name].getChain();
      console.log(chainId.toNumber());
      expect(chainId.toNumber()).to.equal(fork.chainId);
      console.log(chainName)
      expect(chainName).to.equal(fork.name);
    }
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
});
