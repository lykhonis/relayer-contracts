// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {IRelayContractor} from "./IRelayContractor.sol";

contract RelayContractor is IRelayContractor, Initializable, OwnableUnset {
    uint256 private constant _BASIS_POINTS = 100_000;

    event OraclesChanged(address previous, address current);

    IERC20 private _rewardToken;
    uint256 private _fee;
    address private _oracles;
    mapping(address => uint256) private _quotaUsed;
    mapping(bytes32 => bool) private _processedTransaction;

    modifier onlyOracles() {
        require(msg.sender == _oracles, "Not oracle");
        _;
    }

    function initialize(
        address owner,
        address oracles,
        address rewardToken,
        uint256 fee_
    ) external initializer {
        _setOwner(owner);
        _fee = fee_;
        _oracles = oracles;
        _rewardToken = IERC20(rewardToken);
    }

    function setOracles(address newOracles) external onlyOwner {
        address previous = _oracles;
        _oracles = newOracles;
        emit OraclesChanged(previous, newOracles);
    }

    function setRewardToken(address newRewardToken) external onlyOwner {
        if (address(_rewardToken) != newRewardToken) {
            _rewardToken = IERC20(newRewardToken);
        }
    }

    function fee() external view returns (uint256) {
        return _fee;
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= _BASIS_POINTS, "Invalid fee");
        if (_fee != newFee) {
            _fee = newFee;
        }
    }

    function quota(address profile) external view override returns (uint256 used, uint256 remaining) {
        uint256 allowance = _rewardToken.allowance(profile, address(this));
        uint256 balance = _rewardToken.balanceOf(profile);
        remaining = allowance > balance ? balance : allowance;
        used = _quotaUsed[profile];
    }

    function submitUsage(
        address profile,
        bytes32 transaction,
        uint256 used
    ) external onlyOracles {
        require(_processedTransaction[transaction] == false, "Already processed");
        _processedTransaction[transaction] = true;
        uint256 serviceFee = (used * _fee) / _BASIS_POINTS;
        _quotaUsed[profile] += used;
        require(_rewardToken.transferFrom(profile, owner(), used + serviceFee), "Did not transfer");
    }
}
