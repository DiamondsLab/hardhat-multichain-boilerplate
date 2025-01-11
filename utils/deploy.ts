import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';
import 'hardhat-deploy';

/**
 * Utility function for deploying a smart contract.
 * @param hre - The Hardhat Runtime Environment instance.
 * @param contractName - The name of the contract to deploy.
 * @param args - (Optional) Arguments to pass to the contract constructor.
 * @returns The deployment result containing details about the deployed contract.
 */
const deployContract = async (
	hre: HardhatRuntimeEnvironment, // Provides access to the deployment framework and network configuration.
	contractName: string,          // The name of the contract to deploy (must match the contract source file name).
	args: any[] = []               // Arguments for the contract's constructor (default is an empty array).
) => {
	// Destructuring the `deploy` function and `getNamedAccounts` utility from the HRE's deployments module
	const {
		deployments: { deploy }, // `deploy` is a helper function for deploying contracts.
		getNamedAccounts          // Retrieves accounts mapped in the Hardhat configuration.
	} = hre;

	// Fetch the deployer account from the named accounts configuration
	const { deployer } = await getNamedAccounts();

	// Deployment configuration object
	const config = {
		log: true,       // Logs deployment details to the console.
		from: deployer,  // Specifies the account deploying the contract.
		args             // Constructor arguments for the contract.
	};

	// Deploy the contract using the `deploy` utility and return the deployment result
	return await deploy(contractName, config);
};

// Export the `deployContract` function for use in other scripts
export { deployContract };
