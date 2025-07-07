# Hardhat Multichain Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A comprehensive **Hardhat-based multichain development environment** that enables developers to build, test, and deploy smart contracts across multiple blockchain networks simultaneously. This boilerplate demonstrates best practices for multichain development using the `hardhat-multichain` plugin.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- Yarn or npm
- Git

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/hardhat-multichain-boilerplate.git
   cd hardhat-multichain-boilerplate
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Build the plugin**:

   ```bash
   cd packages/hardhat-multichain
   yarn build
   cd ../..
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your RPC URLs and API keys
   ```

5. **Run tests**:

   ```bash
   yarn test
   ```

## 🌐 Supported Networks

### Mainnets

- **Ethereum** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Base** (Chain ID: 8453)

### Testnets  

- **Sepolia** (Chain ID: 11155111)
- **Polygon Amoy** (Chain ID: 80002)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Base Sepolia** (Chain ID: 84532)

### Local Networks

- **Hardhat** (Chain ID: 31337)
- **Localhost** (Chain ID: 31337)

## 🛠 Features

### ✅ Production-Ready Plugin Integration

- **Workspace Dependencies**: Proper plugin linking without circular dependencies
- **Type Safety**: Full TypeScript support with type extensions
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Configuration Validation**: Schema-based configuration validation

### ✅ Advanced Fork Management  

- **Custom Fork Tasks**: Start multiple network forks with custom configurations
- **Port Management**: Automatic port allocation to prevent conflicts
- **Process Cleanup**: Graceful cleanup of background processes
- **Network Validation**: Pre-fork RPC connection testing

### ✅ Robust Testing Infrastructure

- **Timeout Management**: Configurable timeouts for all network operations
- **Snapshot Support**: EVM snapshots for test isolation
- **Async/Await Patterns**: Proper async handling throughout
- **Comprehensive Coverage**: Tests for success and failure scenarios

### ✅ Configuration Management

- **Environment Variables**: Secure configuration via environment variables
- **Schema Validation**: JSON schema validation for configuration files
- **Multiple Examples**: Pre-configured examples for different use cases
- **Migration Tools**: Helpers for upgrading configurations

### ✅ Developer Experience

- **Rich Documentation**: Comprehensive guides and troubleshooting
- **Error Messages**: Actionable error messages with solutions
- **Progress Indicators**: Clear feedback for long-running operations
- **Debug Logging**: Detailed logging for debugging issues

## 📖 Documentation

- **[Configuration Guide](./config/README.md)** - Complete configuration reference
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
- **[API Documentation](./docs/api.md)** - Plugin API reference
- **[Examples](./examples/)** - Real-world usage examples

## 🚀 Usage Examples

### Starting Network Forks

```bash
# Start Ethereum mainnet fork
yarn fork:ethereum

# Start Polygon mainnet fork  
yarn fork:polygon

# Start multiple forks simultaneously
yarn fork:both

# Custom fork with specific block
npx hardhat customFork --n ethereum --b 18000000
```

### Running Tests

```bash
# Run all tests
yarn test

# Run multichain tests
yarn test-multichain

# Run tests with debug output
DEBUG=hardhat* yarn test
```

### Contract Deployment

```bash
# Deploy to local hardhat network
yarn deploy

# Deploy with specific network
npx hardhat deploy --network hardhat
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Network RPC URLs
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Block numbers to fork from (0 = latest)
ETH_BLOCK=18000000
POLY_BLOCK=50000000
SEPOLIA_BLOCK=4000000

# Deployer private key (for testing only!)
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Hardhat Configuration (hardhat.config.ts)

```typescript
export default {
  chainManager: {
    chains: {
      ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC,
        blockNumber: parseInt(process.env.ETH_BLOCK || "0"),
        chainId: 1
      },
      polygon: {
        rpcUrl: process.env.POLYGON_RPC,
        blockNumber: parseInt(process.env.POLY_BLOCK || "0"),
        chainId: 137
      }
    }
  }
};
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `yarn test` | Run all tests |
| `yarn test-multichain` | Run multichain-specific tests |
| `yarn fork:ethereum` | Start Ethereum mainnet fork |
| `yarn fork:polygon` | Start Polygon mainnet fork |
| `yarn fork:both` | Start both forks simultaneously |
| `yarn deploy` | Deploy contracts |
| `yarn compile` | Compile smart contracts |
| `yarn clean` | Clean build artifacts |

## 🏗 Project Structure

```bash
hardhat-multichain-boilerplate/
├── contracts/              # Smart contracts
│   └── MultiChain.sol     # Example multichain contract
├── test/                   # Test files
│   └── multichain_plugin.test.ts
├── utils/                  # Utility functions
│   ├── error-handling.ts  # Error handling and retry logic
│   ├── config-validator.ts # Configuration validation
│   └── deploy.ts          # Deployment utilities
├── config/                 # Configuration examples
│   ├── example-mainnet.json
│   ├── example-testnet.json
│   └── README.md
├── docs/                   # Documentation
│   └── troubleshooting.md
├── packages/               # Plugin source code
│   └── hardhat-multichain/
├── hardhat.config.ts       # Hardhat configuration
├── package.json           # Dependencies and scripts
└── .env.example           # Environment variable template
```

## 🔍 Example: Testing Across Multiple Chains

```typescript
import { multichain } from "hardhat-multichain";
import { ethers } from "hardhat";

describe("Multichain Contract Tests", function () {
  const chains = multichain.getProviders();
  
  for (const [chainName, provider] of chains.entries()) {
    it(`should deploy on ${chainName}`, async function () {
      // Deploy contract on this specific chain
      const Contract = await ethers.getContractFactory("MultiChain");
      const contract = await Contract.deploy();
      await contract.deployed();
      
      // Verify deployment
      const result = await contract.getChain();
      expect(result.chainId).to.equal(await provider.getNetwork().chainId);
    });
  }
});
```

## 🚨 Common Issues & Solutions

### Plugin Not Loading

```bash
# Rebuild the plugin
cd packages/hardhat-multichain && yarn build && cd ../..
yarn install
```

### RPC Connection Errors

- Check your API keys and quotas
- Verify RPC URLs in `.env` file
- Try different block numbers or use `0` for latest

### Port Conflicts

```bash
# Kill existing processes
lsof -ti:8545 | xargs kill -9
```

See the [Troubleshooting Guide](./docs/troubleshooting.md) for more solutions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `yarn test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Ethers.js](https://docs.ethers.io/) - Ethereum library for JavaScript
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract security standards

## 📞 Support

- **Documentation**: Check our comprehensive guides in the `docs/` directory
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-org/hardhat-multichain-boilerplate/issues)
- **Discussions**: Join the community in [GitHub Discussions](https://github.com/your-org/hardhat-multichain-boilerplate/discussions)
