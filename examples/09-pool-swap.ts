/**
 * Example 09: Pool Operations
 *
 * Demonstrates how to interact with a graduated Uniswap v4 pool,
 * including building pool keys, computing pool IDs, and reading
 * pending fees from the pons hook.
 */

import { createPonsClient, type Address } from "../src/index.js";

const TOKEN_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // Get the launch record
  const launch = await pons.factory.getLaunchedToken(TOKEN_ADDRESS);

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

  // Read pending fees from the hook
  const pendingQuote = await pons.pool.pendingFees(poolId, launch.pairToken);
  const pendingToken = await pons.pool.pendingFees(poolId, launch.token);
  const taxQuote = await pons.pool.pendingCreatorTax(poolId, launch.pairToken);
  const taxToken = await pons.pool.pendingCreatorTax(poolId, launch.token);

  console.log("\nPending Fees:");
  console.log(`  Protocol (quote):  ${pendingQuote}`);
  console.log(`  Protocol (token):  ${pendingToken}`);
  console.log(`  Creator (quote):   ${taxQuote}`);
  console.log(`  Creator (token):   ${taxToken}`);

  // Get fee policy
  const policy = await pons.fees.getFeePolicy(TOKEN_ADDRESS);
  console.log("\nFee Policy:");
  console.log(`  Pool Fee: ${policy.hookFeeBps} bps`);
  console.log(`  (Pool charges zero Uniswap fee — the hook charges instead)`);
}

main().catch(console.error);
