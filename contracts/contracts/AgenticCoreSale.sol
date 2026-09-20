// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgenticCore Sale
/// @notice Handles AC purchases paid in USDT, the 10-level USDT referral
/// payout, and the weekly VIP Pool. Holds the Presale (20%) AC allocation,
/// funded by the deployer in a follow-up transfer after this contract is
/// deployed (see AgenticCoreToken's constructor comment for why).
///
/// Core economics (buy range, referral rates, VIP pool cut, referred-buy AC
/// bonus) are immutable constants, not owner-adjustable, on purpose -- an
/// owner who can change the payout math after launch is exactly what a
/// legitimacy review flags. The only owner-only action is redirecting the
/// treasury address, in case that wallet ever needs rotating.
contract AgenticCoreSale is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable acToken;
    IERC20 public immutable usdt;
    uint256 private immutable usdtScale; // 10 ** usdt.decimals()

    address public treasury;

    // $5-$1000 per wallet, lifetime cumulative, expressed in whole USDT and
    // scaled by usdtScale at use.
    uint256 public constant MIN_BUY_USD = 5;
    uint256 public constant MAX_BUY_USD = 1000;

    // $0.0000001 per AC == 10,000,000 AC per 1 USDT.
    uint256 public constant AC_PER_USDT = 10_000_000;

    // Referral payout in basis points (of the purchase's USDT value), per
    // level: Direct 20%, then 10/5/5/2.5/2.5/2.5/2.5/2.5/2.5, summing to 55%.
    uint16 public constant REFERRAL_LEVELS = 10;
    uint16[REFERRAL_LEVELS] public levelRatesBps = [2000, 1000, 500, 500, 250, 250, 250, 250, 250, 250];

    // A referred buy mints the buyer 10% more AC than the same USD amount
    // would get direct.
    uint16 public constant REFERRED_BONUS_BPS = 1000;

    // 10% of every referred purchase's USDT value is swept into the VIP Pool.
    uint16 public constant VIP_POOL_BPS = 1000;

    // Qualification threshold, via a wallet's own direct-referral sales OR
    // its own personal buy volume -- whichever hits first. Permanent once
    // earned.
    uint256 public constant VIP_QUALIFY_USD = 1000;

    uint256 public constant BPS_DENOMINATOR = 10_000;

    mapping(address => address) public referrerOf;
    mapping(address => uint256) public totalPurchasedUsd;
    mapping(address => uint256) public directReferralSalesUsd;

    // 0 means never qualified. Non-zero is the timestamp qualification was
    // earned -- used to decide eligibility for a given week's payout without
    // needing to iterate any address list.
    mapping(address => uint256) public qualifiedSince;
    uint256 public totalQualifiedCount;

    uint256 public vipPoolBalance;
    uint256 public currentWeekId;
    uint256 public nextPayoutTimestamp;

    mapping(uint256 => uint256) public weekPoolTotal;
    mapping(uint256 => uint256) public weekQualifiedCountAtClose;
    mapping(uint256 => uint256) public weekCloseTimestamp;
    mapping(address => mapping(uint256 => bool)) public hasClaimedWeek;

    event Purchase(
        address indexed buyer,
        address indexed referrer,
        uint256 usdtAmount,
        uint256 acAmount,
        bool referred
    );
    event ReferralPaid(address indexed buyer, address indexed upline, uint8 level, uint256 usdtAmount);
    event VipQualified(address indexed account, uint256 timestamp);
    event VipWeekClosed(uint256 indexed weekId, uint256 poolTotal, uint256 qualifiedCount, uint256 closeTimestamp);
    event VipShareClaimed(address indexed account, uint256 indexed weekId, uint256 usdtAmount);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);

    constructor(
        address initialOwner,
        address acTokenAddress,
        address usdtAddress,
        address treasuryAddress
    ) Ownable(initialOwner) {
        require(acTokenAddress != address(0), "acToken is zero");
        require(usdtAddress != address(0), "usdt is zero");
        require(treasuryAddress != address(0), "treasury is zero");

        acToken = IERC20(acTokenAddress);
        usdt = IERC20(usdtAddress);
        treasury = treasuryAddress;
        usdtScale = 10 ** IERC20Metadata(usdtAddress).decimals();

        nextPayoutTimestamp = _nextSunday5pmUtcAfter(block.timestamp);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "treasury is zero");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @param usdtAmountWhole Purchase amount in whole USDT (e.g. 25 for $25) -- not scaled by decimals, to keep the caller-facing units simple.
    /// @param referrer The address whose referral link was used, if any. Ignored once a referrer is already on record for msg.sender -- first-touch attribution is permanent.
    function buy(uint256 usdtAmountWhole, address referrer) external nonReentrant {
        require(usdtAmountWhole >= MIN_BUY_USD, "below minimum buy");
        require(
            totalPurchasedUsd[msg.sender] + usdtAmountWhole <= MAX_BUY_USD,
            "exceeds wallet cap"
        );

        uint256 usdtAmount = usdtAmountWhole * usdtScale;
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);

        if (referrerOf[msg.sender] == address(0) && referrer != address(0) && referrer != msg.sender) {
            referrerOf[msg.sender] = referrer;
        }
        address ref = referrerOf[msg.sender];
        bool referred = ref != address(0);

        uint256 acAmount = usdtAmountWhole * AC_PER_USDT * 1 ether;
        if (referred) {
            acAmount = (acAmount * (BPS_DENOMINATOR + REFERRED_BONUS_BPS)) / BPS_DENOMINATOR;
        }
        acToken.safeTransfer(msg.sender, acAmount);

        if (referred) {
            _distributeReferredPurchase(usdtAmount, usdtAmountWhole, ref);
        } else {
            usdt.safeTransfer(treasury, usdtAmount);
        }

        totalPurchasedUsd[msg.sender] += usdtAmountWhole;
        _checkVipQualification(msg.sender, totalPurchasedUsd[msg.sender]);

        emit Purchase(msg.sender, ref, usdtAmount, acAmount, referred);
    }

    function _distributeReferredPurchase(uint256 usdtAmount, uint256 usdtAmountWhole, address directRef) private {
        uint256 vipCut = (usdtAmount * VIP_POOL_BPS) / BPS_DENOMINATOR;
        vipPoolBalance += vipCut;

        uint256 distributed = vipCut;
        address upline = directRef;
        for (uint8 level = 0; level < REFERRAL_LEVELS; level++) {
            uint256 levelPayout = (usdtAmount * levelRatesBps[level]) / BPS_DENOMINATOR;
            if (upline == address(0)) {
                // Chain doesn't reach this deep -- route the unclaimed level
                // payout to treasury rather than leaving it stranded.
                usdt.safeTransfer(treasury, levelPayout);
            } else {
                usdt.safeTransfer(upline, levelPayout);
                emit ReferralPaid(msg.sender, upline, level, levelPayout);
                if (level == 0) {
                    directReferralSalesUsd[upline] += usdtAmountWhole;
                    _checkVipQualification(upline, directReferralSalesUsd[upline]);
                }
                upline = referrerOf[upline];
            }
            distributed += levelPayout;
        }

        // Integer division dust from the bps splits above -- send it to
        // treasury rather than leaving it stuck in the contract forever.
        if (distributed < usdtAmount) {
            usdt.safeTransfer(treasury, usdtAmount - distributed);
        }
    }

    function _checkVipQualification(address account, uint256 volumeUsd) private {
        if (qualifiedSince[account] == 0 && volumeUsd >= VIP_QUALIFY_USD) {
            qualifiedSince[account] = block.timestamp;
            totalQualifiedCount += 1;
            emit VipQualified(account, block.timestamp);
        }
    }

    /// @notice Closes the current VIP Pool week once its payout time has
    /// passed, snapshotting the pool total and qualified-member count so it
    /// can be claimed. Callable by anyone -- there's nothing privileged
    /// about triggering it, and it can't be called early.
    function closeCurrentWeek() external nonReentrant {
        require(block.timestamp >= nextPayoutTimestamp, "week not over yet");

        uint256 weekId = currentWeekId;
        weekPoolTotal[weekId] = vipPoolBalance;
        weekQualifiedCountAtClose[weekId] = totalQualifiedCount;
        weekCloseTimestamp[weekId] = block.timestamp;

        emit VipWeekClosed(weekId, vipPoolBalance, totalQualifiedCount, block.timestamp);

        vipPoolBalance = 0;
        currentWeekId += 1;
        nextPayoutTimestamp = _nextSunday5pmUtcAfter(block.timestamp);
    }

    /// @notice Claims the caller's even share of a closed week's VIP Pool.
    /// Eligibility is based on having been qualified before that week
    /// closed -- qualifying afterward doesn't retroactively grant a share
    /// of a pool that already closed.
    function claimVipShare(uint256 weekId) external nonReentrant {
        require(weekId < currentWeekId, "week not closed yet");
        require(!hasClaimedWeek[msg.sender][weekId], "already claimed");
        uint256 since = qualifiedSince[msg.sender];
        require(since != 0 && since <= weekCloseTimestamp[weekId], "not eligible for this week");

        uint256 qualifiedCount = weekQualifiedCountAtClose[weekId];
        require(qualifiedCount > 0, "nothing to claim");

        uint256 share = weekPoolTotal[weekId] / qualifiedCount;
        require(share > 0, "nothing to claim");

        hasClaimedWeek[msg.sender][weekId] = true;
        usdt.safeTransfer(msg.sender, share);

        emit VipShareClaimed(msg.sender, weekId, share);
    }

    function _nextSunday5pmUtcAfter(uint256 ts) internal pure returns (uint256) {
        // Unix epoch day 0 (Jan 1 1970) was a Thursday -- offsetting by 4
        // makes day 0 map to Sunday, so (epochDay + 4) % 7 == 0 on Sundays.
        uint256 epochDay = ts / 1 days;
        uint256 dayOfWeek = (epochDay + 4) % 7;
        uint256 daysUntilSunday = (7 - dayOfWeek) % 7;
        uint256 candidate = epochDay * 1 days + daysUntilSunday * 1 days + 17 hours;
        if (candidate <= ts) {
            candidate += 7 days;
        }
        return candidate;
    }
}
