// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

contract RewardToken is ERC20, OwnableUnset {
    event OraclesChanged(address previous, address current);
    event RewardsUpdated(address indexed account, uint256 amount);

    address private _oracles;

    modifier onlyOracles() {
        require(msg.sender == _oracles, "Not oracle");
        _;
    }

    constructor(
        address owner,
        address oracles,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _setOwner(owner);
        _oracles = oracles;
    }

    function setOracles(address newOracles) external onlyOwner {
        address previous = _oracles;
        _oracles = newOracles;
        emit OraclesChanged(previous, newOracles);
    }

    function submitRewards(address account, uint256 amount) external onlyOracles {
        _mint(account, amount);
        emit RewardsUpdated(account, balanceOf(account));
    }
}
