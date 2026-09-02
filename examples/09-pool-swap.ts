/**
 * Example 09: Pool Operations
 *
 * Interacts with a graduated Uniswap v4 pool — builds pool keys, computes
 * pool IDs, and reads pending fees from the pons hook.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   TOKEN_ADDRESS  — Live token contract address (must be graduated, phase 2)
 */

import dotenv from "dotenv";
import { createPonsClient, type Address } from "../src/index.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
if (!RPC_URL || !TOKEN_ADDRESS) {
  console.error("Set RPC_URL and TOKEN_ADDRESS env vars");
  process.exit(1);
}

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });

  const launch = await pons.factory.getLaunchedToken(TOKEN_ADDRESS as Address);
  if (!launch.exists) {
    console.log("Token not found");
    return;
  }
  if (launch.phase !== 2) {
    console.log(`Launch is in phase ${launch.phase} — not yet graduated`);
    return;
  }

  // Build pool key
  const poolKey = pons.pool.buildPoolKey(launch);
  console.log("Pool Key:");
  console.log(`  Currency 0:   ${poolKey.currency0}`);
  console.log(`  Currency 1:   ${poolKey.currency1}`);
  console.log(`  Fee:          ${poolKey.fee}`);
  console.log(`  Tick Spacing: ${poolKey.tickSpacing}`);
  console.log(`  Hook:         ${poolKey.hooks}`);

  // Compute pool ID
  const poolId = pons.pool.getPoolId(launch);
  console.log(`\nPool ID: ${poolId}`);

  // Read pending fees
  const pendingQuote = await pons.pool.pendingFees(poolId, launch.pairToken);
  const pendingToken = await pons.pool.pendingFees(poolId, launch.token);
  const taxQuote = await pons.pool.pendingCreatorTax(poolId, launch.pairToken);
  const taxToken = await pons.pool.pendingCreatorTax(poolId, launch.token);

  console.log("\nPending Fees:");
  console.log(`  Protocol (quote):  ${pendingQuote}`);
  console.log(`  Protocol (token):  ${pendingToken}`);
  console.log(`  Creator (quote):   ${taxQuote}`);
  console.log(`  Creator (token):   ${taxToken}`);

  // Fee policy
  const policy = await pons.fees.getFeePolicy(TOKEN_ADDRESS as Address);
  console.log("\nFee Policy:");
  console.log(`  Pool Fee: ${policy.hookFeeBps} bps`);
  console.log(`  (Pool charges zero Uniswap fee — the hook charges instead)`);
}

main().catch(console.error);
