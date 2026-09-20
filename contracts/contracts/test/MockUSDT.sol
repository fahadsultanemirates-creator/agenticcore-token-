// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Test-only mock of BEP-20 USDT, with configurable decimals so the
/// Sale contract's decimal-scaling logic is actually exercised rather than
/// assumed correct for the one decimals value we happen to test with.
contract MockUSDT is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(uint8 customDecimals_) ERC20("Mock USDT", "USDT") {
        _customDecimals = customDecimals_;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
