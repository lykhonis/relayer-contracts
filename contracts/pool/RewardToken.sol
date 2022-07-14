// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ErrorHandlerLib} from "@erc725/smart-contracts/contracts/utils/ErrorHandlerLib.sol";

contract RewardToken is ERC20, OwnableUnset, ReentrancyGuard {
    event OraclesChanged(address previous, address current);
    event RewardsUpdated(address indexed account, uint256 amount);
    event RewardsRedeemed(address indexed account, uint256 amount);

    address private _oracles;
    uint256 private _rate;

    modifier onlyOracles() {
        require(msg.sender == _oracles, "Not oracle");
        _;
    }

    constructor(
        address owner,
        address oracles,
        uint256 rate,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _setOwner(owner);
        _oracles = oracles;
        _rate = rate;
    }

    function setOracles(address newOracles) external onlyOwner {
        address previous = _oracles;
        _oracles = newOracles;
        emit OraclesChanged(previous, newOracles);
    }

    function setRate(uint256 newRate) external onlyOracles {
        _rate = newRate;
    }

    function submitRewards(address account, uint256 amount) external onlyOracles {
        _mint(account, amount);
        emit RewardsUpdated(account, balanceOf(account));
    }

    function rewardsRate() external view returns (uint256) {
        return _rate;
    }

    function redeem(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Invalid amount");
        _burn(msg.sender, amount);
        (bool result, bytes memory error) = msg.sender.call{value: amount}("");
        if (!result) {
            ErrorHandlerLib.revertWithParsedError(error);
        }
        emit RewardsRedeemed(msg.sender, amount);
    }
}
