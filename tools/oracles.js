const { ethers } = require('ethers')
const RewardToken = require('../build/artifacts/contracts/pool/RewardToken.sol/RewardToken.json')

const dotenv = require('dotenv')
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider('https://rpc.l16.lukso.network')
const oracles = new ethers.Wallet(process.env.ORACLES_KEY, provider)

const main = async () => {
  const rewardToken = new ethers.Contract(
    '0x07eE2b1135654dC9b83eF72EEA15d1C32C902dD4',
    RewardToken.abi,
  )
  await rewardToken.connect(oracles).submitRewards(
    '0x...',
    ethers.utils.parseEther('0.99'),
    {
      gasLimit: 100_000,
    },
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
