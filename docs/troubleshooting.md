# Troubleshooting Guide

This guide helps you solve common issues when using the Hardhat Multichain Boilerplate.

## Installation Issues

### Yarn/NPM Installation Fails

**Error**: `Cannot find module 'hardhat-multichain'`

**Solutions**:
1. Ensure you're in the correct directory:
   ```bash
   cd hardhat-multichain-boilerplate
   ```
2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
3. Build the plugin:
   ```bash
   cd packages/hardhat-multichain
   yarn build
   cd ../..
   ```

### Plugin Not Loading

**Error**: `HardhatError: The plugin hardhat-multichain is not installed`

**Solutions**:
1. Check package.json includes the plugin:
   ```json
   "dependencies": {
     "hardhat-multichain": "file:./packages/hardhat-multichain"
   }
   ```
2. Ensure the plugin is imported in hardhat.config.ts:
   ```typescript
   import 'hardhat-multichain';
   ```
3. Rebuild the plugin:
   ```bash
   cd packages/hardhat-multichain && yarn build
   ```

## Configuration Issues

### Environment Variables Not Found

**Error**: `RPC URL for ethereum is not configured`

**Solutions**:
1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Add your RPC URLs:
   ```bash
   ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```
3. Verify the .env file is in the root directory
4. Restart your terminal session

### Invalid Configuration

**Error**: `Chain 'ethereum': Invalid RPC URL format`

