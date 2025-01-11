import "hardhat/types/runtime";

/**
 * Extends the Hardhat Runtime Environment (HRE) interface to include a `forkName` property.
 * This property is used to identify the name of the forked network during runtime.
 */
declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    forkName: string; // A custom property to store the name of the currently forked network.
  }
}
