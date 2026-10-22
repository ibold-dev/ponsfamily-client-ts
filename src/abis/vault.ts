import { parseAbi } from "viem";

export const vaultAbi = parseAbi([
  // ── Read Functions ───────────────────────────────────────────────────────
  "function totalLocked(address token) view returns (uint256)",
  "function totalReleased(address token) view returns (uint256)",
  "function vestedAmount(address token) view returns (uint256)",
  "function releasable(address token) view returns (uint256)",
  "function vestingStart(address token) view returns (uint256)",
  "function VESTING_DURATION() view returns (uint256)",

  // ── Write Functions ──────────────────────────────────────────────────────
  "function release(address token) returns (uint256 released)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event Locked(address indexed token, address indexed depositor, uint256 amount, uint256 newVestingStart)",
  "event Released(address indexed token, uint256 creatorAmount, uint256 protocolAmount)",
]);
