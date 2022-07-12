// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IRelayContractor {
    function quota(address profile) external view returns (uint256 used, uint256 remaining);

    function submitUsage(address profile, uint256 amount) external;
}
