# Hardhat Multichain Boilerplate and Examples

This project demonstrates a **Hardhat-based multichain development environment** where multiple Ethereum Virtual Machine (EVM) compatible chains can be run locally for contract development and testing. This differs from the typical single-chain setups by enabling developers to simulate multiple blockchain networks concurrently, which is crucial for testing multichain interoperability.

The end result of our development is the [Hardhat-Multichain](https://github.com/GeniusVentures/hardhat-multichain) node module.  This repo contains the boilerplate code and examples to get you started with multichain development using Hardhat-Multichain plugin.  It also contains other methods to fork multiple networks and deploy contracts on them although these fall short of the ease of use and functionality of the Hardhat-Multichain plugin.

This repo is set up with the following:

1) Ethereum Mainnet (forked to run locally)
2) Polygon Mainnet (forked to run locally)
3) Sepolia Testnet (forked to run locally)
4) Amoy Testnet (forked to run locally)

See the [Hardhat-Multichain](https://github.com/GenisuVentures/hardhat-multichain) repo for more information on the plugin.

## Overview of methods for multichain development

There is a standalone method for multichain development that does not use the Hardhat-Multichain plugin.  This method is more manual and requires more setup and configuration.  It is included in this repo for reference and comparison to the Hardhat-Multichain plugin. This can be found in the test/multichain_standalone.test.ts file. This was the original method used to test multichain development.

A more advanced method is demonstrated in the test/integration/multichain/directory.  This is was the second method used to test multichain development.  It is more advanced than the standalone method and is more similar to the Hardhat-Multichain plugin.  It is included in this repo for reference and comparison to the Hardhat-Multichain plugin.

The Hardhat-Multichain plugin is located in the packages/hardhat-multichain directory.  This is the most advanced method for multichain development and is the recommended method for multichain development.

## Installation of Hardhat-Multichain plugin

We run a special setup of the Hardhat-Multichain plugin in this environment.  To install the Hardhat-Multichain plugin in this environment we run `yarn link` in the `./packages/hardhat-multichain` directory and `yarn link` in the main directory.  This allows for the submodule to be linked to the main directory and used as a node module but remain a separate repository.  This is the recommended method for using the Hardhat-Multichain plugin in this environment only.  This is a development environment and not a production environment. Currently we also build the plugin in the packages directory since it does not include the `dist/` directory in the repository.  When working on the plugin itself, you can run `yarn build` in the `./packages/hardhat-multichain` directory to build the plugin.

## Configuration of Hardhat-Multichain plugin

see the [Hardhat-Multichain plugin](https://github.com/GeniusVentures/hardhat-multichain) repo for more information on the plugin.

## Tests of secondary methods

There currently is a test contract that retrieves its chainId (to prepare for deploying the same contract on multiple networks). It has a set of small unit tests to ensure you can deploy it to mulitple EVMs.

In addition, there are configurations to be able to run and test on two networks concurrently.

## Setup

1) Run `yarn` to install dependencies
2) Create `.env` based on `.env.example`. Leave the `HH_CHAIN_ID` as is, and add a private key to deploy as well as provider URLs, which are retrievable on Infura or Alchemy.

## Scripts

- `yarn fork:ethereum` - runs fork of Ethereum mainnet
- `yarn fork:polygon` - runs fork of Polygon mainnet
- `yarn fork:both` - runs both local forks
- `yarn deploy` - deploys the `Multichain` contract
- `yarn clean` - removes old build
- `yarn compile` - compiles contracts
- `yarn test` - runs tests in `./test`

## 1. **Purpose and Configuration for multichain Testing**

- The goal is to simulate multiple chains locally to develop and test **multichain smart contracts** interaction. This includes deploying contracts on different networks, verifying their behavior and monitoring them for events which triggers other events.:
  - **Ethereum Mainnet**
  - **Polygon Mainnet**
  - **Sepolia Testnet**
  - **Amoy Testnet**

- The configuration in `hardhat.config.ts` defines these networks and includes details such as:
  - `chainId`
  - RPC URLs for live or forked networks (using tools like Alchemy or Infura).
  - Deployment accounts via private keys.

- The project supports **forking** the state of mainnets or testnets locally, allowing the developer to interact with contracts deployed on real networks while using local nodes.

---

## 2. **Scripts for Forking Networks**

- Defined in `package.json`, the scripts enable running local forks:
  - **`yarn fork:ethereum`**: Fork Ethereum Mainnet.
  - **`yarn fork:polygon`**: Fork Polygon Mainnet.
  - **`yarn fork:both`**: Run both Ethereum and Polygon forks concurrently.

- Forking is managed via the `customFork` Hardhat task in `hardhat.config.ts`, which sets up the runtime environment (`HardhatRuntimeEnvironment`) for the specified network:
  - URLs are dynamically assigned based on the fork name (`ethereum` or `polygon`).
  - A port is specified for each fork to avoid conflicts.

---

## 3. **Smart Contract: `Multichain`**

- Located in `contracts/Multichain.sol`.
- Provides the `getChain` function, which:
  - Returns the chain ID using `block.chainid`.
  - Maps the chain ID to a human-readable chain name (e.g., Ethereum, Polygon, etc.).
- This is used to verify the deployment and runtime behavior across multiple chains.

---

## 4. **Deployment: `deploy/multichain_deploy.ts`**

- Deploys the `Multichain` contract on the configured chain(s).
- Uses the utility function `deployContract` (`utils/deploy.ts`), which abstracts Hardhat's deployment process:
  - Fetches the deployment account (`deployer`) from the named accounts in `hardhat.config.ts`.
  - Logs the deployment process for better debugging and auditing.

---

## 5. **Testing Across Multiple Chains**

- Tests are in `test/multichain_test.ts` and utilize:
  - `MockProvider` from `ethereum-waffle` to simulate blockchain providers.
  - Forked URLs (`ethUrl`, `polyUrl`) from `hardhat.config.ts` for specific chain simulations.
  - Contract ABI and bytecode from the compiled artifacts.

- Example Tests:
  - Deploys the `Multichain` contract to each simulated chain.
  - Calls the `getChain` function to verify the returned `chainId` and name:
    - **Ethereum Mainnet**: Chain ID `1`.
    - **Polygon Mainnet**: Chain ID `137`.
    - **Sepolia Testnet**: Chain ID `4`.
    - **Amoy Testnet**: Chain ID `80001`.
  - Validates that the contract responds correctly depending on the simulated chain.

---

## 6. **Environment Setup**

- `.env` file (template in `.env.example`):
  - Holds sensitive credentials like private keys and RPC URLs for each chain.
  - Example:

       ```TEXT
       HH_CHAIN_ID=31337
       DEPLOYER_PRIVATE_KEY=your_private_key
       SEPOLIA_PROVIDER_URL=https://sepolia.infura.io/v3/your_project_id
       ```

---

## 7. **Key Differentiators from Single-Chain Setups**

- **Multi-Network Support**:
  - Allows simultaneous interaction with multiple chains using `yarn fork:both`.
- **Forked Network State**:
  - Replicates mainnet/testnet state locally, useful for testing interactions with live contracts or state-dependent logic.
- **multichain Testing**:
  - Enables testing of contract interoperability between chains without deploying on live networks.
  - Reduces development costs and risks associated with live deployments.

---

## 8. **Utility Enhancements**

- **`utils/forkName.ts`**:
  - Extends the `HardhatRuntimeEnvironment` with a `forkName` property for clarity during deployments.
- **Logging**:
  - Deployment logs are saved for debugging (`logs/ethereum-fork-node.log`).

---
