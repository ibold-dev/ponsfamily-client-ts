import { parseAbi } from "viem";

export const poolManagerAbi = parseAbi([
  // ── Pool Key Struct ──────────────────────────────────────────────────────
  "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",

  // ── Read Functions ───────────────────────────────────────────────────────
  "function getPool(PoolKey key) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFeesToken0, uint24 protocolFeesToken1, uint24 lpFeesToken0, uint24 lpFeesToken1)",
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFeesToken0, uint24 protocolFeesToken1, uint24 lpFeesToken0, uint24 lpFeesToken1)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event Swap(bytes32 indexed poolId, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
  "event Initialize(bytes32 indexed poolId, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)",
]);
