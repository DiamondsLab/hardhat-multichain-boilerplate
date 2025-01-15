// SPDX-License-Identifier: Unlicense
// This license indicates that the source code is open and available for unrestricted use.

pragma solidity ^0.8.0;
// The Solidity version is specified as 0.8.0 or higher.
// This version introduces improved safety features, including checked arithmetic.

/// @title Multichain Contract
/// @notice A simple contract to demonstrate the retrieval of chain-specific data.
/// @dev Uses the `block.chainid` global variable to fetch the chain ID.
contract Multichain {
    
    /// @notice Returns the chain ID and its corresponding name.
    /// @dev The `block.chainid` global variable retrieves the current chain ID of the network.
    /// @return chainId The numeric chain ID of the blockchain.
    /// @return chainName A human-readable string representing the blockchain name.
    function getChain() public view returns (uint, string memory) {
        uint chainId = block.chainid; 
        // The `block.chainid` is a global variable introduced in Solidity 0.5.0 
        // that provides the current blockchain's unique chain ID.
        
        if (chainId == 4) {
            // Sepolia Testnet: Chain ID 4
            return (chainId, "sepolia");
        }
        else if (chainId == 80001) {
            // Amoy Testnet: Chain ID 80001
            return (chainId, "amoy");
        }
        else if (chainId == 1) {
            // Ethereum Mainnet: Chain ID 1
            return (chainId, "ethereum");
        }
        else if (chainId == 137) {
            // Polygon Mainnet: Chain ID 137
            return (chainId, "polygon");
        }
        else {
            // Default case for unknown chain IDs
            return (chainId, "IDK what this is");
        }
    }
}
