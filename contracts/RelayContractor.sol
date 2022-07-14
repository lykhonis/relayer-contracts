// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ILSP6KeyManager} from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/ILSP6KeyManager.sol";
import {IRelayContractor} from "./IRelayContractor.sol";

contract RelayContractor is IRelayContractor, Initializable, OwnableUnset {
    uint256 private constant _BASIS_POINTS = 100_000;

    event ExecutedRelayCall(address indexed profile, address indexed keyManager, uint256 gasUsed, uint256 gasPrice);

    IERC20 private _rewardToken;
    uint256 private _fee;
    mapping(address => uint256) private _quotaUsed;

    function initialize(
        address owner,
        address rewardToken,
        uint256 fee_
    ) external initializer {
        _setOwner(owner);
        _fee = fee_;
        _rewardToken = IERC20(rewardToken);
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

    function executeRelayCall(
        address keyManager,
        uint256 gasPrice,
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) external payable onlyOwner returns (bool success, bytes memory result) {
        address profile = ILSP6KeyManager(keyManager).target();
        uint256 beginGas = gasleft();
        try ILSP6KeyManager(keyManager).executeRelayCall(signature, nonce, payload) returns (
            bytes memory relayCallResult
        ) {
            success = true;
            result = relayCallResult;
        } catch Error(string memory reason) {
            success = false;
            result = bytes(reason);
        } catch Panic(uint256) {
            success = false;
        } catch (bytes memory reason) {
            success = false;
            result = reason;
        }
        uint256 gasUsed = beginGas - gasleft();
        uint256 feeUsed = gasUsed * gasPrice;
        uint256 feeService = (feeUsed * _fee) / _BASIS_POINTS;
        _quotaUsed[profile] += feeUsed;
        _rewardToken.transferFrom(profile, owner(), feeUsed + feeService);
        emit ExecutedRelayCall(profile, keyManager, gasUsed, gasPrice);
    }
}
