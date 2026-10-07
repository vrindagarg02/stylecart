// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OrderVerification {
    mapping(bytes32 => uint256) private recordedAt;
    mapping(bytes32 => bool) private exists;

    event OrderHashRecorded(bytes32 indexed orderHash, uint256 timestamp);

    function recordOrderHash(bytes32 orderHash) external {
        require(!exists[orderHash], "Order hash already recorded");
        exists[orderHash] = true;
        recordedAt[orderHash] = block.timestamp;
        emit OrderHashRecorded(orderHash, block.timestamp);
    }

    function verifyOrderHash(bytes32 orderHash) external view returns (bool, uint256) {
        return (exists[orderHash], recordedAt[orderHash]);
    }
}
