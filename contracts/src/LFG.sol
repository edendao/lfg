// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC20} from "solady/tokens/ERC20.sol";

/// @title LFG
/// @author Cyrus
/// @notice LFG is farcaster's degen x regen token
///         Let's fucking go!
///         Let's fucking grow!
contract LFG is ERC20 {
    error AlreadyClaimed();
    error MaxClaimed();
    error Unauthorized();

    address payable public constant owner = payable(address(0x58B36156A268eC1E28aC781554c556E5152f7450));
    uint24 public mintAmount = 69420;
    uint16 public mintsRemaining = 8888;
    mapping(address account => bool) claimed;

    function name() public pure override returns (string memory) {
        return "LFG";
    }

    function symbol() public pure override returns (string memory) {
        return "LFG";
    }

    modifier onlySyndicate() {
        if (
            msg.sender != address(0x3D0263e0101DE2E9070737Df30236867485A5208)
                && msg.sender != address(0x98407Cb54D8dc219d8BF04C9018B512dDbB96caB)
                && msg.sender != address(0xF43A72c1a41b7361728C83699f69b5280161F0A5)
                && msg.sender != address(0x94702712BA81C0D065665B8b0312D87B190EbA37)
                && msg.sender != address(0x10FD71C6a3eF8F75d65ab9F3d77c364C321Faeb5)
        ) {
            revert Unauthorized();
        }

        _;
    }

    function mint(address to) external onlySyndicate {
        if (claimed[to]) revert AlreadyClaimed();
        claimed[to] = true;

        _mint(to, mintAmount * 10 ** decimals());

        // Every mint reduces the next minter's amount by 3
        mintAmount -= 3;
        if (mintsRemaining-- == 0) revert MaxClaimed();
    }

    function withdrawETH() external {
        owner.transfer(address(this).balance);
    }

    function withdrawERC20(address token) external {
        uint256 currentBalance = ERC20(token).balanceOf(address(this));
        ERC20(token).transfer(owner, currentBalance);
    }
}
