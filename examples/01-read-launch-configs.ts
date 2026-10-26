/**
 * Example 01: Read Launch Configs
 *
 * Lists all currently open launch configurations from the Pons v2 factory.
 *
 * Env vars:
 *   RPC_URL — Robinhood Chain RPC endpoint
 */

import dotenv from "dotenv";
import { createPonsClient } from "../src/index.js";

dotenv.config({path:".env"});

const RPC_URL = process.env.RPC_URL!;
if (!RPC_URL) {
  console.error("Set RPC_URL env var (e.g. https://rpc.mainnet.chain.robinhood.com)");
  process.exit(1);
}

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });

  console.log("Fetching open launch configs...\n");
  const configs = await pons.factory.openLaunchConfigs();

  for (const config of configs) {
    console.log(`Config #${config.id}:`);
    console.log(`  Supply:              ${config.supply}`);
    console.log(`  Curve Fee:           ${config.curveFeeBps} bps`);
    console.log(`  Phantom Quote:       ${config.phantomQuote}`);
    console.log(`  Graduation Threshold: ${config.graduationThreshold}`);
    console.log(`  Pool Fee:            ${config.poolFee}`);
    console.log(`  Tick Spacing:        ${config.tickSpacing}`);
    console.log();
  }

  const fee = await pons.factory.launchFee();
  console.log(`Launch fee: ${fee} wei`);
}

main().catch(console.error);
