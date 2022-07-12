// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {_INTERFACEID_LSP0} from "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0Constants.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ErrorHandlerLib} from "@erc725/smart-contracts/contracts/utils/ErrorHandlerLib.sol";

contract StakedToken is ERC20, OwnableUnset, ReentrancyGuard {
    event AddedStake(address indexed account, uint256 amount);
    event RemovedStake(address indexed account, uint256 amount);

    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _setOwner(owner);
    }

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Invalid amount");
        require(IERC165(msg.sender).supportsInterface(_INTERFACEID_LSP0), "Invalid recipient");
        _mint(msg.sender, msg.value);
        emit AddedStake(msg.sender, msg.value);
    }

    function unstake() external payable nonReentrant {
        uint256 amount = balanceOf(msg.sender);
        require(amount > 0, "Invalid amount");
        _burn(msg.sender, amount);
        (bool result, bytes memory error) = msg.sender.call{value: amount}("");
        if (!result) {
            ErrorHandlerLib.revertWithParsedError(error);
        }
        emit RemovedStake(msg.sender, amount);
    }
}
