const { ethers } = require('hardhat')

exports.encodeRelayCall = async (owner, controller, data) => {
  const { chainId } = await ethers.provider.getNetwork()
  const nonce = await owner.getNonce(controller.address, 0)
  const hash = ethers.utils.solidityKeccak256(
    [
      'uint256',
      'address',
      'uint256',
      'bytes',
    ],
    [
      chainId,
      owner.address,
      nonce,
      data,
    ])
  const signature = await controller.signMessage(ethers.utils.arrayify(hash))
  return {
    signature,
    nonce,
    data,
  }
}
