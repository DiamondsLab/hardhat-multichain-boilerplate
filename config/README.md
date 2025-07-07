# Configuration Guide

This guide explains how to configure the Hardhat Multichain Boilerplate for your development needs.

## Configuration Files

The project supports multiple configuration approaches:

### 1. Environment Variables (.env)

The primary configuration method uses environment variables:

```bash
# Hardhat Configuration
HH_CHAIN_ID=31337

# Deployer Account (NEVER commit your real private key!)
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# RPC URLs (Replace with your own provider URLs)
ETHEREUM_RPC=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
POLYGON_RPC=https://polygon-mainnet.alchemyapi.io/v2/YOUR_API_KEY
SEPOLIA_RPC=https://eth-sepolia.alchemyapi.io/v2/YOUR_API_KEY
AMOY_RPC=https://polygon-amoy.alchemyapi.io/v2/YOUR_API_KEY

# Block Numbers (Set to specific blocks or 0 for latest)
ETH_BLOCK=18000000
POLY_BLOCK=50000000
SEPOLIA_BLOCK=4000000
AMOY_BLOCK=1000000
```

### 2. Hardhat Configuration (hardhat.config.ts)

The main configuration file defines the chainManager:

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
      },
      // ... more chains
    }
  }
};
```

### 3. Configuration Examples

The `config/` directory contains example configurations:

- `example-mainnet.json` - Production mainnet chains
- `example-testnet.json` - Testnet chains for development
- `example-local.json` - Local development setup

## Chain Configuration Options

Each chain in the configuration supports the following options:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `rpcUrl` | string | Yes* | HTTP/HTTPS RPC endpoint |
| `rpc` | string | Yes* | Alternative name for RPC URL |
| `blockNumber` | number | No | Block to fork from (0 = latest) |
| `chainId` | number | No | Network chain ID |
| `timeout` | number | No | Connection timeout (ms) |
| `retries` | number | No | Number of retry attempts |
| `gasPrice` | string | No | Default gas price in wei |
| `gasLimit` | number | No | Default gas limit |

*Either `rpcUrl` or `rpc` must be provided.

## Supported Networks

### Mainnets
- **Ethereum** (chainId: 1)
- **Polygon** (chainId: 137)
- **Arbitrum** (chainId: 42161)
- **Optimism** (chainId: 10)
- **Base** (chainId: 8453)
- **Avalanche** (chainId: 43114)

### Testnets
- **Sepolia** (chainId: 11155111)
- **Polygon Amoy** (chainId: 80002)
- **Arbitrum Sepolia** (chainId: 421614)
- **Base Sepolia** (chainId: 84532)
- **Optimism Sepolia** (chainId: 11155420)

### Local Networks
- **Hardhat** (chainId: 31337)
- **Localhost** (chainId: 31337)

## Configuration Validation

The project includes automatic configuration validation. Common validation errors:

### Missing RPC URL
```
Chain 'ethereum': Either 'rpcUrl' or 'rpc' must be provided
```
**Solution**: Set the appropriate environment variable or configuration option.

### Invalid Block Number
```
Chain 'polygon': Block number must be a non-negative integer
```
**Solution**: Ensure block numbers are positive integers or 0.

### Invalid Chain ID
```
Chain 'sepolia': Chain ID must be a positive integer
```
**Solution**: Use the correct chain ID for your network.

### Invalid URL Format
```
Chain 'ethereum': Invalid RPC URL format: invalid-url
```
**Solution**: Use a valid HTTP/HTTPS URL format.

## Provider Setup

### Alchemy (Recommended)
1. Sign up at [alchemy.com](https://alchemy.com)
2. Create a new project
3. Copy your API key
4. Set environment variables:
   ```bash
   ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```

### Infura
1. Sign up at [infura.io](https://infura.io)
2. Create a new project
3. Copy your project ID
4. Set environment variables:
   ```bash
   ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
   POLYGON_RPC=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
   ```

### Public RPC (Not Recommended for Production)
```bash
ETHEREUM_RPC=https://cloudflare-eth.com
POLYGON_RPC=https://polygon-rpc.com
```

## Configuration Migration

### From Version 1.x to 2.x

If you're upgrading from an older version:

1. **Environment Variables**: Update variable names:
   ```diff
   - ETHEREUM_PROVIDER_URL=...
   + ETHEREUM_RPC=...
   
   - POLYGON_PROVIDER_URL=...
   + POLYGON_RPC=...
   ```

2. **Configuration Structure**: Update hardhat.config.ts:
   ```diff
   - networks: {
   -   ethereum: { url: "..." }
   - }
   + chainManager: {
   +   chains: {
   +     ethereum: { rpcUrl: "..." }
   +   }
   + }
   ```

## Best Practices

### Security
- Never commit private keys to version control
- Use test accounts for development
- Rotate API keys regularly
- Use environment-specific configurations

### Performance
- Use dedicated RPC providers (Alchemy/Infura)
- Set appropriate timeouts for your network conditions
- Configure retry limits to handle temporary failures
- Pin block numbers for consistent testing

### Development Workflow
1. Start with testnet configurations
2. Test locally with forked networks
3. Deploy to testnets for integration testing
4. Finally deploy to mainnets

### Configuration Management
- Use different .env files for different environments
- Document your configuration choices
- Validate configurations before deployment
- Monitor RPC usage and quotas

## Troubleshooting

### Common Issues

**RPC Connection Failures**
- Check your internet connection
- Verify API key and quotas
- Try different RPC endpoints

**Block Number Too High**
- Use `blockNumber: 0` for latest block
- Check the current block number on block explorers

**Chain ID Mismatch**
- Verify chain IDs match your intended networks
- Check provider documentation for correct chain IDs

**Timeout Errors**
- Increase timeout values
- Check network connectivity
- Try different RPC providers

### Getting Help

1. Check the [troubleshooting guide](../docs/troubleshooting.md)
2. Review configuration examples in `config/`
3. Check the console for validation errors
4. Verify environment variables are set correctly

## Advanced Configuration

### Custom Networks

To add a custom network:

```typescript
chainManager: {
  chains: {
    myCustomNetwork: {
      rpcUrl: "https://custom-rpc.example.com",
      chainId: 12345,
      blockNumber: 1000000,
      timeout: 60000,
      retries: 5
    }
  }
}
```

### Dynamic Configuration

Load configuration from external sources:

```typescript
import { configValidator } from './utils/config-validator';

const config = configValidator.loadAndValidateConfig('./my-config.json');
if (!config.isValid) {
  console.error('Configuration errors:', config.errors);
  process.exit(1);
}
```

### Testing Configuration

Validate your configuration:

```bash
npx hardhat test test/config-validation.test.ts
```
