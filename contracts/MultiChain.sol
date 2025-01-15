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
        // The `block.chainid` used here is being added to the fork command
        // that provides the current blockchain's unique chain ID for testing.
        
        if (chainId == 69) {
            // lcoal version of Ethereum Mainnet: Chain ID 69
            return (chainId, "ethereum");
        }
        else if (chainId ==42) {
            // Local version of Polygon Mainnet: Chain ID 42
            return (chainId, "local-polygon");
        }
        else if (chainId == 11169111) {
            // local Sepolia Chain: Chain ID 690
            return (chainId, "local-sepolia");
        }
        else if (chainId == 80042) {
            // local Amoy Chain: Chain ID 691
            return (chainId, "local-amoy");
        }
        else {
            // Default case for unknown chain IDs
            return (chainId, "IDK what this is");
        }
    }
}
