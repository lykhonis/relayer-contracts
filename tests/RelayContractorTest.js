const { solidity } = require('ethereum-waffle')
const { expect } = require('chai').use(solidity)
const { ethers, upgrades } = require('hardhat')
const { deployProfile } = require('../tools/common')

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
      oracles.address,
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

    it('should set oracles', async () => {
      await contract.connect(owner).setOracles(alice.address)
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

  it('should not set oracles', async () => {
    await expect(contract.connect(alice).setOracles(alice.address))
      .to.be.revertedWith('not the owner')
  })

  it('should submit usage', async () => {
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

    const ownerBalanceStart = await rewardTokenContract.balanceOf(owner.address)
    const transactionHash = ethers.utils.hexValue(ethers.utils.randomBytes(32))

    await contract.connect(oracles).submitUsage(aliceProfile.address, transactionHash, ethers.utils.parseEther('0.02'))

    const spend = ethers.utils.parseEther('0.02')
      .add(ethers.utils.parseEther('0.02').mul(fee).div(basisPoints))

    expect(await contract.quota(aliceProfile.address)).to.be.deep.eq([
      ethers.utils.parseEther('0.02'),
      ethers.utils.parseEther('2.22').sub(spend),
    ])

    const ownerBalanceEnd = await rewardTokenContract.balanceOf(owner.address)
    expect(ownerBalanceEnd.sub(ownerBalanceStart)).to.be.eq(spend)
  })
})
