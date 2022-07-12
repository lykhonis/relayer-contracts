const { ethers } = require('hardhat')

const deploy = async ({
  deployments,
  getNamedAccounts,
}) => {
  const { deploy } = deployments
  const { owner } = await getNamedAccounts()
  const { maxFeePerGas, maxPriorityFeePerGas } = await ethers.provider.getFeeData()

  const { address } = await deploy('UniversalPageName', {
    from: owner,
    args: [
      owner,
      process.env.BENEFICIARY_ADDRESS,
      'Universal Page Name',
      'UPN',
    ],
    maxFeePerGas,
    maxPriorityFeePerGas,
    log: true,
  })

  console.log(`UniversalPageName: ${address}`)
}

module.exports = deploy
