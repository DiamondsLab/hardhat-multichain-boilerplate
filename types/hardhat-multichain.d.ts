declare module 'hardhat-multichain' {
  import { JsonRpcProvider } from 'ethers';
  
  export interface ChainManager {
    getProvider(networkName: string): JsonRpcProvider | undefined;
    getProviders(): Map<string, JsonRpcProvider>;
  }
  
  export const multichain: ChainManager;
  
  export class ChainConfigError extends Error {}
  export class NetworkConnectionError extends Error {}
  export class ProcessCleanupError extends Error {}
  
  export function getProvider(networkName: string): JsonRpcProvider;
  export function getMultichainProviders(): Map<string, JsonRpcProvider>;
}
