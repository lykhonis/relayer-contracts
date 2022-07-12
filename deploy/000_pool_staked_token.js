const { ethers } = require('hardhat')

const deploy = async ({
  deployments,
  getNamedAccounts,
}) => {
  const { deploy } = deployments
  const { owner } = await getNamedAccounts()
  const { maxFeePerGas, maxPriorityFeePerGas } = await ethers.provider.getFeeData()

  const { address } = await deploy('StakedToken', {
    from: owner,
    args: [
      owner,
      'Staked Lukso',
      'sLYX',
    ],
    maxFeePerGas,
    maxPriorityFeePerGas,
    log: true,
  })

  console.log(`StakedToken: ${address}`)
}

module.exports = deploy