**Solutions**:
1. Ensure URLs start with `http://` or `https://`
2. Replace `YOUR_API_KEY` with actual API keys
3. Test the URL in a browser or curl:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     YOUR_RPC_URL
   ```

### Chain ID Mismatch

**Error**: `Chain ID mismatch: expected 1, got 137`

**Solutions**:
1. Check your RPC URL points to the correct network
2. Verify chain IDs in hardhat.config.ts:
   ```typescript
   ethereum: { chainId: 1 },    // Ethereum Mainnet
   polygon: { chainId: 137 },   // Polygon Mainnet
   sepolia: { chainId: 11155111 } // Sepolia Testnet
   ```

## Network Connection Issues

### RPC Connection Timeout

**Error**: `Failed to connect to ethereum RPC`

**Solutions**:
1. Check your internet connection
2. Verify your API key is valid and has quota
3. Try a different RPC provider
4. Increase timeout in configuration:
   ```typescript
   ethereum: {
     rpcUrl: "...",
     timeout: 60000 // 60 seconds
   }
   ```

### Rate Limiting

**Error**: `Too Many Requests` or `429` status code

**Solutions**:
1. Upgrade your RPC provider plan
2. Add retry logic (already included in error-handling.ts)
3. Reduce concurrent requests
4. Use multiple API keys with load balancing

### Network Fork Issues

**Error**: `Failed to fork network at block 18000000`

**Solutions**:
1. Use a more recent block number:
   ```bash
   npx hardhat customFork --n ethereum --b 0  # Latest block
   ```
2. Check if the block exists on the network
3. Verify your RPC provider supports archive data
4. Try a different block number:
   ```bash
   npx hardhat customFork --n ethereum --b 17000000
   ```

## Testing Issues

### Tests Timeout

**Error**: `Error: Timeout of 2000ms exceeded`

**Solutions**:
1. Increase test timeout in the test file:
   ```typescript
   describe("Tests", function () {
     this.timeout(60000); // 60 seconds
   ```
2. Use proper async/await patterns
3. Add timeouts to individual operations:
   ```typescript
   await withTimeout(provider.getBlockNumber(), 30000);
   ```

### Provider Connection Errors

**Error**: `Provider not responding`

**Solutions**:
1. Check if the network fork is running:
   ```bash
   # In another terminal
   yarn fork:ethereum
   ```
2. Verify the port is correct:
   ```bash
   netstat -tulpn | grep :8545
   ```
3. Wait for the fork to fully initialize
4. Use retry logic in tests

### Memory Issues

**Error**: `JavaScript heap out of memory`

**Solutions**:
1. Increase Node.js memory limit:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```
2. Clean up test snapshots:
   ```typescript
   afterEach(async () => {
     if (snapshotId) {
       await provider.send('evm_revert', [snapshotId]);
     }
   });
   ```
3. Restart the fork periodically

## Plugin-Specific Issues

### ChainManager Not Available

**Error**: `multichain.getProviders() returns empty Map`

**Solutions**:
1. Ensure the plugin is properly initialized
2. Check that chains are configured in hardhat.config.ts
3. Verify environment variables are set
4. Run tests with the correct task:
   ```bash
   npx hardhat test-multichain --chains ethereum,polygon
   ```

### Type Definition Errors

**Error**: `Property 'chainManager' does not exist`

**Solutions**:
1. Check TypeScript configuration
2. Ensure type extensions are loaded
3. Try using `any` type temporarily:
   ```typescript
   const config: any = { chainManager: { ... } };
   ```
4. Rebuild the plugin and restart TypeScript

## Task Execution Issues

### CustomFork Task Not Found

**Error**: `HardhatError: Task customFork is not defined`

**Solutions**:
1. Ensure hardhat.config.ts is properly formatted
2. Check that the task is uncommented
3. Verify the configuration compiles:
   ```bash
   npx hardhat compile
   ```
4. Try running a different task first:
   ```bash
   npx hardhat help
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::8545`

**Solutions**:
1. Kill existing processes:
   ```bash
   lsof -ti:8545 | xargs kill -9
   ```
2. Use different ports:
   ```bash
   npx hardhat customFork --n ethereum --b 18000000 --port 8546
   ```
3. Check for zombie processes:
   ```bash
   ps aux | grep hardhat
   ```

## Performance Issues

### Slow Network Operations

**Symptoms**: Long delays during testing or deployment

**Solutions**:
1. Use faster RPC providers (Alchemy, Infura)
2. Pin to specific block numbers
3. Reduce test complexity
4. Use local caching where possible
5. Optimize contract compilation:
   ```typescript
   solidity: {
     compilers: [{
       version: "0.8.19",
       settings: {
         optimizer: {
           enabled: true,
           runs: 200
         }
       }
     }]
   }
   ```

### High Memory Usage

**Symptoms**: System becomes slow, out of memory errors

**Solutions**:
1. Increase system memory
2. Use smaller block ranges for testing
3. Clean up between tests
4. Optimize contract size
5. Use streaming for large operations

## Common Patterns and Solutions

### Reliable Network Testing

```typescript
// Always use timeouts and retries
const result = await retryWithBackoff(async () => {
  return withTimeout(
    provider.getBlockNumber(),
    30000,
    'Block number fetch timeout'
  );
}, { maxRetries: 3, delayMs: 2000 });
```

### Graceful Error Handling

```typescript
try {
  await networkOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    logger.warn(`Network error, retrying: ${error.message}`);
    // Retry logic
  } else {
    logger.error('Unexpected error:', error);
    throw error;
  }
}
```

### Process Cleanup

```typescript
// Register cleanup handlers
ProcessCleanup.register(async () => {
  await stopForks();
  await cleanupTempFiles();
});

ProcessCleanup.setupSignalHandlers();
```

## Getting Help

### Diagnostic Commands

Run these commands to gather diagnostic information:

```bash
# Check versions
node --version
yarn --version
npx hardhat --version

# Check configuration
npx hardhat compile
npx hardhat test --grep "Configuration"

# Check network connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $ETHEREUM_RPC

# Check ports
netstat -tulpn | grep :854
```

### Log Analysis

Enable debug logging:

```bash
DEBUG=hardhat* npx hardhat test
DEBUG=hardhat-multichain* yarn fork:ethereum
```

Look for these common log patterns:
- Connection timeouts
- Authentication failures
- Rate limiting messages
- Memory warnings

### Community Resources

1. **GitHub Issues**: Check existing issues for similar problems
2. **Documentation**: Read the README and configuration guide
3. **Examples**: Study the working examples in the repo
4. **Plugin Repository**: Check the hardhat-multichain plugin repo

### Reporting Issues

When reporting issues, include:

1. **Environment**: OS, Node.js version, yarn/npm version
2. **Configuration**: Sanitized hardhat.config.ts and .env
3. **Error Messages**: Complete stack traces
4. **Steps to Reproduce**: Minimal reproduction case
5. **Expected vs Actual**: What you expected vs what happened

### Quick Fixes Checklist

Before seeking help, try these quick fixes:

- [ ] Restart your terminal
- [ ] Clear node_modules and reinstall
- [ ] Update your API keys
- [ ] Check your internet connection
- [ ] Verify environment variables are set
- [ ] Try with a different RPC provider
- [ ] Use latest block numbers (set to 0)
- [ ] Kill any existing hardhat processes
