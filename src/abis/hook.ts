import { parseAbi } from "viem";

export const hookAbi = parseAbi([
  // ── Read Functions ───────────────────────────────────────────────────────
  "function pendingFees(bytes32 poolId, address currency) view returns (uint256)",
  "function pendingCreatorTax(bytes32 poolId, address currency) view returns (uint256)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event PoolRegistered(bytes32 indexed poolId, address indexed token, address indexed quoteToken)",
  "event PoolFeesSwept(bytes32 indexed poolId, uint256 quoteFees, uint256 tokenFees, uint256 buybackTokens)",
  "event PoolConversionSkipped(bytes32 indexed poolId, string reason)",
  "event PoolBuybackSkipped(bytes32 indexed poolId, string reason)",
]);
