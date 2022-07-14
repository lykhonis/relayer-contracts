const { ethers } = require('hardhat')

const deploy = async ({
  deployments,
  getNamedAccounts,
}) => {
  const { deploy } = deployments
  const { owner } = await getNamedAccounts()
  const { maxFeePerGas, maxPriorityFeePerGas } = await ethers.provider.getFeeData()

  const RewardToken = await deployments.get('RewardToken')

  const { address } = await deploy('RelayContractor', {
    from: owner,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          owner,
          process.env.ORACLES_ADDRESS,
          RewardToken.address,
          10_000 /* 10% */,
        ],
      },
    },
    maxFeePerGas,
    maxPriorityFeePerGas,
    log: true,
  })

  console.log(`RelayContractor: ${address}`)
}

module.exports = deploy
