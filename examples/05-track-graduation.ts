/**
 * Example 05: Track Graduation Progress
 *
 * Monitors a launch's progress toward graduation.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   TOKEN_ADDRESS  — Live token contract address
 */

import dotenv from "dotenv";
import { createPonsClient, graduationProgress, marginalPrice, type Address } from "../src/index.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
if (!RPC_URL || !TOKEN_ADDRESS) {
  console.error("Set RPC_URL and TOKEN_ADDRESS env vars");
  process.exit(1);
}

const PHASE_NAMES = ["NotGraduated", "Swept", "PoolCreated", "Rescued"] as const;

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });

  const launch = await pons.factory.getLaunchedToken(TOKEN_ADDRESS as Address);
  if (!launch.exists) {
    console.log("Token not found");
    return;
  }

  console.log("Launch Record:");
  console.log(`  Token:           ${launch.token}`);
  console.log(`  Curve:           ${launch.curve}`);
  console.log(`  Pair Token:      ${launch.pairToken}`);
  console.log(`  Phase:           ${launch.phase} (${PHASE_NAMES[launch.phase] ?? "Unknown"})`);
  console.log(`  Creator Tax:     ${launch.creatorTaxBps} bps`);
  console.log(`  Buyback Enabled: ${launch.buybackEnabled}`);
  console.log();

  if (launch.phase === 0) {
    const curveState = await pons.curve.getState(launch.curve);
    const price = marginalPrice(curveState.reserves.quoteReserve, curveState.reserves.tokenReserve);
    const progress = graduationProgress(curveState.realQuoteReserve, curveState.graduationThreshold);

    console.log("Bonding Curve:");
    console.log(`  Price:              ${price.toFixed(10)} quote/token`);
    console.log(`  Raised:             ${curveState.realQuoteReserve}`);
    console.log(`  Threshold:          ${curveState.graduationThreshold}`);
    console.log(`  Progress:           ${(progress * 100).toFixed(2)}%`);
    console.log(`  Sellable Tokens:    ${curveState.sellableTokens}`);
    console.log(`  Ready to Graduate:  ${curveState.readyToGraduate}`);
  } else if (launch.phase === 2) {
    console.log("Launch has graduated — trading on Uniswap v4 pool");
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
