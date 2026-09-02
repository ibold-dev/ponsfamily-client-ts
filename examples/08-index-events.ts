/**
 * Example 08: Index Events
 *
 * Demonstrates how to query historical protocol events for indexing
 * and analytics. Covers launch events, trades, fee sweeps, and
 * takeover proposals.
 */

import { createPonsClient, type Address } from "../src/index.js";

const FACTORY_DEPLOY_BLOCK = 0n; // Replace with actual deployment block
const CURVE_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // 1. Get all launches
  console.log("=== Token Launches ===");
  const launches = await pons.events.getLaunches(FACTORY_DEPLOY_BLOCK);
  for (const launch of launches.slice(-5)) {
    // Last 5
    console.log(
      `  ${launch.token} launched by ${launch.deployer} (block ${launch.blockNumber})`,
    );
  }
  console.log(`  Total: ${launches.length} launches\n`);

  // 2. Get trades on a specific curve
  console.log("=== Curve Trades ===");
  const trades = await pons.events.getTrades(
    CURVE_ADDRESS,
    FACTORY_DEPLOY_BLOCK,
  );
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

  // 3. Get takeover proposals
  console.log("=== Takeover Proposals ===");
  const proposals = await pons.events.getTakeoverProposals(
    FACTORY_DEPLOY_BLOCK,
  );
  for (const proposal of proposals) {
    console.log(
      `  ${proposal.token} → ${proposal.newRecipient} (effective ${proposal.effectiveAt})`,
    );
  }
  console.log(`  Total: ${proposals.length} proposals\n`);
}

main().catch(console.error);
