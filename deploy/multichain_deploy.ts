import { DeployFunction, DeployResult } from 'hardhat-deploy/types'; 
import { deployContract } from "../utils/deploy";
import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';

// Define the deployment function
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    try {
        // Deploy the "Multichain" contract using the utility function
        // Passes the runtime environment and the contract name to `deployContract`
        const res: DeployResult = await deployContract(hre, "Multichain", []);
        
        // Logs the deployment details, including the chain ID and deployed contract address
        console.log(`Multichain on ChainID ${hre.network.config.chainId} deployed to ${res.address}`);
    } catch (error) {
        // Error handling for deployment failures
        // Currently, this is empty but can be enhanced with logging or retries.
        console.error("Deployment failed", error);
    }
};

// Export the deployment function as the default export
export default func;
