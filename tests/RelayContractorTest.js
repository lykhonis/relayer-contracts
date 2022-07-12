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
      'Reward Lukso',
      'rLYX',
    )
    await rewardTokenContract.deployed()

    const contractFactory = await ethers.getContractFactory('RelayContractor')
    contract = await upgrades.deployProxy(contractFactory, [
      owner.address,
      oracles.address,
      rewardTokenContract.address,
    ])
    await contract.deployed()
  })

  it('should initialize', async () => {
    expect(await contract.owner()).to.be.eq(owner.address)
  })

  describe('when owner', () => {
    it('should set reward token', async () => {
      await expect(contract.connect(owner).setRewardToken(aliceProfile.address))
        .to.emit(contract, 'RewardTokenChanged').withArgs(rewardTokenContract.address, aliceProfile.address)
    })

    it('should set oracles', async () => {
      await expect(contract.connect(owner).setOracles(aliceProfile.address))
        .to.emit(contract, 'OraclesChanged').withArgs(oracles.address, aliceProfile.address)
    })
  })

  it('should not set reward token', async () => {
    await expect(contract.connect(alice).setRewardToken(aliceProfile.address))
      .to.be.revertedWith('not the owner')
  })

  it('should not set oracles', async () => {
    await expect(contract.connect(alice).setOracles(aliceProfile.address))
      .to.be.revertedWith('not the owner')
  })

  it('should not submit usage', async () => {
    await expect(contract.connect(alice)
      .submitUsage(aliceProfile.address, ethers.utils.parseEther('0.02')))
      .to.be.revertedWith('Not oracle')
  })

  it('should submit usage', async () => {
    await approveRewardTokens(ethers.utils.parseEther('3.42'))
    await rewardTokenContract.connect(oracles).submitRewards(aliceProfile.address, ethers.utils.parseEther('3.42'))
    expect(await rewardTokenContract.balanceOf(aliceProfile.address))
      .to.be.eq(ethers.utils.parseEther('3.42'))
    await contract.connect(oracles)
      .submitUsage(aliceProfile.address, ethers.utils.parseEther('0.02'))
    expect(await rewardTokenContract.balanceOf(aliceProfile.address))
      .to.be.eq(ethers.utils.parseEther('3.4'))
  })

  it('should update quota', async () => {
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
    await contract.connect(oracles)
      .submitUsage(aliceProfile.address, ethers.utils.parseEther('0.22'))
    expect(await contract.quota(aliceProfile.address)).to.be.deep.eq([
      ethers.utils.parseEther('0.22'),
      ethers.utils.parseEther('2'),
    ])
  })
})
