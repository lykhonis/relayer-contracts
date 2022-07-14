// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IRelayContractor {
    event Executed(address profile, bytes32 transaction);

    function fee() external view returns (uint256);

    function quota(address profile) external view returns (uint256 used, uint256 remaining);

    function execute(address profile, bytes32 transaction) external;

    function submitUsage(bytes32 transaction, uint256 used) external;
}
