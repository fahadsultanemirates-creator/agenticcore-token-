// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgenticCore Claim
/// @notice One-time free-AC claim for the community join campaign. Funded
/// once with the campaign pool (see deploy notes -- funded from the
/// Ecosystem wallet), then pays itself out with no further owner
/// involvement: each new wallet calls claim() once and receives a fixed AC
/// amount that depends only on how many wallets have already claimed --
/// first 300 get the most, next 300 get less, next 300 get the least. Once
/// 900 wallets have claimed, the campaign is over.
///
/// Amounts are fixed at $2 / $1 / $0.50 worth of AC (at the $0.0000001/AC
/// reference price used elsewhere in this project), so the pool this
/// contract needs funded with up front is exactly 10,500,000,000 AC
/// (300*20,000,000 + 300*10,000,000 + 300*5,000,000), worth $1,050 total.
contract AgenticCoreClaim is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable acToken;

    // Cumulative claim-count boundaries, not per-tier counts: claimsCount
    // (the count *before* the claim being processed) < TIER1_CAP is tier 1,
    // < TIER2_CAP is tier 2, otherwise tier 3.
    uint256 public constant TIER1_CAP = 300;
    uint256 public constant TIER2_CAP = 600;
    uint256 public constant TIER3_CAP = 900;

    uint256 public constant TIER1_AMOUNT = 20_000_000 ether; // $2 worth
    uint256 public constant TIER2_AMOUNT = 10_000_000 ether; // $1 worth
    uint256 public constant TIER3_AMOUNT = 5_000_000 ether; // $0.50 worth

    uint256 public claimsCount;
    bool public ended;
    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed account, uint256 amount, uint256 claimNumber);
    event CampaignEnded();
    event Swept(address indexed to, uint256 amount);

    constructor(address initialOwner, address acTokenAddress) Ownable(initialOwner) {
        require(acTokenAddress != address(0), "acToken is zero");
        acToken = IERC20(acTokenAddress);
    }

    /// @notice Claims this wallet's free AC. One claim per wallet, ever --
    /// enforced here, not just in the dashboard UI. Restricted to real
    /// externally-owned wallets (tx.origin == msg.sender) so a contract
    /// can't automate draining the pool across many addresses in one
    /// transaction; this is a basic deterrent, not a KYC substitute -- it
    /// doesn't stop a person claiming from several separate wallets by hand.
    function claim() external nonReentrant {
        require(!ended, "campaign ended");
        require(msg.sender == tx.origin, "contracts cannot claim");
        require(!hasClaimed[msg.sender], "already claimed");
        require(claimsCount < TIER3_CAP, "campaign ended");

        uint256 amount = _amountForClaimNumber(claimsCount);
        hasClaimed[msg.sender] = true;
        claimsCount += 1;

        acToken.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount, claimsCount);
    }

    function _amountForClaimNumber(uint256 countBeforeThisClaim) private pure returns (uint256) {
        if (countBeforeThisClaim < TIER1_CAP) return TIER1_AMOUNT;
        if (countBeforeThisClaim < TIER2_CAP) return TIER2_AMOUNT;
        return TIER3_AMOUNT;
    }

    /// @notice How much AC the next claim would pay out, and whether the
    /// campaign is still open -- read by the dashboard before showing (or
    /// hiding) the claim button and its amount.
    function nextClaimAmount() external view returns (uint256 amount, bool open) {
        open = !ended && claimsCount < TIER3_CAP;
        amount = open ? _amountForClaimNumber(claimsCount) : 0;
    }

    /// @notice Owner-only early stop, e.g. if abuse is spotted before the
    /// natural 900-claim cutoff. Irreversible, same philosophy as the
    /// Token's anti-whale switch -- a campaign that can be silently turned
    /// back on isn't a real stop.
    function endCampaign() external onlyOwner {
        require(!ended, "already ended");
        ended = true;
        emit CampaignEnded();
    }

    /// @notice Recovers whatever AC is left once the campaign is over
    /// (naturally exhausted or ended early) back to the given address --
    /// normally the Ecosystem wallet -- instead of leaving it stranded here.
    function sweepRemaining(address to) external onlyOwner {
        require(ended || claimsCount >= TIER3_CAP, "campaign still active");
        uint256 balance = acToken.balanceOf(address(this));
        acToken.safeTransfer(to, balance);
        emit Swept(to, balance);
    }
}
