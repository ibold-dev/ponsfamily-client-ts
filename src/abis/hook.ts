import { parseAbi } from "viem";

export const hookAbi = parseAbi([
  // ── Read Functions ───────────────────────────────────────────────────────
  "function pendingFees(bytes32 poolId, address currency) view returns (uint256)",
  "function pendingCreatorTax(bytes32 poolId, address currency) view returns (uint256)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event PoolRegistered(bytes32 indexed poolId, address memecoin, address quoteToken, address creator)",
  "event PoolFeesSwept(bytes32 indexed poolId, uint256 protocolAmount, uint256 buybackAmount, uint256 creatorAmount, uint256 tokensLocked)",
  "event PoolConversionSkipped(bytes32 indexed poolId, uint256 retainedMemecoin)",
  "event PoolBuybackSkipped(bytes32 indexed poolId, uint256 foldedBackQuote)",
]);
