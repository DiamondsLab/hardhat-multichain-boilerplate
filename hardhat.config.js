"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polyUrl = exports.ethUrl = void 0;
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@typechain/hardhat");
var dotenv = __importStar(require("dotenv"));
var config_1 = require("hardhat/config");
dotenv.config();
/*
 * Destructuring environment variables required for the configuration.
 * These variables are fetched from the `.env` file to avoid hardcoding sensitive data.
 * - HH_CHAIN_ID: Custom chain ID for the Hardhat network (default is 31337 if not set).
 * - DEPLOYER_PRIVATE_KEY: Private key of the deployment account.
 * - SEPOLIA_PROVIDER_URL: RPC URL for the Sepolia Testnet.
 * - ETHEREUM_PROVIDER_URL: RPC URL for Ethereum Mainnet.
 * - POLYGON_PROVIDER_URL: RPC URL for Polygon Mainnet.
 * - AMOY_PROVIDER_URL: RPC URL for Amoy Testnet.
 */
var _a = process.env, HH_CHAIN_ID = _a.HH_CHAIN_ID, DEPLOYER_PRIVATE_KEY = _a.DEPLOYER_PRIVATE_KEY, SEPOLIA_PROVIDER_URL = _a.SEPOLIA_PROVIDER_URL, ETHEREUM_PROVIDER_URL = _a.ETHEREUM_PROVIDER_URL, POLYGON_PROVIDER_URL = _a.POLYGON_PROVIDER_URL, AMOY_PROVIDER_URL = _a.AMOY_PROVIDER_URL;
// Exported constants for reusability in other parts of the project (e.g., testing scripts)
exports.ethUrl = ETHEREUM_PROVIDER_URL || ""; // Ethereum RPC URL
exports.polyUrl = POLYGON_PROVIDER_URL || ""; // Polygon RPC URL
// Set the default chain ID for the Hardhat network
// Uses `HH_CHAIN_ID` from the environment or defaults to `31337` (Hardhat's default local chain ID)
var MOCK_CHAIN_ID = HH_CHAIN_ID ? parseInt(HH_CHAIN_ID) : 31337;
// Main Hardhat configuration object
var config = {
    // Specifies the Solidity version used for compiling contracts
    solidity: '0.8.3',
    // Configuration for different networks
    networks: {
        // Hardhat's built-in local blockchain network
        hardhat: {
            chainId: MOCK_CHAIN_ID, // Sets the chain ID for the Hardhat network
        },
        // Sepolia Testnet configuration
        sepolia: {
            url: SEPOLIA_PROVIDER_URL,
            chainId: 4,
            accounts: ["0x".concat(DEPLOYER_PRIVATE_KEY)], // Deployer account private key
        },
        // Amoy Testnet configuration
        amoy: {
            url: AMOY_PROVIDER_URL,
            chainId: 80001,
            accounts: ["0x".concat(DEPLOYER_PRIVATE_KEY)], // Deployer account private key
        },
    },
    // Named accounts allow easier referencing of frequently used accounts
    namedAccounts: {
        deployer: 0, // Maps the deployer account to the first account in the wallet
    },
    typechain: {
        outDir: "typechain-types",
        target: "ethers-v5", // Use ethers.js as the target framework
    },
};
// Custom Hardhat task definition
// Task Name: `customFork`
// Description: Sets up a forked network for local testing with specific configurations
(0, config_1.task)('customFork', // Task name
"Sets the name of the fork, so it's visible in deployment scripts" // Task description
)
    .addParam('n', 'name of forked network') // Adds a parameter `n` for specifying the network name
    .setAction(function (taskArgs, hre) { return __awaiter(void 0, void 0, void 0, function () {
    var url, port;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Accesses the Hardhat runtime environment (`hre`) to modify runtime configurations
                hre.forkName = taskArgs.n; // Sets the fork name based on the parameter
                // Determines the RPC URL and port based on the specified fork name
                if (hre.forkName === 'ethereum') {
                    url = exports.ethUrl; // Use Ethereum RPC URL
                    port = 8545; // Default port for Ethereum fork
                }
                else if (hre.forkName === 'polygon') {
                    url = exports.polyUrl; // Use Polygon RPC URL
                    port = 8546; // Default port for Polygon fork
                }
                else {
                    throw 'Incorrect fork name!'; // Throws an error if the fork name is invalid
                }
                // Runs the Hardhat node with the specified forked network and port
                return [4 /*yield*/, hre.run('node', {
                        fork: url,
                        port: port, // Specifies the port for the forked node
                    })];
            case 1:
                // Runs the Hardhat node with the specified forked network and port
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Exports the configuration object to be used by Hardhat
exports.default = config;
