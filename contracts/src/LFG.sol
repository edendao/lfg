// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC20} from "solady/tokens/ERC20.sol";

contract LFG is ERC20 {
    error AlreadyClaimed();
    error MaxClaimed();

    uint18 public constant claimAmount = 69_420;
    mapping(address account => bool) claimed;

    function name() public pure override returns (string memory) {
        return "LFG";
    }

    function symbol() public pure override returns (string memory) {
        return "LFG";
    }

    function claim(address account) public {
        // Checks
        if (claimed[account]) revert AlreadyClaimed();
        if (claimAmount-- == 0) revert MaxClaimed();

        // Effects
        claimed[account] = true;

        // Interactions
        _mint(account, claimAmount * 10 ** 18);
    }
}
