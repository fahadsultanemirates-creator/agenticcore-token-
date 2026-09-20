// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

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
///
/// Anti-whale wallet cap: while active, no non-exempt address can hold more
/// than 1% of supply. This exists specifically to stop one wallet buying up
/// an outsized share the moment a PancakeSwap pool goes live -- the presale
/// itself is already capped per-wallet by AgenticCoreSale, but a DEX trade
/// never goes through that contract, so this is enforced here instead, on
/// every transfer. It's a one-way switch: the owner can turn it off once
/// ready for unrestricted trading, but there is deliberately no function to
/// turn it back on, so it can't become a tool for selectively restricting
/// people later.
contract AgenticCoreToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 2_000_000_000_000 ether;
    uint256 public constant MAX_WALLET_AMOUNT = (TOTAL_SUPPLY * 1) / 100;

    bool public antiWhaleActive = true;
    mapping(address => bool) public isExemptFromWalletCap;

    event AntiWhaleDisabled();
    event WalletCapExemptionUpdated(address indexed account, bool exempt);

    constructor(
        address initialOwner,
        address liquidityWallet,
        address presaleReceiver,
        address ecosystemWallet,
        address teamVestingWallet,
        address marketingVestingWallet
    ) ERC20("AgenticCore", "AC") Ownable(initialOwner) {
        require(liquidityWallet != address(0), "liquidityWallet is zero");
        require(presaleReceiver != address(0), "presaleReceiver is zero");
        require(ecosystemWallet != address(0), "ecosystemWallet is zero");
        require(teamVestingWallet != address(0), "teamVestingWallet is zero");
        require(marketingVestingWallet != address(0), "marketingVestingWallet is zero");

        // Every genesis destination legitimately holds far more than 1% of
        // supply -- exempt them up front so the mint below doesn't trip the
        // cap on itself.
        _setWalletCapExempt(liquidityWallet, true);
        _setWalletCapExempt(presaleReceiver, true);
        _setWalletCapExempt(ecosystemWallet, true);
        _setWalletCapExempt(teamVestingWallet, true);
        _setWalletCapExempt(marketingVestingWallet, true);

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

    /// @notice Permanently turns off the wallet cap. There is no function to
    /// turn it back on.
    function disableAntiWhale() external onlyOwner {
        require(antiWhaleActive, "already disabled");
        antiWhaleActive = false;
        emit AntiWhaleDisabled();
    }

    /// @notice Exempts (or un-exempts) an address from the wallet cap --
    /// needed for addresses that legitimately hold large balances as part of
    /// their normal function, not personal accumulation: the Sale contract
    /// (holds the entire Presale allocation, not known until after this
    /// token is deployed), the eventual PancakeSwap pair address (holds the
    /// whole liquidity pool), or a vesting wallet.
    function setWalletCapExempt(address account, bool exempt) external onlyOwner {
        _setWalletCapExempt(account, exempt);
    }

    function _setWalletCapExempt(address account, bool exempt) private {
        isExemptFromWalletCap[account] = exempt;
        emit WalletCapExemptionUpdated(account, exempt);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (antiWhaleActive && !isExemptFromWalletCap[to]) {
            require(balanceOf(to) + value <= MAX_WALLET_AMOUNT, "exceeds max wallet amount");
        }
        super._update(from, to, value);
    }
}
