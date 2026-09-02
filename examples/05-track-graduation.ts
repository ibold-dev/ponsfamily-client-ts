/**
 * Example 05: Track Graduation Progress
 *
 * Monitors a launch's progress toward graduation by reading its curve
 * state and computing progress percentage.
 */

import { createPonsClient, graduationProgress, marginalPrice, type Address } from "../src/index.js";

const TOKEN_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // Get the launch record from the factory
  const launch = await pons.factory.getLaunchedToken(TOKEN_ADDRESS);

  if (!launch.exists) {
    console.log("Token not found");
    return;
  }

  console.log("Launch Record:");
  console.log(`  Token:           ${launch.token}`);
  console.log(`  Curve:           ${launch.curve}`);
  console.log(`  Pair Token:      ${launch.pairToken}`);
  console.log(`  Phase:           ${launch.phase} (${["NotGraduated", "Swept", "PoolCreated", "Rescued"][launch.phase]})`);
  console.log(`  Creator Tax:     ${launch.creatorTaxBps} bps`);
  console.log(`  Buyback Enabled: ${launch.buybackEnabled}`);
  console.log();

  // Get curve state for progress
  if (launch.phase === 0) {
    const curveState = await pons.curve.getState(launch.curve);

    const price = marginalPrice(
      curveState.reserves.quoteReserve,
      curveState.reserves.tokenReserve,
    );

    const raised = curveState.realQuoteReserve;
    const threshold = curveState.graduationThreshold;
    const progress = graduationProgress(raised, threshold);

    console.log("Bonding Curve:");
    console.log(`  Price:              ${price.toFixed(10)} quote/token`);
    console.log(`  Raised:             ${raised}`);
    console.log(`  Threshold:          ${threshold}`);
    console.log(`  Progress:           ${(progress * 100).toFixed(2)}%`);
    console.log(`  Sellable Tokens:    ${curveState.sellableTokens}`);
    console.log(`  Ready to Graduate:  ${curveState.readyToGraduate}`);
  } else if (launch.phase === 2) {
    console.log("Launch has graduated — trading on Uniswap v4 pool");

    // Build pool key for the graduated pool
    const poolKey = pons.pool.buildPoolKey(launch);
    const poolId = pons.pool.getPoolId(launch);

    console.log("Pool Key:");
    console.log(`  Currency 0:   ${poolKey.currency0}`);
    console.log(`  Currency 1:   ${poolKey.currency1}`);
    console.log(`  Fee:          ${poolKey.fee}`);
    console.log(`  Tick Spacing: ${poolKey.tickSpacing}`);
    console.log(`  Hook:         ${poolKey.hooks}`);
    console.log(`  Pool ID:      ${poolId}`);
  }
}

main().catch(console.error);
