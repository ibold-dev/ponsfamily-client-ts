/**
 * Example 01: Read Launch Configs
 *
 * Lists all currently open launch configurations from the Pons v2 factory.
 * Shows supply, fees, graduation threshold, and pool parameters for each.
 */

import { createPonsClient } from "../src/index.js";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

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

  // Check if a specific address can launch
  const launcher = "0x0000000000000000000000000000000000000001";
  const canLaunch = await pons.factory.canLaunch(launcher);
  console.log(`Address ${launcher} can launch: ${canLaunch}`);

  // Get the launch fee
  const fee = await pons.factory.launchFee();
  console.log(`Launch fee: ${fee} wei`);
}

main().catch(console.error);
