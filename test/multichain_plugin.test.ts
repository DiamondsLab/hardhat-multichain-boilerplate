// import { ethers } from "hardhat";
import { assert } from "chai";
// import hre from "hardhat";
// import hre from "hardhat/types";

describe("Hardhat Multi-Fork Tests", function () {
  it("Should switch between networks", async function () {
    const hre = require("hardhat");

    // Get current network
    console.log(`Current Network: ${hre.network.name}`);

    // Switch to Sepolia fork
    hre.changeNetwork("sepolia");
    const sepoliaProvider = hre.getProvider("sepolia");
    console.log(`Sepolia Provider: ${sepoliaProvider.toString()}`);

    assert(sepoliaProvider, "Sepolia provider not found");
    
    console.log(`Switched to: ${hre.network.name}`);

    // Check Sepolia block number
    const blockNumber = await sepoliaProvider.getBlockNumber();
    console.log(`Sepolia Block Number: ${blockNumber}`);

    // // Switch to Amoy fork
    // hre.changeNetwork("amoy");
    // const amoyProvider = hre.getProvider("amoy");
    // assert(amoyProvider, "Amoy provider not found");

    // console.log(`Switched to: ${hre.network.name}`);

    // // Check Amoy block number
    // const amoyBlockNumber = await amoyProvider.getBlockNumber();
    // console.log(`Amoy Block Number: ${amoyBlockNumber}`);
  });
});
