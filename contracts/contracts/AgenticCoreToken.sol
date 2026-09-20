// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title AgenticCore (AC)
/// @notice Fixed-supply BEP-20 token. The entire 2,000,000,000,000 AC supply
/// is minted once, at deployment, split across five destinations passed into
/// the constructor. There is no mint function afterwards -- supply is fixed
/// forever, matching the published tokenomics.
///
/// Destinations (must sum to totalSupply, checked in the constructor):
/// - liquidityWallet     35% -- paired into PancakeSwap, LP tokens locked separately
/// - presaleReceiver     35% -- held by the deployer/owner until transferred to
///                              the Sale contract in a follow-up transaction
///                              (the Sale contract's address isn't known yet
///                              at Token deploy time, so this avoids a
///                              circular constructor dependency)
/// - ecosystemWallet     10%
/// - teamVestingWallet   10% -- an OpenZeppelin VestingWallet instance, deployed separately
/// - marketingVestingWallet 10% -- an OpenZeppelin VestingWallet instance, deployed separately
contract AgenticCoreToken is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 2_000_000_000_000 ether;

    constructor(
        address liquidityWallet,
        address presaleReceiver,
        address ecosystemWallet,
        address teamVestingWallet,
        address marketingVestingWallet
    ) ERC20("AgenticCore", "AC") {
        require(liquidityWallet != address(0), "liquidityWallet is zero");
        require(presaleReceiver != address(0), "presaleReceiver is zero");
        require(ecosystemWallet != address(0), "ecosystemWallet is zero");
        require(teamVestingWallet != address(0), "teamVestingWallet is zero");
        require(marketingVestingWallet != address(0), "marketingVestingWallet is zero");

        uint256 liquidityAmount = (TOTAL_SUPPLY * 35) / 100;
        uint256 presaleAmount = (TOTAL_SUPPLY * 35) / 100;
        uint256 ecosystemAmount = (TOTAL_SUPPLY * 10) / 100;
        uint256 teamAmount = (TOTAL_SUPPLY * 10) / 100;
        uint256 marketingAmount = (TOTAL_SUPPLY * 10) / 100;

        // Integer division above can leave dust; route any into liquidity
        // rather than dropping it, and assert the split is exact before
        // minting a single token.
        uint256 allocated = liquidityAmount + presaleAmount + ecosystemAmount + teamAmount + marketingAmount;
        liquidityAmount += (TOTAL_SUPPLY - allocated);

        _mint(liquidityWallet, liquidityAmount);
        _mint(presaleReceiver, presaleAmount);
        _mint(ecosystemWallet, ecosystemAmount);
        _mint(teamVestingWallet, teamAmount);
        _mint(marketingVestingWallet, marketingAmount);

        assert(totalSupply() == TOTAL_SUPPLY);
    }
}
