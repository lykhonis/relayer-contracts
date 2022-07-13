// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IRelayContractor {
    function fee() external view returns (uint256);

    function quota(address profile) external view returns (uint256 used, uint256 remaining);

    function executeRelayCall(
        address keyManager,
        uint256 gasPrice,
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) external payable returns (bool success, bytes memory result);
}
