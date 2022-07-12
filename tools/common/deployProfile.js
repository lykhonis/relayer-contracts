const { ethers } = require('hardhat')
const { LSPFactory } = require('@lukso/lsp-factory.js')

const LSP6KeyManager = require('@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json')
const UniversalProfile = require('@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json')

exports.deployProfile = async (deployer, operator, options, doNotFund) => {
  const lspFactory = new LSPFactory(ethers.provider, deployer)

  const { LSP0ERC725Account: ERC725Account, LSP6KeyManager: KeyManager } = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: [operator.address],
    lsp3Profile: {
      json: options?.profile?.data ?? {},
      url: options
        ? `${options.host}${options.profile?.path}`
        : 'http://localhost',
    },
  })

  if (!doNotFund) {
    await deployer.sendTransaction({
      to: ERC725Account.address,
      value: ethers.utils.parseEther('100'),
    })
  }

  const profile = new ethers.Contract(ERC725Account.address, UniversalProfile.abi, ethers.provider)
  const owner = new ethers.Contract(KeyManager.address, LSP6KeyManager.abi, ethers.provider)

  return [profile, owner]
}
