const { solidity } = require('ethereum-waffle')
const { expect } = require('chai').use(solidity)
const { ethers, upgrades } = require('hardhat')
const { deployProfile, encodeRelayCall } = require('../tools/common')

describe('RelayContractor', () => {
  let contract
  let deployer
  let owner
  let oracles
  let alice
  let aliceProfile
  let aliceOwner
  let rewardTokenContract

  const basisPoints = 100_000
  const fee = 10_000 /* 10% */

  const approveRewardTokens = async (amount) => {
    await aliceOwner.connect(alice).execute(
      aliceProfile.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)',
        [
          0,
          rewardTokenContract.address,
          0,
          rewardTokenContract.interface.encodeFunctionData(
            'approve(address,uint256)',
            [
              contract.address,
              amount,
            ],
          ),
        ],
      ),
    )
  }

  beforeEach(async () => {
    [deployer, owner, oracles, alice] = await ethers.getSigners();
    [aliceProfile, aliceOwner] = await deployProfile(deployer, alice)

    const rewardTokenContractFactory = await ethers.getContractFactory('RewardToken')
    rewardTokenContract = await rewardTokenContractFactory.connect(deployer).deploy(
      owner.address,
      oracles.address,
      10000,
      'Reward Lukso',
      'rLYX',
    )
    await rewardTokenContract.deployed()

    const contractFactory = await ethers.getContractFactory('RelayContractor')
    contract = await upgrades.deployProxy(contractFactory, [
      owner.address,
      rewardTokenContract.address,
      fee,
    ])
    await contract.deployed()
  })

  it('should initialize', async () => {
    expect(await contract.owner()).to.be.eq(owner.address)
  })

  describe('when owner', () => {
    it('should set reward token', async () => {
      await contract.connect(owner).setRewardToken(aliceProfile.address)
    })

    it('should set fee', async () => {
      expect(await contract.fee()).to.be.eq(fee)
      await contract.connect(owner).setFee(25_000 /* 25% */)
      expect(await contract.fee()).to.be.eq(25_000)
    })
  })

  it('should not set reward token', async () => {
    await expect(contract.connect(alice).setRewardToken(aliceProfile.address))
      .to.be.revertedWith('not the owner')
  })

  it('should not set fee', async () => {
    await expect(contract.connect(alice).setFee(0))
      .to.be.revertedWith('not the owner')
  })

  it('should execute relay call', async () => {
    await approveRewardTokens(ethers.utils.parseEther('3.33'))
    expect(await contract.quota(aliceProfile.address)).to.be.deep.eq([
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
    ])

    await rewardTokenContract.connect(oracles).submitRewards(aliceProfile.address, ethers.utils.parseEther('2.22'))
    expect(await contract.quota(aliceProfile.address)).to.be.deep.eq([
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('2.22'),
    ])

    const { signature, nonce, data } = await encodeRelayCall(
      aliceOwner,
      alice,
      aliceProfile.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)',
        [
          0,
          rewardTokenContract.address,
          0,
          rewardTokenContract.interface.encodeFunctionData(
            'redeem(uint256)',
            [
              ethers.utils.parseEther('1'),
            ],
          ),
        ],
      ),
    )

    const ownerBalanceStart = await rewardTokenContract.balanceOf(owner.address)

    const gasPrice = await ethers.provider.getGasPrice()
    await expect(
      contract.connect(owner).executeRelayCall(
        aliceOwner.address,
        gasPrice,
        signature,
        nonce,
        data,
      ),
    ).to.emit(contract, 'ExecutedRelayCall')

    const quota = await contract.quota(aliceProfile.address)
    expect(quota.used).to.be.gt(0)

    const ownerBalanceEnd = await rewardTokenContract.balanceOf(owner.address)
    expect(ownerBalanceEnd.sub(ownerBalanceStart))
      .to.be.eq(quota.used.add(quota.used.mul(fee).div(basisPoints)))
  })
})
