import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    forkName?: string; // Add this to support the custom fork task
  }
}
