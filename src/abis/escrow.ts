import { parseAbi } from "viem";

export const escrowAbi = parseAbi([
  // ── Read Functions ───────────────────────────────────────────────────────
  "function balanceOf(address recipient) view returns (uint256)",
  "function balanceOfToken(address recipient, address token) view returns (uint256)",

  // ── Write Functions ──────────────────────────────────────────────────────
  "function claim()",
  "function claimToken(address token)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event Credited(address indexed recipient, address indexed depositor, uint256 amount)",
  "event Claimed(address indexed recipient, uint256 amount)",
  "event CreditedToken(address indexed recipient, address indexed token, address indexed depositor, uint256 amount)",
  "event ClaimedToken(address indexed recipient, address indexed token, uint256 amount)",
]);
