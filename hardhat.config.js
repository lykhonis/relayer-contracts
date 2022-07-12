require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-gas-reporter')
require('hardhat-deploy')

const yargs = require('yargs')

const argv = yargs
  .option('network', {
    type: 'string',
    default: 'hardhat',
  })
  .help(false)
  .version(false)
  .argv

if (!['hardhat', 'l14', 'l16'].includes(argv.network)) {
  throw new Error(`Unable to connect to network ${argv.network}`)
}

const dotenv = require('dotenv')
dotenv.config()

const sharedNetworkConfig = {}

const { OWNER_KEY, ORACLES_KEY } = process.env

if (OWNER_KEY && ORACLES_KEY) {
  sharedNetworkConfig.accounts = [OWNER_KEY, ORACLES_KEY]
} else {
  throw new Error('No key is found. Keys are required to deploy contracts')
}

const config = {
  solidity: '0.8.9',
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  paths: {
    sources: './contracts',
    tests: './tests',
    cache: './build/cache',
    artifacts: './build/artifacts',
    deploy: './deploy',
  },
  mocha: {
    timeout: 10_000,
  },
  namedAccounts: {
    owner: 0,
    oracles: 1,
  },
  gasReporter: {
    src: './contracts',
    enabled: process.env.REPORT_GAS ? true : false,
    currency: 'USD',
    gasPrice: 100,
    showMethodSig: true,
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
    },
    l14: {
      ...sharedNetworkConfig,
      live: true,
      url: 'https://rpc.l14.lukso.network',
      chainId: 22,
    },
    l16: {
      ...sharedNetworkConfig,
      live: true,
      url: 'https://rpc.l16.lukso.network',
      chainId: 2828,
    },
  },
  etherscan: {
    apiKey: 'no-api-key-needed',
    customChains: [
      {
        network: 'l14',
        chainId: 22,
        urls: {
          apiURL: 'https://blockscout.com/lukso/l14/api',
          browserURL: 'https://blockscout.com/lukso/l14',
        },
      },
      {
        network: 'l16',
        chainId: 2828,
        urls: {
          apiURL: 'https://explorer.execution.l16.lukso.network/api',
          browserURL: 'https://explorer.execution.l16.lukso.network/',
        },
      },
    ],
  },
}

module.exports = config
