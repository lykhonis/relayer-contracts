const { solidity } = require('ethereum-waffle')
const { expect } = require('chai').use(solidity)
const { ethers } = require('hardhat')
const { deployProfile } = require('../../tools/common')

describe('RelayContractor', () => {
  let contract
  let deployer
  let owner
  let beneficiary
  let alice
  let aliceOwner
  let aliceProfile
  let bob

  beforeEach(async () => {
    [deployer, owner, beneficiary, alice, bob] = await ethers.getSigners();
    [aliceProfile, aliceOwner] = await deployProfile(deployer, alice)

    const contractFactory = await ethers.getContractFactory('UniversalPageName')
    contract = await contractFactory.connect(deployer).deploy(
      owner.address,
      beneficiary.address,
      'Universal Page Name',
      'UPN',
    )
    await contract.deployed()
  })

  describe('when owner', () => {
    it('should set owner', async () => {
      await expect(contract.connect(bob).transferOwnership(bob.address)).to.be.revertedWith('not the owner')
      await contract.connect(owner).transferOwnership(bob.address)
      await expect(contract.connect(owner).transferOwnership(bob.address)).to.be.revertedWith('not the owner')
    })
  })

  it('should not set owner', async () => {
    await expect(contract.connect(bob).transferOwnership(bob.address)).to.be.revertedWith('not the owner')
  })
})
