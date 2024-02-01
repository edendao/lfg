// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC20} from "solady/tokens/ERC20.sol";

/// @title LFG
/// @author Cyrus
/// @notice LFG is a meme token for the Farcaster community
///         Let's fucking go! — For degens
///         Let's fucking grow! — For regens
///         Let Farcaster grow! — For all of Farcaster
contract LFG is ERC20 {
    /// @notice A project by TheEdenDao.eth
    address payable public constant owner = payable(address(0x58B36156A268eC1E28aC781554c556E5152f7450));
    /// @notice Each mint receives 69420 tokens
    uint256 public claimAmount = 69420 * 10 ** 18;
    /// @notice Each mint reduces mintable amount by
    uint256 public constant claimAmountDecrement = 3 * 10 ** 18;
    /// @notice Lucky 8888 addresses can mint
    uint16 public claimsAvailable = 8888;
    /// @notice Accounts can only claim once
    mapping(address account => bool) claimed;

    function name() public pure override returns (string memory) {
        return "LFG";
    }

    function symbol() public pure override returns (string memory) {
        return "LFG";
    }

    /// @notice Block direct mints in the UI by only permitting Syndicate's relayers
    error Unauthorized();

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

    error AlreadyClaimed();
    error MaxClaimed();

    function mint(address to) external onlySyndicate {
        if (claimed[to]) revert AlreadyClaimed();
        claimed[to] = true;

        _mint(to, claimAmount);

        // Every mint reduces the next minter's amount by 3
        claimAmount -= claimAmountDecrement;
        if (claimsAvailable-- == 0) revert MaxClaimed();
    }

    /// @notice Withdraws all ETH from the contract to TheEdenDao.eth
    function withdrawETH() external {
        owner.transfer(address(this).balance);
    }

    /// @notice Withdraws all ERC20 tokens from the contract TheEdenDao.eth
    function withdrawERC20(address token) external {
        uint256 currentBalance = ERC20(token).balanceOf(address(this));
        ERC20(token).transfer(owner, currentBalance);
    }
}
