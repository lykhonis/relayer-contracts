const { ethers } = require('hardhat')

exports.mine = async (blockCount) => {
  // mine blocks with 13 seconds
  await ethers.provider.send('hardhat_mine', [`0x${blockCount.toString(16)}`, '0xd'])
}
