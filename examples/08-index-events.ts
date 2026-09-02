/**
 * Example 08: Index Events
 *
 * Queries historical protocol events for indexing and analytics.
 *
 * Env vars:
 *   RPC_URL             — Robinhood Chain RPC endpoint
 *   FROM_BLOCK          — Starting block number for event queries
 *   CURVE_ADDRESS       — (optional) specific curve to query trades for
 */

import dotenv from "dotenv";
import { createPonsClient, type Address } from "../src/index.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const FROM_BLOCK = process.env.FROM_BLOCK!;
if (!RPC_URL || !FROM_BLOCK) {
  console.error("Set RPC_URL and FROM_BLOCK env vars");
  process.exit(1);
}

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });
  const fromBlock = BigInt(FROM_BLOCK);

  // 1. Get all launches
  console.log("=== Token Launches ===");
  const launches = await pons.events.getLaunches(fromBlock);
  for (const launch of launches.slice(-5)) {
    console.log(
      `  ${launch.token} launched by ${launch.deployer} (block ${launch.blockNumber})`,
    );
  }
  console.log(`  Total: ${launches.length} launches\n`);

  // 2. Get trades on a specific curve (if provided)
  const curveAddress = process.env.CURVE_ADDRESS as Address | undefined;
  if (curveAddress) {
    console.log("=== Curve Trades ===");
    const trades = await pons.events.getTrades(curveAddress, fromBlock);
    for (const trade of trades.slice(-5)) {
      if (trade.type === "buy") {
        console.log(
          `  BUY  ${trade.tokensOut} tokens for ${trade.quoteIn} quote (block ${trade.blockNumber})`,
        );
      } else {
        console.log(
          `  SELL ${trade.tokensIn} tokens for ${trade.quoteOut} quote (block ${trade.blockNumber})`,
        );
      }
    }
    console.log(`  Total: ${trades.length} trades\n`);
  }

  // 3. Get takeover proposals
  console.log("=== Takeover Proposals ===");
  const proposals = await pons.events.getTakeoverProposals(fromBlock);
  for (const proposal of proposals) {
    console.log(
      `  ${proposal.token} -> ${proposal.newRecipient} (effective ${proposal.effectiveAt})`,
    );
  }
  console.log(`  Total: ${proposals.length} proposals\n`);
}

main().catch(console.error);
