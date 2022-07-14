const { ethers } = require('ethers')
const StakedToken = require('../build/artifacts/contracts/pool/StakedToken.sol/StakedToken.json')
const RewardToken = require('../build/artifacts/contracts/pool/RewardToken.sol/RewardToken.json')
const UniversalProfile = require('@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json')
const LSP6KeyManager = require('@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json')
const fetch = require('node-fetch')

const dotenv = require('dotenv')
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider('https://rpc.l16.lukso.network')
const controller = new ethers.Wallet(process.env.CONTROLLER_KEY, provider)

const encodeRelayCall = async (owner, controller, data) => {
  const { chainId } = await provider.getNetwork()
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

const main = async () => {
  const stakedToken = new ethers.Contract(
    '0x8B7a2d88c47ec68E34Fad73D33F94d281Ef073ce',
    StakedToken.abi,
    controller,
  )

  const rewardToken = new ethers.Contract(
    '0x07eE2b1135654dC9b83eF72EEA15d1C32C902dD4',
    RewardToken.abi,
    controller,
  )

  const profileContract = new ethers.Contract(process.env.PROFILE_ADDRESS, UniversalProfile.abi, controller)
  const keyManagerContract = new ethers.Contract(process.env.KEYMANAGER_ADDRESS, LSP6KeyManager.abi, controller)

  const relayContractAddress = '0x924d83cbe940D7428Da125394E1978D18d037432'

  // approve spending
  // await keyManagerContract.execute(
  //   profileContract.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)',
  //     [
  //       0,
  //       rewardToken.address,
  //       0,
  //       rewardToken.interface.encodeFunctionData(
  //         'approve',
  //         [
  //           relayContractAddress,
  //           ethers.utils.parseEther('5'),
  //         ],
  //       ),
  //     ],
  //   ),
  //   { gasLimit: 100_000 },
  // )

  console.log(`Balance: ${ethers.utils.formatEther(await rewardToken.balanceOf(profileContract.address))}`)
  console.log(`Allowance: ${ethers.utils.formatEther(await rewardToken.allowance(
    profileContract.address,
    relayContractAddress,
  ))}`)

  const { signature, nonce, data } = await encodeRelayCall(
    keyManagerContract,
    controller,
    profileContract.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)',
      [
        0,
        stakedToken.address,
        ethers.utils.parseEther('0.01'),
        stakedToken.interface.encodeFunctionData(
          'stake',
          [],
        ),
      ],
    ),
  )

  const response = await fetch('http://localhost:3000/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keyManagerAddress: keyManagerContract.address,
      transaction: {
        abi: data,
        nonce,
        signature,
      },
    }),
  })

  console.log(`${response?.status}: ${response?.statusText}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
