import "hardhat/types/config";
import "hardhat/types/runtime";

// Define the types directly since import might not work in declaration files
interface ChainConfig {
  rpcUrl: string;
  blockNumber?: number;
  chainId?: number;
  rpc?: string; // Alternative name used in hardhat config
}

interface MultiChainConfig {
  chains: Record<string, ChainConfig>;
}

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    chainManager?: MultiChainConfig;
  }

  export interface HardhatConfig {
    chainManager: MultiChainConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    forkName?: string; // Add this to support the custom fork task
  }
}
