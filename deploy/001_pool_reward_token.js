const { ethers } = require('hardhat')

const deploy = async ({
  deployments,
  getNamedAccounts,
}) => {
  const { deploy } = deployments
  const { owner } = await getNamedAccounts()
  const { maxFeePerGas, maxPriorityFeePerGas } = await ethers.provider.getFeeData()

  const { address } = await deploy('RewardToken', {
    from: owner,
    args: [
      owner,
      process.env.ORACLES_ADDRESS,
      8_050,
      'Reward Lukso',
      'rLYX',
    ],
    maxFeePerGas,
    maxPriorityFeePerGas,
    log: true,
  })

  console.log(`RewardToken: ${address}`)
}

module.exports = deploy
