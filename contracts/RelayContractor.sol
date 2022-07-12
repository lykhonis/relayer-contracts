// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {IRelayContractor} from "./IRelayContractor.sol";

contract RelayContractor is IRelayContractor, Initializable, OwnableUnset {
    event RewardTokenChanged(address previous, address current);
    event OraclesChanged(address previous, address current);

    IERC20 private _rewardToken;
    address private _oracles;
    mapping(address => uint256) private _quotaUsed;

    modifier onlyOracles() {
        require(msg.sender == _oracles, "Not oracle");
        _;
    }

    function initialize(
        address owner,
        address oracles,
        address rewardToken
    ) external initializer {
        _setOwner(owner);
        _oracles = oracles;
        _rewardToken = IERC20(rewardToken);
    }

    function setRewardToken(address newRewardToken) external onlyOwner {
        if (address(_rewardToken) != newRewardToken) {
            address previous = address(_rewardToken);
            _rewardToken = IERC20(newRewardToken);
            emit RewardTokenChanged(previous, newRewardToken);
        }
    }

    function setOracles(address newOracles) external onlyOwner {
        address previous = _oracles;
        _oracles = newOracles;
        emit OraclesChanged(previous, newOracles);
    }

    function submitUsage(address profile, uint256 amount) external onlyOracles {
        _quotaUsed[profile] += amount;
        _rewardToken.transferFrom(profile, owner(), amount);
    }

    function quota(address profile) external view returns (uint256 used, uint256 remaining) {
        remaining = _rewardToken.allowance(profile, address(this));
        used = _quotaUsed[profile];
    }
}
