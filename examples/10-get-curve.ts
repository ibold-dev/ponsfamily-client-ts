/**
 * Example 10: Get Curve Address from Token
 *
 * Looks up a token address in the factory and prints the full launch record,
 * including the curve address needed for other examples.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   TOKEN_ADDRESS  — Live token contract address
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

const PHASE_NAMES = ["NotGraduated", "Swept", "PoolCreated", "Rescued"] as const;

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });

  const launch = await pons.factory.getLaunchedToken(TOKEN_ADDRESS as Address);
  if (!launch.exists) {
    console.log("Token not found in factory");
    return;
  }

  console.log("=== Launch Record ===");
  console.log(`  Token:           ${launch.token}`);
  console.log(`  Curve:           ${launch.curve}`);
  console.log(`  Deployer:        ${launch.deployer}`);
  console.log(`  Creator Fee:     ${launch.creatorFeeRecipient}`);
  console.log(`  Pair Token:      ${launch.pairToken}`);
  console.log(`  Phase:           ${launch.phase} (${PHASE_NAMES[launch.phase] ?? "Unknown"})`);
  console.log(`  Creator Tax:     ${launch.creatorTaxBps} bps`);
  console.log(`  Buyback Enabled: ${launch.buybackEnabled}`);
  console.log(`  Pool Fee:        ${launch.poolFee}`);
  console.log(`  Tick Spacing:    ${launch.tickSpacing}`);
  console.log();
  console.log("Copy this into your .env:");
  console.log(`CURVE_ADDRESS=${launch.curve}`);
}

main().catch(console.error);
