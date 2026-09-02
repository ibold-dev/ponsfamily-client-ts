/**
 * Example 07: Read Buyback Vesting
 *
 * Reads the buyback vault's vesting state for a launched token.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   TOKEN_ADDRESS  — Live token contract address (with buybacks enabled)
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

  const vesting = await pons.buyback.getState(TOKEN_ADDRESS as Address);

  console.log("Buyback Vesting State:");
  console.log(`  Total Locked:     ${vesting.totalLocked}`);
  console.log(`  Total Released:   ${vesting.totalReleased}`);
  console.log(`  Vested Amount:    ${vesting.vestedAmount}`);
  console.log(`  Releasable:       ${vesting.releasable}`);
  console.log(`  Vesting Start:    ${vesting.vestingStart}`);
  console.log(`  Vesting Duration: ${vesting.vestingDuration} seconds`);
  console.log(`  Progress:         ${(vesting.progress * 100).toFixed(2)}%`);

  if (vesting.releasable > 0n) {
    console.log(`\n${vesting.releasable} tokens ready to release`);
    // Uncomment to release (requires wallet):
    // const hash = await pons.buyback.release(TOKEN_ADDRESS as Address);
    // console.log(`Released: tx ${hash}`);
  } else {
    console.log("\nNo tokens ready for release yet");
  }
}

main().catch(console.error);
