/**
 * Example 07: Read Buyback Vesting
 *
 * Demonstrates how to read the buyback vault's vesting state for a
 * launched token, including linear release progress over 5 years.
 */

import { createPonsClient, type Address } from "../src/index.js";

const TOKEN_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  const vesting = await pons.buyback.getState(TOKEN_ADDRESS);

  console.log("Buyback Vesting State:");
  console.log(`  Total Locked:     ${vesting.totalLocked}`);
  console.log(`  Total Released:   ${vesting.totalReleased}`);
  console.log(`  Vested Amount:    ${vesting.vestedAmount}`);
  console.log(`  Releasable:       ${vesting.releasable}`);
  console.log(`  Vesting Start:    ${vesting.vestingStart}`);
  console.log(`  Vesting Duration: ${vesting.vestingDuration} seconds`);
  console.log(`  Progress:         ${(vesting.progress * 100).toFixed(2)}%`);

  // Check if there are tokens ready to release
  if (vesting.releasable > 0n) {
    console.log(`\n${vesting.releasable} tokens are ready to release!`);
    // Uncomment to release:
    // const hash = await pons.buyback.release(TOKEN_ADDRESS);
    // console.log(`Released: tx ${hash}`);
  } else {
    console.log("\nNo tokens ready for release yet");
  }
}

main().catch(console.error);
