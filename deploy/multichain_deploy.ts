import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { deployContract } from "../utils/deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  try {
    // Validate network name to ensure the correct network is targeted
    const networkName = hre.network.name;
    console.log(`Deploying to network: ${networkName}`);

    // if (!["localhost"].includes(networkName)) {
    //   throw new Error(`Deployment should only occur on localhost forks, not on ${networkName}`);
    // }

    // Deploy the "Multichain" contract using the utility function
    const res: DeployResult = await deployContract(hre, "Multichain", []);

    // Log the deployment details
    console.log(`Multichain on ChainID ${hre.network.config.chainId} deployed to ${res.address}`);
  } catch (error) {
    // Log deployment failures for debugging
    console.error("Deployment failed:", error);
  }
};

export default func;
